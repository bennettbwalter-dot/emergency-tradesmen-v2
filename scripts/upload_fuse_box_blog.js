import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const content = `# Is Your Fuse Box Up to Code? The 2026 Homeowner’s Guide to Consumer Units and RCD Safety

When was the last time you looked at your fuse box? For most homeowners, it’s that dusty grey or white box hidden in the under-stairs cupboard or the garage, only remembered when a bulb blows or the toaster misbehaves. However, your "fuse box"—or more accurately, your **Consumer Unit**—is the heart of your home’s electrical system. In 2024 and 2025, electrical faults accounted for over 14,000 house fires in the UK alone. As we move into 2026, the standards for home safety have evolved, and a "fuse box up to code" is no longer just a legal recommendation—it’s a life-saving necessity. 

This consumer unit guide will walk you through everything you need to know about modern electrical protection, why your old fuse box might be a ticking time bomb, and how to stay compliant with 2026 safety standards.

---

## Why an Outdated Fuse Box is Dangerous

If your home still has a traditional fuse box (the kind with replaceable wire fuses or ceramic carriers), it is likely over 30 to 40 years old. While these units were "up to code" when they were installed, they are fundamentally ill-equipped for the demands of a modern 2026 home full of smart appliances, EV chargers, and heat pumps.

### 1. Lack of RCD Protection
The single biggest danger of an old fuse box is the absence of **RCDs (Residual Current Devices)**. An RCD is a sensitive safety switch that trips the electricity in milliseconds if it detects a leakage of current to earth. This happens if you accidentally cut a cable with the lawnmower or if a faulty appliance starts to leak current. **RCDs prevent 83% of electrical fire deaths.** Without one, a fault could continue to run, heating up wires until they ignite, or providing a fatal electric shock.

### 2. Overheating and Fire Risk
Older units were designed for a time when the most intensive appliance was a kettle. Today, we have multiple devices drawing high loads simultaneously. Old wire fuses can get extremely hot during long periods of high demand. If the wire doesn't blow immediately, it can melt the surrounding plastic or insulation, leading to a fire within the consumer unit itself.

### 3. Arcing and Loose Connections
Over decades, the connections inside a fuse box can loosen due to thermal expansion and contraction. This leads to "arcing"—where electricity jumps across gaps. Arcing creates intense heat (often over 3,000°C) and is a primary cause of domestic electrical fires. Modern consumer units are fitted with **AFDDs (Arc Fault Detection Devices)** in high-risk circuits to catch this before a fire starts.

### 4. No Surge Protection
With the rise of expensive home electronics and smart home hubs, surge protection has become critical. Older fuse boxes offer zero protection against power surges caused by lightning or grid switching. A single surge can fry every smart device in your home in a millisecond.

---

## 5 Warning Signs Your Fuse Box is Failing

Don’t wait for a fire to realize your system is failing. Look for these critical red flags:

![Scorched and damaged circuit breakers indicating a severe fire risk](/blog/electrical/fuse-box-scorched.jpg)

- **The Smell of Burning Plastic (Fishy Smell):** Electrical insulation often smells like fish when it overheats. If you catch this scent near your consumer unit, call an emergency electrician immediately.
- **Flickering Lights:** Frequent flickering or dimming, especially when you turn on a high-power device like a shower or oven, suggests your consumer unit is struggling with the load.
- **Crackling or Buzzing Noises:** A healthy consumer unit should be silent. Any "sizzling" or buzzing indicates arcing or loose connections.
- **Tripping "Fuses" (Breakers):** If your circuits are frequently cutting out, it’s not just an annoyance; it’s a sign that the safety devices are struggling or that the circuit is overloaded.
- **Physical Damage or Discoloration:** Any scorch marks, melted plastic, or brown staining on the unit is a sign of extreme heat.

---

## The 2026 "Up to Code" Checklist

If you are looking to upgrade or check your current system, here is what a modern, compliant consumer unit looks like in 2026:

![Modern consumer unit wiring showing RCD protection and organized circuits](/blog/electrical/consumer-unit-wiring.jpg)

### 1. Metal Enclosure (18th Edition Amendment 3)
Since 2016, UK regulations (BS 7671) have required all new consumer units in domestic dwellings to be made of non-combustible material—essentially, a sturdy metal box. This ensures that if a fire starts inside the unit, it is contained and cannot spread to the rest of the house.

### 2. Dual RCD or RCBO Protection
Modern boards use either two RCDs to split the house circuits or individual **RCBOs (Residual Current Breaker with Overcurrent)** for every circuit. RCBOs are the gold standard for 2026 because if one circuit has a fault (e.g., the downstairs sockets), it only trips that specific circuit, leaving the rest of the house in the light.

### 3. Surge Protection Device (SPD)
Under the latest amendments, SPDs are now a standard requirement in new consumer unit installations. They act as a lightning rod for your electronics, diverting excess voltage safely to the ground.

### 4. Arc Fault Detection (AFDDs)
While not mandatory for every circuit in all homes yet, AFDDs are highly recommended for circuits in bedrooms and high-density wooden structures. They provide the ultimate layer of protection against the most common cause of electrical fires.

---

## Rules & Regulations: What You Need to Know

### In the UK:
Electrical work is governed by the **IET Wiring Regulations (BS 7671)**. Replacing a consumer unit is "notifiable work" under **Part P of the Building Regulations**. This means you cannot legally do it yourself. It must be performed by a registered competent person (e.g., NICEIC, NAPIT, or ELECSA registered). Upon completion, you must receive:
1. An **Electrical Installation Certificate (EIC)**.
2. A **Building Regulations Compliance Certificate**. 

Without these documents, you may find it impossible to sell your home, and your home insurance may be void in the event of a fire.

### In the USA:
Electrical codes vary by state, but most follow the **National Electrical Code (NEC)**. Upgrading your "panel" (as it's often called in the US) requires a permit from your local building department and an inspection by a city official after the work is completed by a licensed electrician. 2026 standards in many states now mandate **AFCI (Arc Fault Circuit Interrupter)** and **GFCI (Ground Fault Circuit Interrupter)** protection for almost all residential circuits.

---

## Helpful Tips for Homeowners

![Homeowner testing the RCD safety switch on a consumer unit](/blog/electrical/rcd-test-button.jpg)

- **Press the 'Test' Button:** Every RCD has a small button marked 'T' or 'Test'. You should press this every six months to ensure the mechanical switch is still moving freely. If it doesn't trip immediately, your protection is dead, and you need an electrician.
- **Label Your Circuits:** Ensure every breaker is clearly labeled (e.g., "Kitchen Sockets," "Upstairs Lights"). In an emergency, you need to know exactly which switch to hit.
- **Don't Overload Extension Leads:** A modern consumer unit can protect the wiring in the wall, but it cannot always protect a cheap extension lead that has five high-powered devices plugged into it.
- **Keep the Area Clear:** Don't stack coats, boxes, or flammable materials around your consumer unit. It needs ventilation and clear access in an emergency.

---

## Staying Prepared for Grid Failures

![A portable electric generator powering home essentials during a blackout](/blog/electrical/portable-generator.jpg)

<div style="margin: 20px 0; text-align: center;">
  <a href="https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0BZZ47J4T?aref=uIM4EIqZ7A&content-id=amzn1.sym.0cf85714-a5b0-4d96-9050-d0dce9037023%3Aamzn1.sym.0cf85714-a5b0-4d96-9050-d0dce9037023&crid=33I8EKKA1HPI8&cv_ct_cx=electric%2Bgenerator%2Bportable%2Bsolar&keywords=electric%2Bgenerator%2Bportable%2Bsolar&pd_rd_i=B0BZZ47J4T&pd_rd_r=0e0b0557-3eed-4335-9b29-e6a1477815e4&pd_rd_w=8jmdZ&pd_rd_wg=XzQgM&pf_rd_p=0cf85714-a5b0-4d96-9050-d0dce9037023&pf_rd_r=G6R413H7YTF4ZQ5HY81S&qid=1773084003&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=portable%2Belectric%2Bsolar%2Caps%2C239&sr=1-1-9131241a-a358-4619-a7b8-0f5a65d91d81&th=1&linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl" 
     style="display: inline-block; background-color: #ff9900; color: #131921; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-family: 'Amazon Ember', Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.15); border: 1px solid #a88734;" 
     target="_blank" rel="noopener noreferrer">
    Check Price on Amazon
  </a>
</div>

Grid failures often catch you off guard. Severe weather, routine grid maintenance, infrastructure issues, or sudden equipment faults can cut off power to your home, leaving you in the dark for a single hour or over a long weekend. In these moments, once-simple tasks—like reading after dark, making a phone call, or accessing online information—become major challenges.

For homeowners looking for a reliable backup solution, we recommend investing in a high-capacity portable power station. The **[BLUETTI Portable Power Station AC180](https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0BZZ47J4T?aref=uIM4EIqZ7A&content-id=amzn1.sym.0cf85714-a5b0-4d96-9050-d0dce9037023%3Aamzn1.sym.0cf85714-a5b0-4d96-9050-d0dce9037023&crid=33I8EKKA1HPI8&cv_ct_cx=electric%2Bgenerator%2Bportable%2Bsolar&keywords=electric%2Bgenerator%2Bportable%2Bsolar&pd_rd_i=B0BZZ47J4T&pd_rd_r=0e0b0557-3eed-4335-9b29-e6a1477815e4&pd_rd_w=8jmdZ&pd_rd_wg=XzQgM&pf_rd_p=0cf85714-a5b0-4d96-9050-d0dce9037023&pf_rd_r=G6R413H7YTF4ZQ5HY81S&qid=1773084003&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=portable%2Belectric%2Bsolar%2Caps%2C239&sr=1-1-9131241a-a358-4619-a7b8-0f5a65d91d81&th=1&linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl)** is an excellent choice for keeping your devices charged and lights running during an emergency, ensuring your home remains resilient in the face of unexpected power interruptions.

---

## When to Call a Professional

If your fuse box is plastic, has replaceable wires, or is making noise, you are overdue for an inspection. Electrical systems are not "set and forget"—they have a lifespan. A typical consumer unit is expected to last 20-30 years before the components begin to degrade.

If you’re unsure about your home’s safety, the best first step is to book an **EICR (Electrical Installation Condition Report)**. This is a "deep dive" health check of your entire home’s wiring.

---

## Find a Verified Electrician Today

Don't gamble with your family's safety. Whether you need an emergency repair after a trip or a full consumer unit upgrade, we can connect you with vetted, local experts in minutes.

### Internal Links:
- [Find Local Electricians Near Me](https://emergencytradesmen.net/emergency-electrician)
- [Electrical Fire Warning Signs: The Full Guide](https://emergencytradesmen.net/blog/electrical-fire-warning-signs-gb)
- [Emergency Electrician London](https://emergencytradesmen.net/emergency-electrician/london)
- [How We Verify Our Tradespeople](https://emergencytradesmen.net/blog/how-we-verify-tradespeople)
- [Home Emergency Protocol: US Edition](https://emergencytradesmen.net/blog/what-to-do-in-home-emergency-before-help-arrives-us)

---

**Keyword Research Notes:**
- *Primary Keyword:* Is your fuse box up to code?
- *Secondary Keywords:* consumer unit guide, RCD protection benefits, electrical safety standards 2026, metal consumer unit regulations.
- *Word Count:* ~1300 words.`;

async function insertPost() {
    const slug = 'is-your-fuse-box-up-to-code-consumer-unit-guide';
    const title = 'Is Your Fuse Box Up to Code? The 2026 Homeowner’s Guide to Consumer Units and RCD Safety';
    const excerpt = 'Your consumer unit is the heart of your home’s electrical system. As we move into 2026, ensuring your fuse box is up to code is a life-saving necessity. Learn about RCDs, SPDs, and modern safety standards.';
    const cover_image = '/blog/fuse_box_guide_cover.png';

    // Check if post exists
    const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .single();

    if (existingPost) {
        console.log('Post already exists, updating...');
        const { error } = await supabase
            .from('posts')
            .update({
                title,
                content,
                excerpt,
                published: true,
                published_at: new Date().toISOString(),
                cover_image
            })
            .eq('slug', slug);

        if (error) console.error('Error updating:', error);
        else console.log('Successfully updated post');
    } else {
        console.log('Inserting new post...');
        const { error } = await supabase
            .from('posts')
            .insert({
                title,
                slug,
                content,
                excerpt,
                published: true,
                published_at: new Date().toISOString(),
                cover_image
            });

        if (error) console.error('Error inserting:', error);
        else console.log('Successfully inserted post');
    }
}

insertPost();
