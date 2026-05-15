import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Workspace types
export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
})

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>

// Create workspace
export async function createWorkspace(data: CreateWorkspaceInput, userId: string) {
  const supabase = await createClient()
  
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert({
      name: data.name,
      slug: data.slug,
      owner_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return workspace
}

// Get user workspaces
export async function getUserWorkspaces(userId: string) {
  const supabase = await createClient()
  
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*, workspace_members(user_id)')
    .or(`owner_id.eq.${userId},workspace_members(user_id).eq.${userId}`)

  if (error) throw error
  return workspaces
}

// Add workspace member
export async function addWorkspaceMember(workspaceId: string, userId: string, role: string = 'member') {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get workspace members
export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*, profiles(display_name, avatar_url)')
    .eq('workspace_id', workspaceId)

  if (error) throw error
  return data
}
