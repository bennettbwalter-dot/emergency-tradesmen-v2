# Emergency Tradesmen Website - Completion Roadmap

## 🌍 GLOBAL CORE SYSTEM
Features shared across both UK and US platforms.

### 🔐 Auth & Security
- ✅ **Authentication**: Protected routes & role-based access (User/Business/Admin) via Supabase Auth
- ✅ **Security**: RLS Policies, Terms of Service, Privacy Policy
- ✅ **GDPR/Compliance**: Cookie Consent banner

### 💳 Payments & Monetization
- ✅ **Stripe Integration**: Connect accounts, payment links, and webhooks
- ✅ **Subscription Logic**: `subscriptionService.ts` handles tier upgrades/downgrades
- ✅ **Business Verification**: "Claim Business" flow with document upload

### 🛠️ Core Tech Stack
- ✅ **Frontend**: React, Tailwind, ShadCN, Lucide Icons
- ✅ **Backend**: Supabase (Postgres, Edge Functions, Storage)
- ✅ **Email**: EmailOctopus / SendGrid integration
- ✅ **Analytics**: Google Analytics 4 (G-N9VVX26Z2R)

---

## 🇬🇧 UK MARKET (LAUNCHED)
**Status:** MVP / Live Beta
**Domain:** emergency-tradesmen.com.au (Note: domain suggests AU but content is UK-focused)

### ✅ COMPLETED (UK)
- **Data Coverage**: 10,000+ populated businesses across major UK cities
- **Search**: City + Trade filtering
- **SEO**: Dynamic sitemaps, region-specific landing pages
- **User Features**: Dashboard, Favorites, Comparison Tool
- **Admin**: Full admin dashboard for managing UK listings

### 🚀 UK PRIORITIES (Next Steps)
1. **Business Onboarding**:
   - [ ] actively recruit first 50 verified businesses
   - [ ] Manual verification of claimed profiles
2. **Review Generation**:
   - [ ] Campaign to get initial user reviews
   - [ ] Import more Google Maps reviews for social proof

---

## 🇺🇸 US MARKET (EXPANSION)
**Status:** **IN PROGRESS (Data Enrichment Phase)**
**Domain:** emergencytradesmen.com

### 🏗️ WORK IN PROGRESS (US)
- **Data Enrichment**:
  - [x] **State-Level Structure**: Created 50 state pages and major city routes
  - [🔄] **Batch Enrichment Script**: Running `scripts/batch_enrich_us.py` to source plumbers/electricians
  - [🔄] **Suburb Expansion**: Expanding from major metros to surrounding suburbs (Targeting high-density areas first)
- **SEO & Content**:
  - [ ] Generate "Emergency Plumber [City]" pages for all 50 states
  - [ ] Adjust copy for US terminology (Zip codes vs Postcodes, "HVAC" vs "Boilers")

### 📝 US BACKLOG (To-Do)
1. **US Data Validation**:
   - [ ] Audit phone number formats (clean +1 codes)
   - [ ] Verify address formats for US standards
2. **Legal & Compliance**:
   - [ ] US specific Terms of Service (CCPA compliance)
   - [ ] Update tax settings in Stripe for US Sales Tax

---

## 🛠️ SHARED TECHNICAL DEBT & OPTIMIZATION

### High Priority
- [ ] **Image Optimization**: Excessive load times on gallery images. Need to implement Next.js Image or better Supabase transforms.
- [ ] **Mobile Performance**: improve CLS (Content Layout Shift) on mobile menu load.
- [ ] **Error Handling**: Add Sentry for frontend error tracking.

### Future / Nice-to-Have
- [ ] **AI Triage Chatbot**: Fine-tune for "Emergency vs Routine" classification
- [ ] **Native Mobile App**: Wrapper for iOS/Android stores (Capacitor/Expo)

---

## 📊 ESTIMATED TIMELINE (REVISED)

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | UK MVP Launch | ✅ **DONE** |
| **Phase 2** | Global Tech Foundation | ✅ **DONE** |
| **Phase 3** | US Data Population | 🔄 **IN PROGRESS** (Est. completion: Feb 15) |
| **Phase 4** | US Soft Launch | 📅 Targeted March 1 |

**Current Focus:**
Running `batch_enrich_us.py` to fill US database gaps while maintaining UK stability.
