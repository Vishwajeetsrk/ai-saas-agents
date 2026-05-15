import { createClient } from '@/lib/supabase/server';
import { AgentRequest, AgentResponse, AGENT_CONFIGS } from '@/lib/agents/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

async function callGroqAPI(
  systemPrompt: string,
  userMessage: string,
): Promise<{ output: string; inputTokens: number; outputTokens: number }> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  const output = data.choices[0].message.content;
  const usage = data.usage;

  return {
    output,
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
  };
}

export async function processAgentRequest(
  request: AgentRequest,
): Promise<AgentResponse> {
  try {
    const config = AGENT_CONFIGS[request.agentType];
    if (!config) {
      return {
        success: false,
        creditsUsed: 0,
        error: 'Invalid agent type',
      };
    }

    const supabase = await createClient();

    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('user_credits')
      .select('credits, used_credits')
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        creditsUsed: 0,
        error: 'Could not fetch user credits',
      };
    }

    const availableCredits = userData.credits - userData.used_credits;
    if (availableCredits < config.creditsRequired) {
      return {
        success: false,
        creditsUsed: 0,
        error: `Insufficient credits. Required: ${config.creditsRequired}, Available: ${availableCredits}`,
      };
    }

    // Call AI API
    const { output, inputTokens, outputTokens } = await callGroqAPI(
      config.systemPrompt,
      request.input,
    );

    // Log usage
    await supabase.from('agent_usage').insert({
      user_id: request.userId,
      agent_type: request.agentType,
      credits_used: config.creditsRequired,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      status: 'completed',
      result_summary: output.substring(0, 200),
    });

    // Deduct credits
    await supabase
      .from('user_credits')
      .update({
        used_credits: userData.used_credits + config.creditsRequired,
      })
      .eq('user_id', request.userId);

    return {
      success: true,
      output,
      creditsUsed: config.creditsRequired,
      inputTokens,
      outputTokens,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI Agent Error]', errorMessage);

    return {
      success: false,
      creditsUsed: 0,
      error: errorMessage,
    };
  }
}
