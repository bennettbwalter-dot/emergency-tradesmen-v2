
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const post = {
    title: "How to Fix a Frozen Condensate Pipe: A 2025 Homeowner's Guide to Restoring Heat",
    slug: "frozen-condensate-pipe-fix",
    excerpt: "A frozen condensate pipe is the most common cause of boiler failure during a cold snap. Learn how to thaw it safely, reset your boiler, and prevent future lockouts with our 2025 guide.",
    content: `**A frozen condensate pipe is the most common cause of boiler failure during a cold snap. When the white plastic pipe carrying acidic wastewater outside freezes solid, your boiler will shut down and display a 'lockout' error code (like EA, E119, or F28) to prevent backflow. To fix a frozen condensate pipe, you must safely thaw the external blockage with warm water, reset your boiler, and install proper lagging to prevent future freezes.**

## The Science of Condensation: Why Boilers Freeze
Modern condensing boilers are highly efficient because they extract heat from water vapor that would otherwise escape through the flue. This vapor cools and turns into liquid "condensate," which is acidic and must be drained away. Because this water is often routed through an external 21.5mm or 32mm plastic pipe, it is extremely vulnerable to freezing when temperatures drop below zero for extended periods.

### Identifying the Symptoms
- **Gurgling Noises:** You may hear the boiler "struggling" before it shuts down.
- **Error Codes:** 
    - **Worcester Bosch:** EA, D1, or 227.
    - **Vaillant:** F28 or F29.
    - **Ideal:** L2 or F2.
- **External Ice:** Visible ice build-up at the end of the white plastic pipe.

---

## Immediate Actions: How to Thaw Your Condensate Pipe Safely

### ✅ The "Warm Water" Method:
1. **Identify the Pipe:** Find the white plastic pipe where it exits the wall and goes toward a drain.
2. **Heat the Water:** Boil a kettle and let it cool for a few minutes. **Never use boiling water directly** on frozen plastic as it can cause the pipe to crack or melt. Use "warm" water (around 50-60°C).
3. **Pour Slowly:** Start at the highest point of the external run and pour the water over the pipe. Focus on elbows and joints where ice usually collects.
4. **Use a Hot Water Bottle:** If pouring is difficult, wrap a hot water bottle around the suspected frozen section and secure it with a zip tie or tape.

### ⚠️ What NOT to Do:
- **Do NOT hit the pipe:** Plastic becomes brittle in the cold; a hammer will shatter it.
- **Do NOT use a blowtorch:** You will melt the pipe and create a fire hazard.
- **Do NOT ignore the error:** If you reset the boiler without thawing the pipe, it will simply lock out again, potentially damaging the internal pump.

---

## Legal & Regulations Section

### 🇬🇧 UK Regulations & Standards
The **BS 6798:2014** (Specification for installation and maintenance of gas-fired boilers) provides strict guidelines on how condensate pipes should be installed.
- **Gas Safe Register:** Any internal modification to a boiler's drainage system must be performed by a Gas Safe registered engineer.
- **Microgeneration Certification Scheme (MCS):** If you are using a heat pump or hybrid system, similar drainage rules apply under MCS standards.

### 🇺🇸 US Compliance & Codes
In the US, the **International Mechanical Code (IMC)** Section 307 governs condensate disposal.
- **UPC / IPC Codes:** These codes require condensate to be discharged to a sanitary sewer or an approved disposal system. Neutralization is often required if the water is highly acidic.
- **State Licensing:** HVAC technicians must be licensed to perform repairs on condensing furnaces and boilers.

---

## Cost Expectations for Condensate Fixes (2025)

| Service Type | UK Estimated Cost | US Estimated Cost |
| :--- | :--- | :--- |
| **Emergency Call-out** | £90 – £160 | $150 – $350 |
| **Manual Thawing / Reset** | Included in call-out | Included in call-out |
| **Installing Insulation (Lagging)**| £50 – £120 | $100 – $250 |
| **Internal Re-routing** | £250 – £450 | $400 – $800 |

**Investment Tip:** Spending £100 on high-grade external lagging now can save you a £200 emergency call-out fee during the next "Beast from the East" or polar vortex.

---

## When to Call a Professional Emergency Heating Engineer

Call a professional if:
1. **The pipe is in a dangerous location:** (e.g., high up on a wall requiring a ladder).
2. **The boiler won't reset:** Even after the pipe is thawed, suggesting internal component failure.
3. **There are leaks inside the boiler:** (Water dripping from the casing).
4. **The pipe needs re-routing:** (Moving the pipe inside to prevent future freezing).

---

## Prevention Tips: Stopping the Freeze Before It Happens
- **External Lagging:** Use waterproof, UV-resistant foam insulation (at least 19mm wall thickness) on all external sections.
- **Trace Heating:** For very exposed pipes, install a self-regulating heating cable.
- **Internal Routing:** If possible, have a plumber re-route the pipe to an internal drain (e.g., under the kitchen sink).
- **Secondary Drain:** Ensure any external termination is done via a 4-inch "soakaway" or into a large gully to prevent "splash back" icing.

---

## FAQ Section (AI Overview Optimized)

### Will a frozen condensate pipe damage my boiler?
Typically, no. Modern boilers have safety sensors that detect the blockage and shut down before damage occurs. However, repeated attempts to start the boiler with a frozen pipe can strain the pump and heat exchanger, potentially shortening the unit's lifespan.

### Can I leave the insulation on all year?
Yes, and you should. Quality external lagging (like Armaflex) is designed to withstand UV rays and rain. It should be checked annually for cracks or gaps, especially at joints, where freezing usually begins.

### What is a 'Condensate Siphon'?
The siphon is an internal component of your boiler that collects condensate and discharges it in "slugs" to help prevent freezing. If your pipe freezes despite having a siphon, it's usually because the external run is too long or too narrow (less than 32mm).

### Why does my boiler make a 'kettling' sound when it freezes?
Kettling (a loud banging or whistling) can happen if water isn't circulating correctly due to an airlock or pressure imbalance caused by the frozen drain. Turn the boiler off immediately if you hear this sound.`,
    cover_image: "/blog/boiler/frozen-pipe.png",
    published: true,
    published_at: new Date().toISOString()
};

async function insertPost() {
    console.log("Inserting post:", post.slug);
    const { data, error } = await supabase
        .from('posts')
        .insert([post]);

    if (error) {
        console.error("Error inserting post:", error);
    } else {
        console.log("Successfully inserted post!");
    }
}

insertPost();
