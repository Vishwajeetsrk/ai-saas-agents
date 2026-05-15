import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [prefs, branding] = await Promise.all([
      supabase.from('email_preferences').select('*').eq('user_id', user.id).single(),
      supabase.from('branding_config').select('*').eq('user_id', user.id).single(),
    ])

    return NextResponse.json({
      preferences: prefs.data,
      branding: branding.data,
    })
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
