// Configuration validation and helper utilities
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'GROQ_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
    console.error('See .env.example for configuration template');
    return false;
  }

  return true;
}

export const AGENT_CREDIT_COSTS = {
  analyzer: 25,
  suggester: 30,
  'ui-generator': 50,
  'api-generator': 50,
  debugger: 40,
  'db-optimizer': 45,
  documentation: 35,
} as const;

export const BILLING_CONFIG = {
  free: {
    monthlyCredits: 100,
    maxAgents: 2,
  },
  pro: {
    monthlyCredits: 1000,
    maxAgents: 7,
    monthlyPrice: 29,
  },
} as const;

export const AFFILIATE_CONFIG = {
  subscriptionCommission: 0.2, // 20%
  creditPurchaseCommission: 0.15, // 15%
  minWithdrawalAmount: 50,
} as const;

export const REFERRAL_CONFIG = {
  bonusCreditsPerReferral: 50,
  bonusCreditsOnSignup: 50,
} as const;

export const RATE_LIMITS = {
  agentCalls: {
    perMinute: 10,
    perHour: 100,
  },
  checkoutCalls: {
    perHour: 5,
  },
} as const;
