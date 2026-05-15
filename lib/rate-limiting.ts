import { createClient } from '@/lib/supabase/server'

export interface RateLimitTier {
  id: string
  name: string
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
}

// Get user rate limit tier
export async function getUserRateLimitTier(userId: string): Promise<RateLimitTier> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_rate_limits')
    .select('rate_limit_tiers(*)')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Default to free tier
    return {
      id: 'free',
      name: 'Free',
      requests_per_minute: 10,
      requests_per_hour: 100,
      requests_per_day: 1000,
    }
  }

  return (data as any).rate_limit_tiers
}

// Check if user can make request
export async function checkRateLimit(userId: string, endpoint: string, window: 'minute' | 'hour' | 'day' = 'minute'): Promise<boolean> {
  const supabase = await createClient()
  const tier = await getUserRateLimitTier(userId)
  
  const now = new Date()
  const windowStart = new Date()
  
  if (window === 'minute') {
    windowStart.setMinutes(windowStart.getMinutes() - 1)
  } else if (window === 'hour') {
    windowStart.setHours(windowStart.getHours() - 1)
  } else {
    windowStart.setDate(windowStart.getDate() - 1)
  }

  const { data, error } = await supabase
    .from('rate_limit_usage')
    .select('request_count')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('window_type', window)
    .gte('window_start', windowStart.toISOString())

  if (error) throw error

  const totalRequests = data?.reduce((sum, item) => sum + item.request_count, 0) || 0
  
  const limits = {
    minute: tier.requests_per_minute,
    hour: tier.requests_per_hour,
    day: tier.requests_per_day,
  }

  return totalRequests < limits[window]
}

// Log request
export async function logRateLimitUsage(userId: string, endpoint: string, window: 'minute' | 'hour' | 'day' = 'minute') {
  const supabase = await createClient()
  
  await supabase
    .from('rate_limit_usage')
    .insert({
      user_id: userId,
      endpoint,
      window_type: window,
      request_count: 1,
    })
}

// Set user rate limit tier
export async function setUserRateLimitTier(userId: string, tierId: string) {
  const supabase = await createClient()
  
  // Delete existing
  await supabase
    .from('user_rate_limits')
    .delete()
    .eq('user_id', userId)

  // Insert new
  const { data, error } = await supabase
    .from('user_rate_limits')
    .insert({
      user_id: userId,
      tier_id: tierId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
