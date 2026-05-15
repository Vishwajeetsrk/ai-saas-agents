import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get daily usage
    const { data: dailyData } = await supabase
      .from('usage_analytics')
      .select('timestamp, metric_value')
      .eq('user_id', user.id)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Get agent usage
    const { data: agentData } = await supabase
      .from('usage_analytics')
      .select('agent_type, metric_value')
      .eq('user_id', user.id)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Process daily usage
    const dailyUsage: Record<string, number> = {}
    dailyData?.forEach((item: any) => {
      const date = new Date(item.timestamp).toISOString().split('T')[0]
      dailyUsage[date] = (dailyUsage[date] || 0) + item.metric_value
    })

    const dailyChartData = Object.entries(dailyUsage)
      .map(([date, usage]) => ({ date, usage }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Process agent usage
    const agentUsage: Record<string, number> = {}
    agentData?.forEach((item: any) => {
      if (item.agent_type) {
        agentUsage[item.agent_type] = (agentUsage[item.agent_type] || 0) + item.metric_value
      }
    })

    const agentChartData = Object.entries(agentUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      dailyUsage: dailyChartData,
      agentUsage: agentChartData,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
