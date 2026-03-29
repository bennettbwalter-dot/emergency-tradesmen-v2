-- Seed Data for Blog Posts
-- Run this in the Supabase SQL Editor to publish your first 3 articles.

INSERT INTO posts (title, slug, content, excerpt, cover_image, published, published_at)
VALUES 
(
  '5 Signs You Need an Emergency Plumber Immediately', 
  '5-signs-you-need-emergency-plumber', 
  '# 5 Signs You Need an Emergency Plumber Immediately

Water damage is one of the most expensive disasters a homeowner can face. While a dripping tap can wait until morning, some plumbing issues require immediate professional attention. Here are the 5 definitive signs you need to call an emergency plumber right now.

## 1. Burst Pipes
A burst pipe can flood your home in minutes. 
**Action**: Turn off your main stopcock immediately and call a professional. Do not wait.

## 2. No Water
If you have lost water pressure completely and it is not a neighborhood outage, you may have a serious blockage or burst main.

## 3. Sewage Smell
A foul smell coming from your drains usually indicates a blockage in the sewer line. This is a health hazard and needs urgent attention.

## 4. Frozen Pipes
In winter, frozen pipes are a ticking time bomb. If you see frost on your pipes or no water comes out, call a plumber to thaw them safely before they crack.

## 5. Boiler Failure in Winter
If you have vulnerable people in the house (elderly or children), a broken boiler in freezing temperatures is an emergency.

---
**Need help now?** [Find an Emergency Plumber near you](/emergency-plumber/london).',
  'Water damage waits for no one. Learn the 5 critical signs that mean you need to pick up the phone and call an emergency plumber right now.',
  'https://images.unsplash.com/photo-1581242163695-19d0acacd486?q=80&w=800&auto=format&fit=crop',
  true,
  NOW()
),
(
  'How We Verify Every Tradesperson on Our Platform', 
  'how-we-verify-tradespeople', 
  '# How We Verify Every Tradesperson on Our Platform

Trust is the most important currency in the emergency trades business. When you are letting a stranger into your home at 2 AM, you need to know they are legitimate.

## Our 5-Step Verification Process

1.  **Identity Check**: We verify the ID of the business owner.
2.  **Insurance Verification**: We ensure every "Featured" business has valid Public Liability Insurance.
3.  **Address Confirmation**: We verify that they are actually local to the area they serve.
4.  **Review Audit**: We cross-reference their Google Maps reviews to ensure they are consistent and real.
5.  **Test Calls**: We randomly "mystery shop" our tradespeople to ensure they answer their phones and are polite.

## Why This Matters
"Cowboy" tradesmen thrive in emergencies because customers are paniocked. By using **Emergency Tradesmen**, you are adding a layer of safety between you and the wild west of the internet.

---
**Are you a verified pro?** [Join our network today](/business/claim).',
  'Trust is everything. Discover the rigorous 5-step process we use to ensure every tradesperson on our platform is legitimate, insured, and crucial.',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
  true,
  NOW() - INTERVAL '1 day'
),
(
  'Emergency Locksmith Costs in London (2025 Guide)', 
  'emergency-locksmith-costs-london-2025', 
  '# Emergency Locksmith Costs in London (2025 Guide)

Locked out? The first question everyone asks is: *"How much is this going to cost?"*

## Average Price Breakdown

| Service | Day Rate (8am-6pm) | Night Rate (6pm-8am) |
|---------|-------------------|----------------------|
| **Call Out Fee** | £0 - £49 | £59 - £89 |
| **Gain Entry (Standard)** | £69 - £89 | £89 - £120 |
| **Gain Entry (Complex)** | £99+ | £120+ |
| **New Lock (Rim Cylinder)**| £25 | £25 |
| **New Lock (Mortice)** | £45+ | £45+ |

## Factors That Affect Price
1.  **Time of Day**: 2 AM is always more expensive than 2 PM.
2.  **Type of Lock**: A high-security anti-snap lock costs more to drill/replace than a standard Yale lock.
3.  **Damage**: Non-destructive entry is the goal, but if a lock must be drilled, you pay for the replacement.

## Warning: The £49 "Bait and Switch"
Beware of ads promising "£49 Locksmith". This is often just the "call out fee", and they will add £200+ for labour once they arrive. 

**Our Promise**: All tradespeople on Emergency Tradesmen are encouraged to give clear, upfront pricing before starting work.

---
**Locked out right now?** [Find a trusted London Locksmith](/emergency-locksmith/london).',
  'Don''t get ripped off. We break down the real costs of hiring an emergency locksmith in London for 2025, including day vs night rates.',
  'https://images.unsplash.com/photo-1558211583-03ed8a0b3d5f?q=80&w=800&auto=format&fit=crop',
  true,
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (slug) DO UPDATE 
SET content = EXCLUDED.content, 
    cover_image = EXCLUDED.cover_image,
    excerpt = EXCLUDED.excerpt;
