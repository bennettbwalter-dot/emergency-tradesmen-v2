import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const content = `
## Introduction: The "Blow-Out" Effect

It's Wednesday, February 25th. The fierce winter storms that have battered both the US East Coast and the UK are technically subsiding, but the high wind warnings remain active. In the middle of the night, a loose tree branch, a piece of flying debris, or simply an overwhelming gust of localized pressure hits your home. 

You hear a concussive *bang*, followed by the unmistakable, terrifying sound of shattering glass.

![Shattered window during a storm - Internal pressure risk](/blog/windows/storm-shattered-window.png)

A broken window during a severe weather event is not just an inconvenience—it is a critical structural compromise. When a window fails during high winds, it allows pressurized air to violently enter your home. This sudden change in internal pressure creates what engineers call the "blow-out" effect, which can literally lift your roof off its trusses or blow out windows on the opposite side of the house.

This master guide covers the immediate triage steps you must take when glass shatters, why DIY cardboard fixes will fail, and exactly what to expect when you call for [emergency board up services near you](https://emergencytradesmen.net/).

---

## Why a Broken Window is a Structural Emergency

Most homeowners assume a broken window is merely a security risk or a slight temperature inconvenience. During a storm, the reality is much more dangerous.

### 1. Internal Pressurization
Homes are designed as sealed envelopes. When wind hits the outside of your house, the structure resists it. But if a window breaks, that high-velocity wind enters the living room, significantly increasing the pressure inside the house while the wind blowing *over* the roof creates a localized vacuum (low pressure). This upward suction, combined with the extreme upward pressure from inside, is the number one cause of roof failure during hurricanes and severe winter gales.

### 2. The Projectile Threat
When double-pane or older annealed glass shatters, it doesn't break cleanly. It creates "daggers"—large, heavy shards of glass that can be blown across a room at 40+ miles per hour. This is a lethal hazard to anyone inside the room.

### 3. Immediate Water Ingress
Even a hairline crack allows wind-driven rain to infiltrate your wall cavities. Once water enters the space between your drywall and exterior cladding, it destroys the R-value of your insulation and provides the perfect environment for toxic black mold to bloom within 48 hours.

---

## Triage: Immediate Safety Steps

If a window breaches in the middle of a storm, your first priority is securing your family, not saving the living room rug.

### 1. Isolate the Room Immediately
Get everyone out of the room. Close the interior door to that room immediately. By shutting the door, you compartmentalize the internal air pressure, preventing the "blow-out" effect from tearing through the rest of the house and compromising the roof.

### 2. Put on Hard-Soled Shoes
Do not walk into the room barefoot or in socks to investigate. Glass shards can travel up to 20 feet from the impact site. Put on heavy work boots or thick-soled shoes before crossing the threshold.

### 3. DO NOT Tape a Shattered Window
A common myth is that you should run duct tape across a cracked or shattering window in an "X" pattern. **Do not do this.** Tape will not provide structural integrity against 60mph winds. All it does is encourage the glass to break in larger, heavier, and more dangerous chunks when it finally fails.

![Duct tape failure on a broken window - Professional board-up required](/blog/windows/duct-tape-window-fail.png)

### 4. Wait for the Wind to Drop
Never attempt to clear glass or reach out of a broken second-story window while high winds are still active. Wait for a lull in the weather before attempting any clean-up or calling an [emergency glazier near you](https://emergencytradesmen.net/).

---

## The Danger of DIY: Why Cardboard and Trash Bags Fail

We've all seen properties with black trash bags duct-taped over a broken window. Here is why this is a terrible idea:

- **It Violates Insurance Clauses:** Most homeowner insurance policies require you to completely "mitigate further damage" by robustly securing the property. A trash bag does not stop wind-driven rain, and it offers zero security against intruders/looters. If your TV is stolen because your "repair" was a plastic bag, the insurance company will deny the theft claim.
- **It Fails the Wind Load Test:** A piece of cardboard or thin plywood screwed directly into the vinyl window frame will rip out during the very next gust of wind, destroying the entire expensive window frame in the process.

Professional **emergency board-up** requires specific materials (usually 5/8" CDX plywood) and specific anchoring techniques (such as tension-bolts or specialized exterior bracing) that do not further damage the structural integrity of the surrounding brickwork or siding.

---

## Rules & Regulations: Insurance and Security Compliance

Whether you are in London or New York, securing a breached property involves legal and insurance obligations.

### If You're in the USA:
- **Attractive Nuisance Doctrine:** If a window is broken on the ground floor, your property becomes a target. If an unauthorized person (even a trespasser or a child) enters through the broken window and injures themselves on the glass, *you* can be held liable under the Attractive Nuisance doctrine.
- **Duty to Mitigate:** You have a contractual obligation to your insurance provider to secure the property against the elements and theft. Hiring an [emergency board-up service](https://emergencytradesmen.net/) proves you took professional, rapid action to protect the insurer's asset.

### If You're in the UK:
- **Building Regulations (Document K):** When the emergency board-up is complete and it's time to install new glass, UK law is strict. Any replacement glass in a "critical location" (doors, side panels next to doors, and low windows below 800mm from the floor) **must** be fitted with safety glass (toughened or laminated) per Document K.
- **Secure by Design:** For rental properties or commercial storefronts, landlords and commercial tenants must ensure the property remains secure to prevent arson and squatting, often requiring professional steel security screens rather than just plywood.

---

## Professional Help: What to Expect from an Emergency Glazier

When you use the **[Emergency Tradesmen Platform](https://emergencytradesmen.net/)** to find a 5-Star Verified glazier, you aren't just getting someone with a hammer and a sheet of plywood.

![Professional emergency board-up service by Emergency Tradesmen expert](/blog/windows/professional-boarding-up.png)

Here is the professional sequence:
1. **Safe Extraction:** The glazier will safely remove the "shark teeth"—the jagged shards of glass still holding onto the frame—using heavy-duty cut-resistant PPE.
2. **Tension Boarding:** Instead of driving massive lag screws through your expensive uPVC or wooden frames, a professional often uses a tension system. They place plywood on the outside, a 2x4 brace on the inside, and bolt them together *through* the empty window space, creating a clamp that withstands hurricane-force winds without damaging your property.
3. **Measurement & Sourcing:** Once the property is secure and watertight, they will measure the exact dimensions of the double-glazed unit (IGU) required, check the tint/e-coating, and order the bespoke replacement pane from the manufacturer.

---

## Homeowner Security Audit: Prevent the Breach

Don't wait for the glass to shatter. Run this 3-minute pre-storm audit:
- [ ] **Check the Seals:** Press your finger against the rubber gasket (the seal between the glass and the frame). If it is cracked, brittle, or missing, the glass is loose and at a much higher risk of wind failure.
- [ ] **Lock the Windows:** A locked window isn't just for security; the locking mechanism pulls the sash tight into the weather stripping, significantly increasing the window's resistance to wind pressure.
- [ ] **Clear the Perimeter:** 90% of broken windows during storms are caused by flying debris. Move patio furniture, unsecured trash cans, and potted plants into the garage. 

---

## Fun Fact

Toughened (tempered) glass, typical in car windows and modern doors, is designed to shatter into thousands of tiny, blunt "pebbles" rather than sharp daggers. This life-saving invention was discovered completely by accident in 1903 by a French chemist named Édouard Bénédictus, who knocked a glass flask off his desk. The flask broke, but the pieces stayed together because it had previously contained liquid plastic (cellulose nitrate) that had evaporated, leaving a thin, invisible film holding the shards together!

---

## Conclusion: Board It Up, Lock It Down

The sound of breaking glass during a storm is a homeowner's worst nightmare. The immediate threat runs from internal pressure surges prioritizing roof failure to acute water damage and security risks.

When the glass breaks, do not compromise your safety with cheap duct tape or garbage bags. Close the door, isolate the room, and call a verified professional to secure your home.

**[Find a 5-Star Verified Emergency Board-Up Service Now →](https://emergencytradesmen.net/)**

🛡️ **Emergency Tradesmen: Fast. Verified. 24/7. Trusted Local Experts.**
`;

async function addPost() {
    console.log('🚨 Updating glazing board-up blog post with images...');

    const slug = 'shattered-windows-high-winds-board-up-glazing-guide';

    const { data, error } = await supabase
        .from('posts')
        .upsert({
            title: "Shattered Windows in High Winds: The Ultimate Emergency Board-Up and Glazing Guide",
            slug: slug,
            content: content,
            excerpt: "A broken window during a severe weather event is a critical structural compromise. Learn the immediate triage steps, why DIY cardboard fixes fail, and what to expect from emergency board-up services.",
            cover_image: '/blog/windows/storm-shattered-window.png',
            published: true,
            published_at: new Date().toISOString()
        }, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('❌ Error adding post:', error.message);
    } else {
        console.log(`✅ Successfully updated post: ${slug}`);
    }
}

addPost();
