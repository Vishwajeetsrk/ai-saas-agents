import { createClient } from '@/lib/supabase/server'

// Custom model configuration
export interface ModelConfig {
  id: string
  model_name: string
  provider: string
  is_default: boolean
  created_at: string
}

// Get user model configs
export async function getUserModelConfigs(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('model_configs')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as ModelConfig[]
}

// Set default model
export async function setDefaultModel(userId: string, modelId: string) {
  const supabase = await createClient()
  
  // Clear other defaults
  await supabase
    .from('model_configs')
    .update({ is_default: false })
    .eq('user_id', userId)

  // Set new default
  const { data, error } = await supabase
    .from('model_configs')
    .update({ is_default: true })
    .eq('id', modelId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Add custom model
export async function addCustomModel(
  userId: string,
  modelName: string,
  provider: string,
  apiKeyEncrypted: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('model_configs')
    .insert({
      user_id: userId,
      model_name: modelName,
      provider,
      api_key_encrypted: apiKeyEncrypted,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Available models
export const AVAILABLE_MODELS = [
  { name: 'GPT-4', provider: 'openai' },
  { name: 'GPT-3.5 Turbo', provider: 'openai' },
  { name: 'Claude 3 Opus', provider: 'anthropic' },
  { name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { name: 'Llama 2', provider: 'groq' },
  { name: 'Llama 3', provider: 'groq' },
  { name: 'Mixtral 8x7B', provider: 'groq' },
]
