'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    email_on_usage_limit: true,
    email_on_billing: true,
    email_on_referral: true,
    email_on_affiliate_commission: true,
    email_weekly_digest: true,
    email_on_new_features: false,
  })

  const [branding, setBranding] = useState({
    primary_color: '#000000',
    secondary_color: '#FFFFFF',
    accent_color: '#666666',
    company_name: '',
  })

  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data.preferences) setPreferences(data.preferences)
        if (data.branding) setBranding(data.branding)
        if (data.models) setModels(data.models)
      } catch (error) {
        console.error('[v0] Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })
      alert('Preferences saved successfully')
    } catch (error) {
      console.error('[v0] Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBranding = async () => {
    setLoading(true)
    try {
      await fetch('/api/settings/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      })
      alert('Branding saved successfully')
    } catch (error) {
      console.error('[v0] Failed to save branding:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 border-b border-gray-800 pb-6">Settings</h1>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="notifications">Email Notifications</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="models">Custom Models</TabsTrigger>
            <TabsTrigger value="api">API & Rate Limits</TabsTrigger>
          </TabsList>

          {/* Email Preferences */}
          <TabsContent value="notifications">
            <Card className="bg-gray-900 border-gray-800 p-6 mt-6">
              <h2 className="text-xl font-bold mb-6">Email Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'email_on_usage_limit', label: 'Usage Limit Alerts' },
                  { key: 'email_on_billing', label: 'Billing Notifications' },
                  { key: 'email_on_referral', label: 'Referral Rewards' },
                  { key: 'email_on_affiliate_commission', label: 'Affiliate Commissions' },
                  { key: 'email_weekly_digest', label: 'Weekly Digest' },
                  { key: 'email_on_new_features', label: 'New Features' },
                ].map((pref) => (
                  <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(preferences as any)[pref.key]}
                      onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>{pref.label}</span>
                  </label>
                ))}
              </div>
              <Button onClick={handleSavePreferences} disabled={loading} className="mt-6 bg-white text-black hover:bg-gray-200">
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </Card>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="branding">
            <Card className="bg-gray-900 border-gray-800 p-6 mt-6">
              <h2 className="text-xl font-bold mb-6">Custom Branding</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Company Name</label>
                  <Input
                    value={branding.company_name}
                    onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="Your Company"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'primary_color', label: 'Primary Color' },
                    { key: 'secondary_color', label: 'Secondary Color' },
                    { key: 'accent_color', label: 'Accent Color' },
                  ].map((color) => (
                    <div key={color.key}>
                      <label className="block text-sm mb-2">{color.label}</label>
                      <input
                        type="color"
                        value={(branding as any)[color.key]}
                        onChange={(e) => setBranding({ ...branding, [color.key]: e.target.value })}
                        className="w-full h-10 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveBranding} disabled={loading} className="mt-6 bg-white text-black hover:bg-gray-200">
                {loading ? 'Saving...' : 'Save Branding'}
              </Button>
            </Card>
          </TabsContent>

          {/* Models */}
          <TabsContent value="models">
            <Card className="bg-gray-900 border-gray-800 p-6 mt-6">
              <h2 className="text-xl font-bold mb-6">Custom Model Configuration</h2>
              <div className="text-gray-400">
                <p>Configure custom AI models for specialized use cases. Add your own API keys for providers like OpenAI, Anthropic, or Groq.</p>
                <Button className="mt-6 bg-white text-black hover:bg-gray-200">Add Custom Model</Button>
              </div>
            </Card>
          </TabsContent>

          {/* API */}
          <TabsContent value="api">
            <Card className="bg-gray-900 border-gray-800 p-6 mt-6">
              <h2 className="text-xl font-bold mb-6">API & Rate Limits</h2>
              <div className="space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded p-4">
                  <h3 className="font-semibold mb-2">Current Rate Limit Tier: Pro</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 60 requests per minute</li>
                    <li>• 1,000 requests per hour</li>
                    <li>• 10,000 requests per day</li>
                  </ul>
                </div>
                <div>
                  <Button className="bg-white text-black hover:bg-gray-200">Generate API Key</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
