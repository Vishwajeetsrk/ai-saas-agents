# AI SaaS Platform - Complete Implementation Guide

## Overview

This is a production-ready AI SaaS platform featuring:
- 7 autonomous AI agents (Analyzer, Suggester, UI Generator, API Generator, Debugger, DB Optimizer, Documentation Generator)
- Complete billing system with Stripe integration
- Free and Pro subscription plans
- Credit-based usage system
- Referral and affiliate programs
- Neo-brutalist UI design

## Environment Variables Required

### Supabase (Database & Auth)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTGRES_URL=your_postgres_url
SUPABASE_JWT_SECRET=your_jwt_secret
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### AI Provider (Groq recommended for speed)
```
GROQ_API_KEY=your_groq_api_key
```

### Application
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema

The platform includes tables for:
- `profiles` - User profiles
- `billing_plans` - Subscription plans (Free/Pro)
- `subscriptions` - Active user subscriptions
- `credit_packages` - Credit purchase options
- `user_credits` - Credit allocation and usage tracking
- `agent_usage` - AI agent usage logs
- `referrals` - Referral program data
- `affiliates` - Affiliate program data
- `affiliate_transactions` - Commission tracking
- `api_keys` - User API key management
- `stripe_webhooks` - Webhook event logs

All tables have Row-Level Security (RLS) enabled for security.

## Architecture

### Frontend
- Next.js 16 (App Router)
- Shadcn/ui components
- Tailwind CSS (Neo-brutalism design)
- Zustand for state management
- SWR for data fetching

### Backend
- Next.js API routes
- Supabase for database and authentication
- Stripe for payments
- Groq API for AI inference

### Key Features

#### AI Agents (7 types)
Each agent has configurable credit costs:
- Analyzer (25 credits) - Code analysis
- Suggester (30 credits) - Improvement recommendations
- UI Generator (50 credits) - React component generation
- API Generator (50 credits) - Backend code generation
- Debugger (40 credits) - Code debugging
- DB Optimizer (45 credits) - Query optimization
- Documentation Generator (35 credits) - Documentation creation

#### Billing
- Free Plan: 100 credits/month, 2 agents
- Pro Plan: $29/month, 1,000 credits, all agents
- Credit Packages: 1K/5K/15K credits available for purchase
- Automatic credit allocation per billing cycle

#### Growth Systems
- Referral Program: Share code, earn 50 credits per successful referral
- Affiliate Program: Earn 20% on subscriptions, 15% on credit packages
- Affiliate tracking via URL parameters and commission tracking

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Create Supabase Project
- Create a new Supabase project
- The database schema is automatically applied via migrations
- Enable email confirmation (optional for production)

### 3. Configure Stripe
- Create a Stripe account and get API keys
- Set up webhook endpoint at `/api/webhooks/stripe`
- Configure webhook events: customer.subscription.*, charge.succeeded

### 4. Get Groq API Key
- Sign up at console.groq.com
- Create an API key for the Mixtral 8x7b model

### 5. Set Environment Variables
- Add all environment variables to `.env.local`
- For production, add to Vercel project settings

### 6. Deploy
```bash
vercel deploy
```

## Usage Flow

### Free User → Pro Conversion
1. Free user signs up → 100 free credits allocated
2. User can use 2 agents (Analyzer, Debugger)
3. User subscribes to Pro plan via Stripe
4. Subscription webhook creates Pro subscription record
5. User immediately gets 1,000 credits for new billing cycle
6. All 7 agents become available

### Credit Usage
1. User selects agent in playground
2. Agent API call is made with user input
3. Credits are deducted from user_credits table
4. Usage is logged in agent_usage table
5. When credits reach limit, user sees warning

### Referral Redemption
1. User B receives referral code from User A
2. User B signs up with referral code
3. Both users get 50 bonus credits
4. Referral status updated to "redeemed"

### Affiliate Tracking
1. Affiliate generates affiliate code
2. Customer visits with ?aff=CODE parameter
3. When customer converts (subscription/credits), commission is recorded
4. Affiliate commissions tracked in affiliate_transactions table

## Security Features

### Row-Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only see their own data
- Admins can't access other users' credits
- Referral data is private to participants
- API keys are only readable by owner

### API Security
- Supabase service role key for backend operations
- Stripe webhook signature verification
- User ID validation on all API endpoints
- Credit deduction in transaction (no race conditions)

### Authentication
- Supabase Auth with email/password
- Session managed via secure cookies
- Middleware protects dashboard routes
- Auto-profile creation on signup via trigger

## Monitoring & Analytics

### Available Metrics
- agent_usage table tracks all agent calls
- user_credits table shows credit allocation
- subscriptions table tracks conversion funnel
- affiliate_transactions table tracks revenue
- stripe_webhooks table logs all payment events

## Customization

### Add New Agent
1. Add agent type to AGENT_CONFIGS in `lib/agents/types.ts`
2. Configure name, description, credits, and system prompt
3. Agent automatically appears in playground

### Modify Credit Costs
Edit AGENT_CONFIGS in `lib/agents/types.ts` and update creditsRequired

### Change Plan Limits
Update billing_plans table via Supabase dashboard or migration

## Troubleshooting

### "Insufficient credits" error
- Check user_credits table for available credits
- Verify billing cycle dates are current
- Check if subscription is active

### Webhook not processing
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook endpoint URL is reachable
- Review stripe_webhooks table for failed events

### Agent not responding
- Verify GROQ_API_KEY is set
- Check Groq API rate limits
- Review console logs for API errors

## Next Steps

1. Set up PostHog for analytics (already imported)
2. Add email notifications for credit warnings
3. Implement invoice generation
4. Add affiliate dashboard with charts
5. Set up automated credit refills for subscriptions
6. Add payment method management
7. Implement support ticket system
