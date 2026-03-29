# Developer Access & Environment Guide

## ⚠️ ASSUMED PRODUCTION ENVIRONMENT
**Do not ask for these details. They are already set up and active.**

- **Hosting**: Cloudflare Pages (`emergencytradesmen.net`)
- **Database**: Supabase (`antqstrspkchkoylysqa`)
- **Payments**: Stripe Live Mode (Monthly/Yearly Subscriptions Active)
- **Email**: SendGrid / Custom SMTP (Active via `sendEmail` utility)
- **Analytics**: GA4 (`G-N9VVX26Z2R`)

## Quick Setup for Premium Testing

Since the auto-creation is having schema issues, here's the **manual method** to get premium access:

### Option 1: SQL Script (Recommended)

1. **Log into Supabase Dashboard:** https://supabase.com/dashboard
2. Go to your project → **SQL Editor**
3. Copy and paste the contents of `scripts/create-dev-business.sql`
4. Click **Run**
5. You should see: `Business created successfully with ID: dev-business-...`

### Option 2: Table Editor (Visual)

1. Go to Supabase Dashboard → **Table Editor**
2. Open the `businesses` table
3. Click **Insert row**
4. Fill in these fields:
   - `id`: `dev-test-manual`
   - `slug`: `dev-test-business`
   - `owner_user_id`: (Your user UUID - get from `auth.users` table)
   - `name`: `Developer Test Business`
   - `trade`: `electrician`
   - `city`: `London`
   - `email`: `bennett.b.walter@gmail.com`
   - `phone`: `07700900000`
   - `is_premium`: `true`
   - `tier`: `paid`
   - `verified`: `true`
   - `hours`: `24/7 Emergency Service`
   - `is_open_24_hours`: `true`
5. Click **Save**

### Verify It Worked

1. Navigate to http://localhost:3003/premium-profile
2. You should now see the **Premium Profile Editor** (not the "No business" error)
3. You can upload images, add descriptions, etc.

### Developer Bypass Features

Your email (`bennett.b.walter@gmail.com`) already has:
- ✅ Subscription check bypass (no payment needed)
- ✅ Premium plan access (Enterprise tier)
- ✅ "Premium Active" badge on dashboard
- ✅ All premium features unlocked

You just needed the business record to exist in the database!
