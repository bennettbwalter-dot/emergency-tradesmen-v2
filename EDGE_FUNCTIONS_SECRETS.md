# Supabase Edge Functions Secrets

These must be set via `supabase secrets set` for each function, NOT in .env files.

## stripe-webhook
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## create-portal-session
```
STRIPE_SECRET_KEY=sk_live_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## send-email
```
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## process-voice
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## fetch-jit-listings
```
YELP_API_KEY=your_yelp_key
HERE_API_KEY=your_here_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## email-orchestrator
```
EMAIL_SERVICE_PROVIDER_API_KEY=your_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## mailmeteor-webhook
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
