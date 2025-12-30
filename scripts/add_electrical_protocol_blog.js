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
## 1. Introduction: Keeping the Lights On (And What to Do When They Go Off)
Let’s face it: our lives run on electricity. Whether it’s keeping the fridge cold, the WiFi running, or the heating pump pushing warmth around the house, we rely on that invisible flow of power for just about everything. So, when the lights suddenly go out, it’s a shock to the system—literally and figuratively.

While the UK’s power grid is generally reliable, interruptions happen. Storms, floods, or even just a tripped switch in your hallway can plunge you into darkness. It can be disorienting, especially in winter, but panic is the last thing you need. This guide takes all the technical safety standards—from electrical regulators and food safety bodies—and turns them into a clear, step-by-step plan to get you safely through the dark.

## 2. Step One: Is It Just You? (The Detective Work)
The moment the hum of the fridge stops and the TV goes black, you need to figure out the scale of the problem. Is this a "you" problem (your wiring) or a "them" problem (the grid)?

![Is It Just You - Electrical Detective Work](/blog/electrical-protocol-detective.png)

### 2.1 The "Window Test"
The quickest diagnostic tool is your own eyes. Look out the window.

*   **If the streetlights are on and the neighbors have power**: The problem is almost certainly inside your house, likely at your fuse box (Consumer Unit).
*   **If the whole street is dark**: It’s a local power cut. This is an issue for the distribution network, not an electrician.

### 2.2 Your Smart Meter knows the Truth
If you have a smart meter, it can give you a clue even if you can't see the neighbors.

*   **Blank Screen**: If the display is dead, power isn't even reaching your house. That’s a grid issue.
*   **Display On, Zero Usage**: If the screen is on but shows 0 kWh usage while you're trying to turn lights on, power is getting to the meter but stopping there. That means your fuse box has tripped.

### 2.3 Immediate Safety First
Before you start investigating, make the house safe.

*   **Ditch the Candles**: It’s tempting to light candles for atmosphere, but fire services strongly advise against it. In the dark, the risk of knocking one over is too high. Stick to battery-powered LED torches or wind-up lanterns.
*   **Unplug Sensitive Gear**: When power comes back, it can arrive with a "surge" or spike in voltage. This can fry sensitive electronics like PCs, TVs, and modems. Unplug them now to be safe.
*   **Leave a "Pilot Light"**: Leave one light switch (like the hallway) turned on. This acts as your signal so you know exactly when the power is back.

## 3. The Fuse Box: Understanding Your Consumer Unit
If the neighbors are fine, the fault is yours. You’ll need to head to your Consumer Unit (fuse box). Modern units are designed to protect you in two very different ways.

![The Fuse Box - Understanding Your Consumer Unit](/blog/electrical-protocol-fusebox.png)

### 3.1 The Two Switches You Need to Know
Inside that box, you generally have two types of switches. Knowing the difference helps you find the fault.

**The MCB (Miniature Circuit Breaker) – Protects the Wires**
*   **What it does**: This protects your home’s wiring from melting or catching fire.
*   **Why it trips**: Usually because you plugged in too many things at once (overload) or a live wire touched a neutral one (short circuit). If this trips, the problem is usually specific to one circuit, like "Kitchen Sockets."

**The RCD (Residual Current Device) – Protects You**
*   **What it does**: This is the lifesaver. It monitors the electricity going out and coming back. If even a tiny amount leaks out (like through a person receiving a shock or water in a socket), it cuts the power instantly—usually in less than 40 milliseconds.
*   **Why it trips**: It’s very sensitive. If it trips, it often cuts power to a whole group of circuits (e.g., all downstairs power), making it harder to guess which appliance is the culprit.

### 3.2 How to Fix a Tripped Switch
Don't just flip the switch back up! If there's a fault, it will just bang down again. Follow this routine:

1.  **Unplug Everything**: If a sockets circuit has tripped, physically unplug every appliance on that circuit. Just switching them off at the wall often isn't enough.
2.  **Reset the Switch**: Push the tripped switch back up.
    *   **If it stays up**: Great! The wiring is fine. The fault was one of your appliances.
    *   **If it trips again immediately**: You likely have a wiring fault (like a nail through a cable). Call an electrician.
3.  **The Elimination Game**: If the switch stayed up, plug your appliances back in one by one and turn them on. The moment you plug in the faulty one (often a kettle or washing machine with a heating element gone bad), the switch will trip again. You've found your villain.

### 3.3 "Nuisance Tripping"
Sometimes, nothing is "broken." Modern computers and TVs naturally leak a tiny bit of current. If you have too many of them on one RCD, their combined leakage can get close to the trip limit (30mA). A tiny fluctuation can then tip it over the edge, causing random power cuts. An electrician can fix this by spreading your circuits out.

## 4. When It’s a Grid Issue: Who to Call
If the whole street is out, you need to report it. But don't call the company that sends your bill (like British Gas or Octopus)—they don't own the cables.

