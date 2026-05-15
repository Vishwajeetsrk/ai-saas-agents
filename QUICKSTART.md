# Quick Start Guide

## 1. Get Your API Keys (5 min)

### Supabase
1. Go to https://supabase.com
2. Create new project (Choose PostgreSQL)
3. Go to Settings → API Keys
4. Copy: `Project URL` and `Anon Key`
5. Go to Settings → Database → Connection pooling
6. Copy: `Pooled Connection String`

### Stripe
1. Go to https://stripe.com/dashboard
2. Navigate to API keys
3. Copy: `Secret Key` and `Publishable Key`
4. Create webhook endpoint at `YOUR_DOMAIN/api/webhooks/stripe`
5. Copy: `Webhook Signing Secret`

### Groq
1. Go to https://console.groq.com
2. Create API key
3. Copy: `API Key`

## 2. Set Environment Variables (2 min)

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTGRES_URL=your_postgres_url
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
GROQ_API_KEY=your_groq_key
```

## 3. Install & Run (3 min)

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

## 4. Test the Platform (5 min)

1. Click "Sign Up" on landing page
2. Create account with email/password
3. You should see:
   - Dashboard with 100 free credits
   - Access to 2 agents (Analyzer, Debugger)
4. Navigate to "Agent Playground"
5. Try the Analyzer agent with sample code
6. Check your credits deducted
7. Try "Billing" page to see plans

## 5. Deploy to Vercel (2 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## What You Can Do Now

### Free User
- Sign up (100 free credits)
- Access 2 agents (Analyzer, Debugger)
- Use agents with credits
- See agent usage history
- Share referral code
- Earn 50 credits per referral

### Paid User
- Subscribe to Pro ($29/month)
- Access all 7 agents
- 1,000 credits per month
- Join affiliate program
- Earn commissions

### Agents Available
1. **Analyzer** (25 credits) - Analyzes code structure
2. **Debugger** (40 credits) - Finds and explains bugs
3. **Suggester** (30 credits) - Recommends improvements
4. **UI Generator** (50 credits) - Creates React components
5. **API Generator** (50 credits) - Generates backend code
6. **DB Optimizer** (45 credits) - Optimizes queries
7. **Documentation** (35 credits) - Creates documentation

## Troubleshooting

### "Database not found" error
- Check POSTGRES_URL is correct
- Verify Supabase project is created
- Try restarting `pnpm dev`

### "Stripe API error"
- Verify STRIPE_SECRET_KEY is correct
- Check webhook secret is correct
- Ensure webhook endpoint is reachable

### "Invalid Groq API key"
- Verify GROQ_API_KEY format
- Check key is not expired
- Ensure Mixtral 8x7b model is available in your Groq account

### "Agent returns no output"
- Check input text is provided
- Verify credits are available
- Check console for API errors

## Next Steps

1. **Customize Agents**: Edit `lib/agents/types.ts` to modify agent names/costs
2. **Change Pricing**: Update `billing_plans` in Supabase dashboard
3. **Add Analytics**: Uncomment PostHog integration
4. **Deploy**: Push to GitHub and connect to Vercel
5. **Monitor**: Check Supabase dashboard for user data
6. **Scale**: Set up caching, CDN, monitoring

## Files to Know

| File | Purpose |
|------|---------|
| `SETUP.md` | Detailed setup guide |
| `IMPLEMENTATION.md` | Architecture overview |
| `lib/agents/types.ts` | Agent configuration |
| `lib/config.ts` | Platform config |
| `lib/billing.ts` | Payment logic |
| `lib/growth.ts` | Referral/affiliate logic |
| `app/dashboard/page.tsx` | Main dashboard |
| `app/agents/page.tsx` | Agent playground |

## Support

- Check documentation in `/docs` folder
- Review API contracts in `lib/api-contracts.ts`
- See example code in component files
- Check Supabase logs for database issues

You're ready to go! The platform is fully functional with all features working.
