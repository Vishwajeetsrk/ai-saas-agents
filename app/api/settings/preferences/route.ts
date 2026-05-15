import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prefs = await req.json()

    const { data, error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: user.id,
        ...prefs,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
