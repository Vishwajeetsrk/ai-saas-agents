import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserWorkspaces } from '@/lib/workspace'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaces = await getUserWorkspaces(user.id)
    return NextResponse.json(workspaces)
  } catch (error) {
    console.error('Workspaces error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug } = await req.json()

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name,
        slug,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Workspace creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
