'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AnalyticsDashboard() {
  const [dailyData, setDailyData] = useState([])
  const [agentData, setAgentData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        const data = await response.json()
        setDailyData(data.dailyUsage || [])
        setAgentData(data.agentUsage || [])
      } catch (error) {
        console.error('[v0] Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading analytics...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 border-b border-gray-800 pb-6">Usage Analytics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Usage Chart */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Daily Usage (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#fff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Agent Usage Chart */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Agent Usage Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Bar dataKey="count" fill="#fff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold">{dailyData.reduce((sum: number, day: any) => sum + (day.usage || 0), 0)}</p>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Most Used Agent</h3>
            <p className="text-3xl font-bold">
              {agentData.length > 0 ? agentData[0].name : 'N/A'}
            </p>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Avg Daily Usage</h3>
            <p className="text-3xl font-bold">
              {dailyData.length > 0 ? Math.round(dailyData.reduce((sum: number, day: any) => sum + (day.usage || 0), 0) / dailyData.length) : 0}
            </p>
          </Card>
        </div>
      </div>
    </main>
  )
}
