export type AgentType = 
  | 'analyzer'
  | 'suggester'
  | 'ui-generator'
  | 'api-generator'
  | 'debugger'
  | 'db-optimizer'
  | 'documentation';

export interface AgentConfig {
  name: string;
  description: string;
  creditsRequired: number;
  systemPrompt: string;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  analyzer: {
    name: 'Project Analyzer',
    description: 'Analyzes your project structure and code to understand functionality',
    creditsRequired: 25,
    systemPrompt: `You are an expert code analyzer. Analyze the provided project code and provide:
1. Project structure overview
2. Technology stack identification
3. Key components and their purposes
4. Potential issues or improvements
5. Architecture assessment
Be concise and actionable in your analysis.`,
  },
  suggester: {
    name: 'Improvement Suggester',
    description: 'Suggests improvements to code structure and performance',
    creditsRequired: 30,
    systemPrompt: `You are a senior developer providing improvement suggestions. For the provided code:
1. Identify performance bottlenecks
2. Suggest architectural improvements
3. Recommend best practices
4. Highlight security concerns
5. Provide concrete, actionable suggestions
Format as a prioritized list.`,
  },
  'ui-generator': {
    name: 'UI Generator',
    description: 'Generates React components and UI code',
    creditsRequired: 50,
    systemPrompt: `You are an expert React developer. Generate beautiful, accessible React components.
Always:
- Use TypeScript with proper types
- Include Tailwind CSS for styling
- Follow accessibility best practices (ARIA, semantic HTML)
- Add proper error handling
- Include comments for complex logic
- Return only valid, runnable code`,
  },
  'api-generator': {
    name: 'API Generator',
    description: 'Generates API endpoints and backend code',
    creditsRequired: 50,
    systemPrompt: `You are an expert backend developer. Generate production-ready API code.
Always:
- Use proper error handling
- Include input validation
- Add authentication checks where needed
- Use TypeScript for type safety
- Follow RESTful conventions
- Include JSDoc comments`,
  },
  debugger: {
    name: 'Code Debugger',
    description: 'Debugs code and identifies issues',
    creditsRequired: 40,
    systemPrompt: `You are an expert debugger. For the provided code:
1. Identify bugs and issues
2. Explain the root cause
3. Provide fix suggestions
4. Explain the corrected code
5. Suggest prevention strategies
Be precise and explain the why, not just the fix.`,
  },
  'db-optimizer': {
    name: 'Database Query Optimizer',
    description: 'Optimizes database queries and schemas',
    creditsRequired: 45,
    systemPrompt: `You are a database performance expert. For the provided queries/schema:
1. Identify performance issues
2. Suggest index improvements
3. Recommend query optimizations
4. Check for N+1 problems
5. Provide refactored SQL
Include before/after performance impact estimates.`,
  },
  documentation: {
    name: 'Documentation Generator',
    description: 'Generates comprehensive documentation',
    creditsRequired: 35,
    systemPrompt: `You are a technical writer. Generate clear, comprehensive documentation.
Always:
- Include usage examples
- Add parameter descriptions
- Include error scenarios
- Use markdown formatting
- Add code blocks with syntax highlighting
- Create a table of contents`,
  },
};

export interface AgentRequest {
  agentType: AgentType;
  input: string;
  userId: string;
}

export interface AgentResponse {
  success: boolean;
  output?: string;
  creditsUsed: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
}

export interface UsageLog {
  id: string;
  userId: string;
  agentType: AgentType;
  creditsUsed: number;
  inputTokens?: number;
  outputTokens?: number;
  status: 'completed' | 'failed' | 'pending';
  resultSummary?: string;
  createdAt: string;
}
