# Advanced Features Documentation

This document covers all the advanced features added to the AI SaaS platform beyond the core agent and billing system.

## Table of Contents

1. [Usage Analytics Dashboard](#usage-analytics-dashboard)
2. [Team & Workspace Management](#team--workspace-management)
3. [Custom Model Selection](#custom-model-selection)
4. [API Rate Limiting Tiers](#api-rate-limiting-tiers)
5. [Email Notifications](#email-notifications)
6. [Custom Branding](#custom-branding)

---

## Usage Analytics Dashboard

### Overview
Real-time usage analytics providing insights into agent usage patterns, daily trends, and performance metrics.

### Location
`/analytics` - Access from main dashboard

### Features
- **Daily Usage Charts**: Visualize usage trends over the last 30 days
- **Agent Usage Breakdown**: See which agents are used most frequently
- **Summary Statistics**: Quick overview of total requests, most-used agent, and average daily usage
- **Export Data**: Download analytics in CSV format (coming soon)

### Database Tables
- `usage_analytics`: Tracks all metric events
  - `metric_type`: Type of metric (e.g., 'agent_usage', 'credits_used')
  - `metric_value`: Numeric value for the metric
  - `timestamp`: When the metric was recorded

### API Endpoints

#### Get Analytics Data
```bash
GET /api/analytics
```

Response:
```json
{
  "dailyUsage": [
    { "date": "2026-05-15", "usage": 42 }
  ],
  "agentUsage": [
    { "name": "UI Generator", "count": 15 },
    { "name": "Code Debugger", "count": 10 }
  ]
}
```

### Usage in Code
```typescript
import { trackUsageMetric, getUsageAnalytics } from '@/lib/analytics'

// Track a metric
await trackUsageMetric(userId, 'agent_usage', 1, 'ui_generator')

// Get analytics
const analytics = await getUsageAnalytics(userId, 30)
```

---

## Team & Workspace Management

### Overview
Enable collaboration with team members through workspace management. Users can create workspaces, invite team members, and manage permissions.

### Location
`/teams` - Access team management dashboard

### Features
- **Create Workspaces**: Organize projects and agents by workspace
- **Add Team Members**: Invite colleagues with different roles
- **Role-Based Access**: Admin, Editor, Viewer roles with different permissions
- **Workspace Settings**: Configure workspace-specific settings
- **Member Management**: Add/remove members and change roles

### Database Tables

#### Workspaces
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID,
  logo_url TEXT,
  settings JSONB,
  created_at TIMESTAMP
)
```

#### Workspace Members
```sql
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY,
  workspace_id UUID,
  user_id UUID,
  role TEXT, -- 'admin', 'editor', 'viewer'
  created_at TIMESTAMP
)
```

### API Endpoints

#### Create Workspace
```bash
POST /api/workspaces
Content-Type: application/json

{
  "name": "My Project",
  "slug": "my-project"
}
```

#### Get User Workspaces
```bash
GET /api/workspaces
```

#### Add Team Member
```bash
POST /api/workspaces/:id/members
Content-Type: application/json

{
  "email": "colleague@example.com",
  "role": "editor"
}
```

### Usage in Code
```typescript
import { createWorkspace, getUserWorkspaces, addWorkspaceMember } from '@/lib/workspace'

// Create workspace
const workspace = await createWorkspace({
  name: 'Marketing AI',
  slug: 'marketing-ai'
}, userId)

// Get workspaces
const workspaces = await getUserWorkspaces(userId)

// Add member
await addWorkspaceMember(workspaceId, teamMemberId, 'editor')
```

---

## Custom Model Selection

### Overview
Allow users to configure and use custom AI models from different providers. Integrate your own API keys for OpenAI, Anthropic, Groq, and others.

### Location
`/settings` → Model Configuration tab

### Features
- **Multiple Providers**: Support for OpenAI, Anthropic, Groq, Azure, and local models
- **Custom API Keys**: Securely store provider API keys
- **Default Model**: Set a default model for agents
- **Model Switching**: Switch between models without changing agent configuration
- **Provider-Specific Settings**: Configure temperature, max tokens, etc. per provider

### Database Tables

#### Model Configs
```sql
CREATE TABLE model_configs (
  id UUID PRIMARY KEY,
  user_id UUID,
  workspace_id UUID,
  model_name TEXT,
  provider TEXT,
  api_key_encrypted TEXT,
  is_default BOOLEAN,
  created_at TIMESTAMP
)
```

### Supported Models

```typescript
const AVAILABLE_MODELS = [
  { name: 'GPT-4', provider: 'openai' },
  { name: 'GPT-3.5 Turbo', provider: 'openai' },
  { name: 'Claude 3 Opus', provider: 'anthropic' },
  { name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { name: 'Llama 2', provider: 'groq' },
  { name: 'Llama 3', provider: 'groq' },
  { name: 'Mixtral 8x7B', provider: 'groq' },
]
```

### API Endpoints

#### Get User Models
```bash
GET /api/models
```

#### Set Default Model
```bash
POST /api/models/:id/set-default
```

#### Add Custom Model
```bash
POST /api/models
Content-Type: application/json

{
  "model_name": "GPT-4",
  "provider": "openai",
  "api_key_encrypted": "encrypted_key_here"
}
```

### Usage in Code
```typescript
import { getUserModelConfigs, setDefaultModel } from '@/lib/models'

// Get models
const models = await getUserModelConfigs(userId)

// Set default
await setDefaultModel(userId, modelId)
```

---

## API Rate Limiting Tiers

### Overview
Implement API usage limits to prevent abuse and manage server load. Three tiers with increasing limits for different subscription levels.

### Location
`/settings` → API & Rate Limits tab

### Tiers

| Tier | Requests/Min | Requests/Hour | Requests/Day |
|------|--------------|---------------|--------------|
| Free | 10 | 100 | 1,000 |
| Pro | 60 | 1,000 | 10,000 |
| Enterprise | 300 | 10,000 | 100,000 |

### Database Tables

#### Rate Limit Tiers
```sql
CREATE TABLE rate_limit_tiers (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  requests_per_minute INT,
  requests_per_hour INT,
  requests_per_day INT,
  description TEXT
)
```

#### User Rate Limits
```sql
CREATE TABLE user_rate_limits (
  id UUID PRIMARY KEY,
  user_id UUID,
  tier_id UUID,
  created_at TIMESTAMP
)
```

#### Rate Limit Usage
```sql
CREATE TABLE rate_limit_usage (
  id UUID PRIMARY KEY,
  user_id UUID,
  endpoint TEXT,
  request_count INT,
  window_start TIMESTAMP,
  window_type TEXT, -- 'minute', 'hour', 'day'
  created_at TIMESTAMP
)
```

### Implementation

#### Middleware Protection
```typescript
// Protect API routes with rate limiting
import { checkRateLimit, logRateLimitUsage } from '@/lib/rate-limiting'

export async function POST(req: Request) {
  const user = await getUser()
  const canMakeRequest = await checkRateLimit(user.id, '/api/agents')
  
  if (!canMakeRequest) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  await logRateLimitUsage(user.id, '/api/agents')
  
  // Handle request...
}
```

### Usage in Code
```typescript
import { checkRateLimit, logRateLimitUsage, getUserRateLimitTier } from '@/lib/rate-limiting'

// Check if request allowed
const allowed = await checkRateLimit(userId, '/api/agents', 'minute')

// Log usage
await logRateLimitUsage(userId, '/api/agents', 'minute')

// Get current tier
const tier = await getUserRateLimitTier(userId)
```

---

## Email Notifications

### Overview
Configurable email notifications for important events: usage alerts, billing updates, referral rewards, new features, and weekly digest.

### Location
`/settings` → Email Notifications tab

### Notification Types

| Type | Description | Default |
|------|-------------|---------|
| Usage Limit Alert | When approaching credit limit | ✓ Enabled |
| Billing | Subscription changes, invoices | ✓ Enabled |
| Referral | Successful referrals | ✓ Enabled |
| Affiliate Commission | Commission earned | ✓ Enabled |
| Weekly Digest | Usage summary | ✓ Enabled |
| New Features | Product updates | Disabled |

### Database Tables

#### Email Preferences
```sql
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  email_on_usage_limit BOOLEAN DEFAULT TRUE,
  email_on_billing BOOLEAN DEFAULT TRUE,
  email_on_referral BOOLEAN DEFAULT TRUE,
  email_on_affiliate_commission BOOLEAN DEFAULT TRUE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,
  email_on_new_features BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### API Endpoints

#### Get Preferences
```bash
GET /api/settings
```

#### Update Preferences
```bash
POST /api/settings/preferences
Content-Type: application/json

{
  "email_on_usage_limit": true,
  "email_on_billing": true,
  "email_weekly_digest": false
}
```

### Email Service Integration

When setting up email notifications, configure your email provider (SendGrid, Mailgun, AWS SES):

```typescript
// Example: Send notification email
async function sendNotificationEmail(userId: string, type: string) {
  const user = await getUser(userId)
  const preferences = await getEmailPreferences(userId)
  
  if (!preferences[`email_on_${type}`]) return
  
  // Send email using your provider
  await emailProvider.send({
    to: user.email,
    subject: getEmailSubject(type),
    html: getEmailTemplate(type),
  })
}
```

---

## Custom Branding

### Overview
White-label and customize the platform appearance with custom colors, logos, company names, and custom domains.

### Location
`/settings` → Branding tab

### Features
- **Color Scheme**: Customize primary, secondary, and accent colors
- **Logo & Favicon**: Upload custom brand assets
- **Company Name**: Display your company name throughout the app
- **Custom Domain**: Host on your own domain (Enterprise feature)
- **Email Templates**: Branded email notifications
- **White Label**: Complete white-label option available

### Database Tables

#### Branding Config
```sql
CREATE TABLE branding_config (
  id UUID PRIMARY KEY,
  user_id UUID,
  workspace_id UUID,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#FFFFFF',
  accent_color TEXT DEFAULT '#666666',
  logo_url TEXT,
  favicon_url TEXT,
  custom_domain TEXT,
  company_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### API Endpoints

#### Get Branding
```bash
GET /api/settings
```

#### Update Branding
```bash
POST /api/settings/branding
Content-Type: application/json

{
  "primary_color": "#1a1a1a",
  "secondary_color": "#ffffff",
  "accent_color": "#0066cc",
  "company_name": "My Company"
}
```

### Usage in Code
```typescript
import { getBrandingConfig } from '@/lib/branding'

// Get branding
const branding = await getBrandingConfig(userId)

// Apply to CSS
const root = document.documentElement
root.style.setProperty('--primary-color', branding.primary_color)
root.style.setProperty('--secondary-color', branding.secondary_color)
root.style.setProperty('--accent-color', branding.accent_color)
```

---

## Next Steps

- **Mobile App**: React Native app for iOS/Android
- **Webhooks**: Event-driven integrations
- **Advanced Reporting**: Custom report builder
- **SSO Integration**: Enterprise single sign-on
- **API Documentation**: OpenAPI/GraphQL schema
- **Audit Logs**: Complete activity tracking
