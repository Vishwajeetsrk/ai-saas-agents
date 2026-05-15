import { createClient } from '@/lib/supabase/server'

export interface UsageMetric {
  id: string
  metric_type: string
  metric_value: number
  agent_type?: string
  timestamp: string
}

// Track usage metric
export async function trackUsageMetric(
  userId: string,
  metricType: string,
  metricValue: number = 1,
  agentType?: string
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('usage_analytics')
    .insert({
      user_id: userId,
      metric_type: metricType,
      metric_value: metricValue,
      agent_type: agentType,
      timestamp: new Date().toISOString(),
    })

  if (error) throw error
}

// Get usage analytics
export async function getUsageAnalytics(userId: string, days: number = 30) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('usage_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data as UsageMetric[]
}

// Get agent usage summary
export async function getAgentUsageSummary(userId: string) {
  const analytics = await getUsageAnalytics(userId, 30)
  
  const summary: Record<string, number> = {}
  for (const metric of analytics) {
    if (metric.agent_type) {
      summary[metric.agent_type] = (summary[metric.agent_type] || 0) + metric.metric_value
    }
  }
  
  return summary
}

// Get daily usage stats
export async function getDailyUsageStats(userId: string, days: number = 30) {
  const analytics = await getUsageAnalytics(userId, days)
  
  const stats: Record<string, number> = {}
  for (const metric of analytics) {
    const date = new Date(metric.timestamp).toISOString().split('T')[0]
    stats[date] = (stats[date] || 0) + metric.metric_value
  }
  
  return stats
}
