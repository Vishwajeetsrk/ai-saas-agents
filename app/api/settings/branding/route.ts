import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const branding = await req.json()

    const { data, error } = await supabase
      .from('branding_config')
      .upsert({
        user_id: user.id,
        ...branding,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Branding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
