/**
 * API Request/Response Types Documentation
 * 
 * This file documents all API contracts for external integrations
 */

// ============================================================================
// AGENT API
// ============================================================================

/** Execute an AI agent */
export interface AgentRequest {
  agentType: 'analyzer' | 'suggester' | 'ui-generator' | 'api-generator' | 'debugger' | 'db-optimizer' | 'documentation';
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

// Usage:
// POST /api/agents
// Body: AgentRequest
// Response: AgentResponse

// ============================================================================
// CHECKOUT API
// ============================================================================

/** Create a checkout session */
export interface CheckoutRequest {
  userId: string;
  type: 'subscription' | 'credits';
  planId?: string; // For subscriptions
  packageId?: string; // For credit packages
}

export interface CheckoutResponse {
  url: string; // Stripe checkout URL
}

// Usage:
// POST /api/checkout
// Body: CheckoutRequest
// Response: CheckoutResponse

// ============================================================================
// REFERRAL API
// ============================================================================

/** Redeem a referral code */
export interface RedeemReferralRequest {
  referralCode: string;
  userId: string;
}

export interface RedeemReferralResponse {
  success: boolean;
  bonusCredits?: number;
}

// Usage:
// POST /api/referrals/redeem
// Body: RedeemReferralRequest
// Response: RedeemReferralResponse

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

// Stripe Webhook Events (sent to /api/webhooks/stripe)
// 
// Event: customer.subscription.created
// Event: customer.subscription.updated
// Event: customer.subscription.deleted
// Event: charge.succeeded
//
// These are automatically handled and update the database

// ============================================================================
// DATABASE QUERIES (Server-side only)
// ============================================================================

// User Credits
// SELECT * FROM user_credits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1

// User Subscriptions
// SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active'

// Agent Usage History
// SELECT * FROM agent_usage WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50

// Referral Data
// SELECT * FROM referrals WHERE referrer_id = $1 OR referred_user_id = $1

// Affiliate Data
// SELECT * FROM affiliates WHERE user_id = $1

// Affiliate Transactions
// SELECT * FROM affiliate_transactions WHERE affiliate_id = $1 ORDER BY created_at DESC

// ============================================================================
// CLIENT-SIDE HOOKS & STATE
// ============================================================================

// useCreditsStore - Zustand state
// - credits: number
// - usedCredits: number
// - getAvailableCredits(): number
// - deductCredits(amount: number): boolean
// - setCredits(credits: number): void

// useUserStore - Zustand state
// - userId: string | null
// - plan: 'free' | 'pro' | null
// - setUser(userId: string, plan: 'free' | 'pro'): void
// - logout(): void

// useAgentStore - Zustand state
// - isLoading: boolean
// - output: string
// - error: string | null
// - setLoading(loading: boolean): void
// - setOutput(output: string): void
// - setError(error: string | null): void
// - clearOutput(): void

// ============================================================================
// ERROR HANDLING
// ============================================================================

// API errors follow this format:
// {
//   error: string,
//   statusCode?: number
// }

// Common errors:
// - "Missing required fields" (400)
// - "Insufficient credits" (400)
// - "Invalid referral code" (400)
// - "Internal server error" (500)
// - "Webhook processing failed" (500)
// - "Failed to create checkout session" (500)

// ============================================================================
// RATE LIMITS
// ============================================================================

// Recommended rate limits:
// - Agent calls: 10 per minute, 100 per hour per user
// - Checkout: 5 per hour per user
// - Webhook: No limit (Stripe rate-limited)

// ============================================================================
// AUTHENTICATION
// ============================================================================

// All requests require:
// - Valid Supabase session (via cookie)
// - For API routes with userId: User must be authenticated in same session

// Middleware: middleware.ts
// - Protects /dashboard routes
// - Refreshes session tokens
// - Redirects unauthenticated users to /auth/login

// ============================================================================
// MONITORING & LOGGING
// ============================================================================

// Key tables to monitor:
// 1. agent_usage - Track AI agent usage patterns
// 2. stripe_webhooks - Check payment event processing
// 3. affiliate_transactions - Monitor commission accuracy
// 4. user_credits - Verify credit allocation
// 5. subscriptions - Track conversion funnel

// ============================================================================
// EXAMPLE INTEGRATION: Frontend Agent Call
// ============================================================================

// const response = await fetch('/api/agents', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     agentType: 'analyzer',
//     input: '// paste code here',
//     userId: user.id,
//   }),
// });
//
// const data: AgentResponse = await response.json();
// if (data.success) {
//   console.log('Agent output:', data.output);
//   console.log('Credits used:', data.creditsUsed);
// } else {
//   console.error('Agent error:', data.error);
// }

// ============================================================================
// EXAMPLE INTEGRATION: Checkout
// ============================================================================

// const response = await fetch('/api/checkout', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     userId: user.id,
//     type: 'subscription',
//     planId: planId,
//   }),
// });
//
// const { url }: CheckoutResponse = await response.json();
// window.location.href = url; // Redirect to Stripe checkout
