# AI SaaS Agents Platform

A production-ready AI SaaS platform with autonomous agents, billing system, credit-based pricing, and growth mechanisms built with Next.js 16, Supabase, Stripe, and Groq AI.

## Features

### 🤖 Seven Autonomous AI Agents
- **Project Analyzer** (25 credits) - Analyze project structure and architecture
- **Improvement Suggester** (30 credits) - Suggest code and architecture improvements
- **UI Generator** (50 credits) - Generate React/Next.js components
- **API Generator** (50 credits) - Generate REST/GraphQL APIs
- **Code Debugger** (40 credits) - Debug and fix code issues
- **Database Query Optimizer** (45 credits) - Optimize SQL queries
- **Documentation Generator** (35 credits) - Generate project documentation

### 💳 Billing & Payments
- **Free Plan**: 100 credits/month, 2 agents
- **Pro Plan**: $29/month, 1,000 credits, all agents
- Credit packages: 1,000 | 5,000 | 15,000 credits
- Real-time usage tracking
- Automatic billing cycles
- Stripe integration with webhooks

### 📈 Growth Systems
- **Referral Program**: Share referral code, earn 50 credits per signup
- **Affiliate Program**: 20% commission on subscriptions, 15% on credit packages
- Affiliate tracking via URL parameters
- Commission dashboard

### 🔒 Security
- Supabase Auth with session management
- Row-Level Security (RLS) on all database tables
- Protected routes with middleware
- API key management
- CSRF/CORS protection

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Auth**: Supabase Auth with session cookies
- **Payments**: Stripe with webhooks
- **AI**: Groq API for LLM inference
- **State**: Zustand for client state
- **Data Fetching**: SWR for caching
- **Forms**: React Hook Form with Zod validation

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Vishwajeetsrk/ai-saas-agents
cd ai-saas-agents
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
GROQ_API_KEY=your-groq-api-key
```

### 3. Database Setup

The Supabase schema is automatically set up via migrations. If needed, run manually:

```bash
# Using Supabase CLI
supabase db push
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── dashboard/page.tsx          # Main dashboard
├── agents/page.tsx             # Agent playground
├── billing/page.tsx            # Billing management
├── referrals/page.tsx          # Referral dashboard
├── affiliates/page.tsx         # Affiliate program
├── auth/                       # Authentication pages
└── api/
    ├── agents/route.ts         # Agent API
    ├── checkout/route.ts       # Stripe checkout
    ├── referrals/redeem/route.ts
    └── webhooks/stripe/route.ts

lib/
├── agents/                     # Agent infrastructure
├── supabase/                   # Supabase clients
├── billing.ts                  # Payment logic
├── growth.ts                   # Referral/affiliate logic
├── store.ts                    # Zustand state
├── api-contracts.ts            # API documentation
└── config.ts                   # Configuration

middleware.ts                   # Route protection
```

## Database Schema

### Core Tables
- `profiles` - User metadata
- `subscriptions` - Active subscriptions
- `user_credits` - Credit allocation and usage
- `agent_usage` - Agent request logs
- `billing_plans` - Plan definitions
- `credit_packages` - Credit package offerings

### Growth Tables
- `referrals` - Referral tracking
- `referral_codes` - Unique referral codes
- `affiliates` - Affiliate accounts
- `affiliate_transactions` - Commission tracking

### Integration Tables
- `stripe_webhooks` - Webhook event logs
- `api_keys` - User API keys

All tables use Row-Level Security (RLS) policies.

## API Routes

### Agent API
```
POST /api/agents
- Accepts: { agent_type, input, project_context? }
- Returns: Streaming response with agent output
- Requires: Authentication + sufficient credits
```

### Billing API
```
POST /api/checkout
- Creates Stripe checkout session
- Returns: { sessionId, url }
```

### Referral API
```
POST /api/referrals/redeem
- Redeems referral code
- Grants: 50 bonus credits
```

### Stripe Webhooks
```
POST /api/webhooks/stripe
- Handles: subscription created, updated, deleted, payment succeeded
- Updates: user credits, subscription status
```

See `lib/api-contracts.ts` for complete API documentation.

## Configuration

### Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Subscribe to events: `customer.subscription.*`, `charge.succeeded`

### Groq Setup
1. Get API key from [Groq Console](https://console.groq.com)
2. Add to `.env.local`

### Supabase Setup
See `SETUP.md` for detailed configuration.

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard.

### Docker

```bash
docker build -t ai-saas-agents .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... ai-saas-agents
```

## Development

### Format Code
```bash
pnpm format
```

### Lint
```bash
pnpm lint
```

### Build
```bash
pnpm build
```

### Run Tests
```bash
pnpm test
```

## Documentation

- **QUICKSTART.md** - 15-minute setup guide
- **SETUP.md** - Detailed configuration
- **IMPLEMENTATION.md** - Architecture overview
- **lib/api-contracts.ts** - Complete API documentation

## Security Considerations

- All user data is protected with RLS policies
- Sessions use HTTP-only cookies
- Passwords hashed with bcrypt
- API routes validate authentication
- Stripe webhook signature verification
- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS configured for security

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT - See LICENSE file

## Support

- **Issues**: [GitHub Issues](https://github.com/Vishwajeetsrk/ai-saas-agents/issues)
- **Docs**: Check SETUP.md and IMPLEMENTATION.md
- **Questions**: Open a Discussion

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Team/workspace support
- [ ] Custom model selection
- [ ] API rate limiting tiers
- [ ] Usage analytics
- [ ] Email notifications
- [ ] Mobile app
- [ ] Custom branding options

---

Built with Next.js 16 • Supabase • Stripe • Groq AI
