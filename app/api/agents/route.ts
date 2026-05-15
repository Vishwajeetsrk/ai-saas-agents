import { NextRequest, NextResponse } from 'next/server';
import { processAgentRequest } from '@/lib/agents/processor';
import { AgentRequest } from '@/lib/agents/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, input, userId } = body as AgentRequest;

    if (!agentType || !input || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await processAgentRequest({
      agentType,
      input,
      userId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Agent API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