![When It's a Grid Issue: Who to Call](/blog/electrical-protocol-grid.png)

### 4.1 Know Your Network Operator (DNO)
The people who fix the wires are called Distribution Network Operators (DNOs).

*   **The Magic Number**: Dial **105**. This free number automatically routes you to the DNO for your area, no matter where you are in England, Scotland, or Wales.
*   **Dunstable Residents**: If you are in Dunstable, your operator is UK Power Networks (Distributor ID 10).

### 4.2 Tracking the Outage
Most DNOs have live maps on their websites where you can see exactly where the fault is and when they expect to fix it. If we face a national energy shortage (rare, but possible), you might see "Rota Disconnections." Check your energy bill for a "Block Letter" (A-U)—that tells you when your turn for a scheduled power cut would be.

## 5. Protecting the Vulnerable: The Priority Services Register
Power cuts are annoying for most, but dangerous for some. If you or a family member rely on electricity for medical equipment (like oxygen or dialysis), or if you are elderly, disabled, or have young children, you should sign up for the Priority Services Register (PSR).

It’s free, and it ensures the DNO knows you need help. They can provide advance warning of cuts, hot meals, or even emergency accommodation if the power is off for a long time.

## 6. Keeping Warm and Fed: Thermodynamics in Action
When the power dies, your home starts cooling down. In winter, managing this is key.

### 6.1 Staying Warm
*   **The "One Room" Rule**: Don't try to heat the whole house. Pick one central room (ideally south-facing for sunlight) and hunker down there. Keep the door closed to trap body heat.
*   **Close the Curtains**: Windows lose heat fast. Close blinds and curtains immediately to keep the warmth in.
*   **Layer Up**: It’s more efficient to insulate your body than the room. Wear a hat—you lose a lot of heat from your head.

### 6.2 Food Safety: The 4-Hour Rule
Your fridge and freezer are essentially insulated boxes. They will stay cold for a while if you keep the door shut.

*   **The Fridge**: Will keep food safe for 4 hours. After that, bacteria like Salmonella start to grow.
*   **The Freezer**: A full freezer acts like a thermal battery and stays frozen for 48 hours. If it's only half-full, you've got about 24 hours. (Tip: Fill empty space in your freezer with water bottles now to create emergency ice blocks for later).
*   **The Danger Zone**: If perishable food (meat, soft cheese) goes above 8°C for more than 2 hours, throw it out. It’s not worth the risk.

> **Crucial Warning**: Never, ever bring a charcoal BBQ or camping stove indoors to cook or heat the room. They produce Carbon Monoxide (CO), which is invisible, odorless, and deadly.

## 7. The Comeback: Surge Protection
When the power grid comes back online, it can sometimes jolt your wiring with a high-voltage spike (a surge).

![The Comeback: Surge Protection](/blog/electrical-protocol-surge.png)

### Surge Protection Devices (SPDs)
Modern wiring regulations (18th Edition) recommend these devices in your fuse box. They act like a pressure relief valve, dumping excess voltage to earth before it fries your TV or washing machine.

*   **What you can do**: If you don't have built-in protection, use plug-in surge protector strips for your expensive electronics.

## 8. Getting Compensated
If the power is out for a long time, you might be owed money. The regulator, Ofgem, sets these rules.

![Getting Compensated for Power Cuts](/blog/electrical-protocol-compensation.jpg)

### Standard Outages (Normal Weather)
*   **Trigger**: If you are off for more than 12 hours.
*   **Payment**: You get £95.
*   **Extensions**: You get another £40 for every additional 12 hours.

### Storms (Severe Weather)
If a major storm tears down lines, the engineers get more time to fix it before they have to pay you.
*   **Category 1 Storm**: Compensation kicks in after 24 hours.
*   **Category 2 Storm**: Compensation kicks in after 48 hours.
*   **Payment**: £85 initial payment, then £40 for every 6 hours after that (capped at £2,000).

*Note: You usually don't need to claim; the DNO should pay automatically, but keep a note of the times just in case.*

## Summary Checklist
1.  **Look outside**: Streetlights off? Call 105. Streetlights on? Check your fuse box.
2.  **Safety**: Unplug sensitive electronics. No candles.
3.  **Fuse Box**: Unplug appliances before resetting a trip switch.
4.  **Food**: Keep the fridge door shut (good for 4 hours).
5.  **Warmth**: Pick one room and stay there.

Being prepared turns a power cut from a scary emergency into a manageable inconvenience. Stay safe!

---
**References & Guides**:
*   [Electrical Safety First: Guidance on Power Cuts](https://www.electricalsafetyfirst.org.uk/guidance/safety-around-the-home/power-cuts/)
*   [NICEIC: Why use a certified contractor?](https://www.niceic.com/find-a-contractor/why-choose-niceic)
*   [National Grid: Power Cut Advice](https://www.nationalgrid.co.uk/power-cuts/power-cut-advice)
*   For immediate assistance, find a verified electrician at [Emergency Tradesmen](https://emergencytradesmen.net/).
`;

async function addPost() {
    console.log('🚨 Adding new blog post...');

    // Use a simplified slug
    const slug = 'domestic-electrical-interruption-protocol';

    const { data, error } = await supabase
        .from('posts')
        .upsert({
            title: "The Domestic Electrical Interruption Protocol: A Comprehensive Analysis of Diagnostics, Safety, and Resilience",
            slug: slug,
            content: content,
            excerpt: "A comprehensive guide to managing power cuts: from diagnosing fuse box faults to understanding grid issues, protecting your electronics, and keeping your family safe and warm.",
            cover_image: '/blog/electrical-protocol-fusebox.png', // Using the fusebox diagram as appropriate cover
            published: true,
            published_at: new Date().toISOString()
        }, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('❌ Error adding post:', error.message);
    } else {
        console.log(`✅ Successfully added post: ${slug}`);
    }
}

addPost();
