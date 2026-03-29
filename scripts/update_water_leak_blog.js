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

const updatedContent = `# Don't Just Stare at It!
![Water pouring from kitchen ceiling into buckets](/blog/water-leak/kitchen-ceiling-leak.jpg)

Seeing water dripping from your light fittings or watching a bubble form in your ceiling is a nightmare scenario. But panic is your enemy right now. You have a "Golden Minute" to act—what you do in these first 60 seconds can be the difference between a quick repair job and a ceiling collapse.

Here is your friendly, step-by-step guide to handling the crisis, knowing your rights, and getting things fixed properly.

## 1. The "Golden Minute": Immediate Action Plan
Before you grab a bucket, you need to make sure you stay safe.

### Step 1: The Electricity Check (Life Safety)
![Water dripping from living room light fixture](/blog/water-leak/living-room-electrical-leak.jpg)
Water and electricity are a deadly mix. If water is dripping near a light fixture, a ceiling fan, or a smoke alarm, **do not touch it**.

**Action**: Go straight to your fuse box (consumer unit) and flip the switch for the lighting circuits in that room. If you aren't sure which one it is, turn off the main switch for the whole house.

> **Why?** Dirty water from a ceiling leak acts as a conductor. You might not see the danger, but a wet light switch or damp carpet could give you a serious shock. For more, see [Electrical Safety First: Water and Electricity](https://www.electricalsafetyfirst.org.uk/guidance/safety-around-the-home/water-and-electricity/).

### Step 2: The "Bulge" Trick (Save Your Ceiling)
If you see a sagging bubble or "bulge" in the ceiling paint or plasterboard, it’s acting like a water balloon. It’s holding heavy water, and if it bursts on its own, it will bring half the ceiling down with it.

**Helpful Tip**: Place a bucket underneath the bulge. Stand to the side (not directly under it!) and use a screwdriver or a broom handle to poke a small hole right in the centre of the bulge.

> **Why?** This sounds scary, but it relieves the pressure. A controlled stream of water into a bucket is much better than a sudden ceiling collapse.

### Step 3: Stop the Flow
You need to cut the water source.

*   **Mains Leak**: If the flow is constant and fierce, turn off your main Stopcock. It's usually under the kitchen sink or under the stairs. See [Thames Water: How to find your stop valve](https://www.thameswater.co.uk/help/water-pipes/find-your-internal-stop-valve).
*   **Waste Leak**: If the water is dirty or soapy, or only happens when someone uses the shower, it’s likely a waste pipe. Tell everyone in the house: **Stop using toilets, sinks, and showers immediately.**

## 2. Playing Detective: Where is it Coming From?
![Tradesman using flashlight to find leak source](/blog/water-leak/tradesman-detecting-leak.jpg)
Once the panic is over, you need to figure out the source.

### Is it Plumbing or Weather?
![Water dripping from attic roof](/blog/water-leak/attic-roof-leak.jpg)

*   **Plumbing**: If it hurts to touch (hot water) or is constant, it's likely a supply pipe. If it's intermittent, check the silicone seals around your bath or shower tray.
*   **Weather**: If it only drips when it rains, you’re looking at a roof issue—missing tiles or blocked gutters are the usual suspects.

### ⚠️ Warning: The Gas Flue Danger
If you see water staining along the route of your boiler flue (the pipe that takes fumes outside), be very careful. A leaking flue can spill acidic water, but it can also leak Carbon Monoxide.
**Rule**: If you suspect the flue is leaking, turn the boiler off and call a [Gas Safe Registered](https://www.gassaferegister.co.uk/) engineer immediately. This is a critical safety issue under the *Gas Safety (Installation and Use) Regulations 1998*.

## 3. Know Your Materials: What is your Ceiling Made Of?

### Modern Homes (Plasterboard/Drywall)
Most homes built after 1950 use plasterboard. It’s basically paper and gypsum.
*   **The Bad News**: It hates water. It acts like a sponge, gets heavy, and loses strength. Once it sags, it rarely goes back to being flat.
*   **The Risk**: Mould loves the paper surface of wet plasterboard. You’ll need to dry it fast to prevent health risks cited by the [NHS: Damp and Mould](https://www.nhs.uk/common-health-questions/lifestyle/can-damp-and-mould-affect-my-health/).

### Older Homes (Lath and Plaster)
Pre-1950s homes often use wooden strips (laths) covered in plaster.
*   **The Good News**: It’s actually quite tough. If the "keys" (the plaster bits holding it up) don't break, it can often be dried out and saved without replacing the whole ceiling.

### ⚠️ Crucial Safety Warning: Asbestos (Artex)
Does your ceiling have a textured, swirls, or "popcorn" finish? If your home was built or renovated before 2000, that texture (Artex) could contain Asbestos.
**Helpful Tip**: Never drill, sand, or scrape a textured ceiling without testing it first. Asbestos is safe if left alone, but dangerous if you disturb it (like when cutting out a wet patch). See [HSE: Asbestos Essentials](https://www.hse.gov.uk/asbestos/essentials/).

## 4. Rules & Regs: Know Your Rights and Responsibilities
Whether you own or rent, there are strict rules in the UK about water damage and repairs.

### For Renters: Your Landlord’s Duty
If you are renting, you have strong legal protection under the [Landlord and Tenant Act 1985 (Section 11)](https://www.legislation.gov.uk/ukpga/1985/70/section/11).
*   **The Rule**: Your landlord is legally responsible for repairing the structure, exterior, and water installations (pipes, boilers, toilets). They must fix the leak.
*   **Fitness for Habitation**: Under the newer [Homes (Fitness for Human Habitation) Act 2018](https://www.legislation.gov.uk/ukpga/2018/26/contents), if damp or mould makes the house unsafe to live in, you have the right to take legal action.

### For Homeowners: Electrical Safety Regulations
You can't just let electrics "dry out" and hope for the best.
*   **The Rule**: Under [BS 7671 (The Wiring Regulations)](https://electrical.theiet.org/bs-7671/), water-damaged electrical accessories (like sockets or ceiling roses) are often considered unsafe and should be replaced, not just dried. You should get an electrician to perform a test (EICR) to ensure the wiring inside the walls hasn't corroded.

## 5. Insurance and Money Talk

### "Escape of Water" Claims
Most home insurance covers "Escape of Water" (burst pipes) but often excludes the repair of the pipe itself—they pay for the damage caused by the water (the ceiling, the carpet).

*   **Helpful Tip**: Check your policy for "Trace and Access". This pays for the cost of finding the leak (like ripping up a floorboard), which can be the most expensive part.
*   **Don't Bin the Evidence!** Never throw away that sodden carpet or the piece of burst pipe until your insurance company says so. The Loss Adjuster may need to see it to approve your claim.

## 6. The Cleanup: Drying it Out
You can't just paint over a damp patch. If you seal moisture in, you'll get dry rot.

*   **Air Flow**: Open windows and use fans. You need to move the humid air out.
*   **Dehumidifiers**: These are essential in the UK climate. If you can, hire a refrigerant dehumidifier (for warm rooms) or a desiccant one (for cold rooms).
*   **Floors**: If you have laminate flooring, sadly, it usually needs to be replaced if it swells. Solid wood might be saved if dried slowly.

## 7. Who Do You Call?
Dealing with tradespeople in an emergency can be stressful. You need to know who handles what:

*   **Plumber**: For burst pipes, tanks, and bathroom leaks. Verified members of [CIPHE](https://www.ciphe.org.uk/) are recommended.
*   **Roofer**: For leaks that happen when it rains.
*   **Electrician**: Essential if water has run through light fittings. Look for [NICEIC](https://www.niceic.com/) or [NAPIT](https://www.napit.org.uk/) registration.
*   **Restoration Specialist**: For drying out and treating mould.

### Need Help Right Now?
If you need a verified professional to get to you within the hour, you can find 24/7 assistance for plumbers, electricians, and gas engineers at: [Emergency Tradesmen](https://emergencytradesmen.net)

## Summary Checklist:
1.  **Safety**: Turn off the electricity.
2.  **Control**: Poke the bulge to drain water.
3.  **Isolate**: Turn off the stopcock.
4.  **Protect**: Cover your furniture.
5.  **Call**: Get a pro from [emergencytradesmen.net](https://emergencytradesmen.net).
`;

async function updatePost() {
    console.log('🚨 Updating blog post...');

    const { data, error } = await supabase
        .from('posts')
        .update({
            title: "Water Leaking Through The Ceiling – What To DO FIRST",
            content: updatedContent,
            excerpt: 'Your 60-Second Survival Guide to Stopping the Damage. Learn the "Golden Minute" action plan to save your ceiling and stay safe.',
            cover_image: '/blog/water-leak/cover.jpg',
            published_at: new Date().toISOString() // Touch it to show recent
        })
        .eq('slug', 'water-leaking-through-ceiling-first-steps')
        .select();

    if (error) {
        console.error('❌ Error updating post:', error.message);
    } else {
        console.log('✅ Successfully updated post:', data[0]?.title);
    }
}

updatePost();
