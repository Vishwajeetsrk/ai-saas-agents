'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TeamsPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces')
        const data = await response.json()
        setWorkspaces(data)
      } catch (error) {
        console.error('[v0] Failed to fetch workspaces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-bold">Teams & Workspaces</h1>
          <Button onClick={() => setShowCreateModal(true)} className="bg-white text-black hover:bg-gray-200">
            Create Workspace
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-400">Loading workspaces...</p>
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-4">No workspaces yet</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-white text-black hover:bg-gray-200">
              Create Your First Workspace
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws: any) => (
              <Card key={ws.id} className="bg-gray-900 border-gray-800 p-6 hover:border-gray-600 cursor-pointer">
                <h3 className="text-lg font-bold mb-2">{ws.name}</h3>
                <p className="text-sm text-gray-400 mb-4">@{ws.slug}</p>
                <div className="flex gap-2">
                  <Link href={`/workspaces/${ws.id}`}>
                    <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
