import os
import requests
import json
from datetime import datetime

# Supabase Configuration
url = "https://xwqvhymkwuasotsgmarn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Blog Posts Data
posts = [
    {
        "title": "AC Won’t Turn On? Troubleshooting Power & Thermostat Issues Before Calling a Tech",
        "slug": "ac-wont-turn-on-troubleshooting-us",
        "excerpt": "It’s the first hot day of the season. You flip the switch on your thermostat, expecting that familiar hum of cool air. Instead… silence. Before you panic and call a 24/7 HVAC technician, check these common reasons why your system might be dead.",
        "content": """# AC Won’t Turn On? Troubleshooting Power & Thermostat Issues Before Calling a Tech

It’s the first hot day of the season. You flip the switch on your thermostat, expecting that familiar hum of cool air. Instead… silence. Nothing happens. No fan, no compressor, just stillness. In the US, where summer heat can be brutal, an AC that won’t start is more than an inconvenience—it’s a potential emergency.

Before you panic and call a 24/7 HVAC technician, there are several common, simple reasons why your system might be dead. Most of them are easy to check yourself. Let’s walk through the troubleshooting steps to see if you can get it running again safely.

## Step 1: Check the Thermostat Settings

It sounds basic, but thermostat errors cause a huge number of "no power" calls.

*   **Mode:** Ensure it’s set to “Cool” and not “Heat,” “Fan Only,” or “Off.”
*   **Temperature:** Set the temperature at least 5 degrees lower than the current room temperature. If the room is 80°F, set it to 75°F. The system won’t kick on if the set point is higher than the ambient temp.
*   **Batteries:** If your thermostat has a blank screen or is unresponsive, replace the batteries. Even hardwired thermostats often have battery backups that fail.

## Step 2: Check the Circuit Breaker

Your AC unit runs on a dedicated circuit. High demand or a power surge can trip the breaker.

1.  Go to your main electrical panel (usually in the garage, basement, or utility closet).
2.  Look for the breaker labeled “AC,” “HVAC,” or “Compressor.”
3.  If it’s in the middle position or flipped to “Off,” turn it fully to “Off” first, then back to “On.” You should feel a solid click.

> **Warning:** If the breaker trips again immediately, do not reset it. This indicates a serious electrical fault (like a shorted compressor or capacitor). Leave it off and call a professional.

## Step 3: Check the Outdoor Disconnect Switch

Near your outdoor condenser unit, there is usually a small metal box mounted on the wall. This is the disconnect switch.

*   Open the box (ensure your hands are dry).
*   Check if the pull-out block or lever is in the “On” position. Sometimes, maintenance crews or storms can accidentally knock it to “Off.”
*   If it’s off, flip it back on. If it looks burnt or melted, do not touch it—call an electrician or HVAC tech.

## Step 4: Check the Indoor Air Handler Switch

Inside your home, near the furnace or air handler (often in a closet, attic, or basement), there may be a standard light-switch-like toggle on the wall or on the unit itself.

*   Ensure this switch is in the “On” position.
*   If it was turned off during winter maintenance, it needs to be flipped back on for summer.

## Step 5: Listen for the Condenser Fan

Go outside to the AC unit. When you turn the thermostat down, you should hear the outdoor fan start spinning within a minute or two.

*   **If the fan spins but no cold air comes out:** The compressor might not be engaging, or refrigerant could be low. This needs a pro.
*   **If the fan doesn’t spin at all:** It could be a bad capacitor, a stuck motor, or a power issue. Do not try to push the fan blade manually while it’s powered—it’s dangerous.

## Practical Tips to Prevent Startup Failures

*   **Spring Tune-Up:** Schedule a professional maintenance visit in April/May. Technicians check capacitors, refrigerant levels, and electrical connections before the heat hits.
*   **Clear Debris:** Keep leaves, grass, and shrubs at least 2 feet away from the outdoor unit to ensure proper airflow.
*   **Change Filters:** A clogged filter can cause the system to overheat and shut down as a safety measure. Change it every 1–3 months.
*   **Test Early:** Turn your AC on for 15 minutes in early spring to ensure it works before you really need it.

## When to Call a 24/7 HVAC Technician

You’ve checked the basics, but some issues require licensed expertise. Call a pro if:

*   The breaker trips repeatedly
*   You smell burning or see smoke from the unit
*   The outdoor fan is humming but not spinning (bad capacitor)
*   The system turns on but blows warm air after 15 minutes
*   You hear grinding, screeching, or loud banging noises

Never attempt to open the electrical panels of the AC unit or handle refrigerant lines. High voltage and pressurized gases are dangerous. Let a certified technician diagnose and repair the fault.

## 🔍 Quick Q&A: Real Questions Homeowners Ask

### Q: Why did my AC breaker trip?
*   Power surge from lightning or grid fluctuation
*   Dirty condenser coils causing overheating
*   Failing capacitor or compressor drawing too much amps

### Q: Can I reset my AC myself?
*   Yes, by flipping the breaker off and on.
*   Wait 5 minutes before turning it back on to protect the compressor.
*   If it trips again, stop and call a pro.

### Q: Why is my thermostat blank?
*   Dead batteries (most common)
*   Tripped breaker cutting power to the thermostat
*   Loose wiring behind the thermostat faceplate

### Q: How long should I wait for the AC to start?
*   Most systems have a 5-minute delay to protect the compressor.
*   If it doesn’t start after 10 minutes, check power sources.
*   Persistent delays indicate a control board issue.

## 💡 Two Quick Fun Facts

*   The average AC unit lasts 10–15 years. If yours is older, startup failures are more common due to worn components.
*   Capacitors are like batteries for your AC motor. They give the extra jolt needed to start the fan and compressor. They are the most common part to fail in summer.

## Need a Reliable HVAC Technician Today?

If your AC won’t turn on, keeps tripping breakers, or isn’t cooling properly, don’t sweat it out. Visit **emergencycontractors.net** to connect with licensed, background-checked HVAC contractors in your area. We offer 24/7 emergency service calls, upfront pricing, and fast response times to get your home comfortable again. Stay cool, and let the pros handle the repair.""",
        "published_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "published": True
    },
    {
        "title": "Gutters Overflowing in Spring Rain? Preventing Water Damage to Walls & Foundations",
        "slug": "gutters-overflowing-spring-rain-gb",
        "excerpt": "Spring in the UK is beautiful, but it’s also wet. After months of autumn leaves and winter storms, your gutters are likely full of debris. When the heavy spring rains arrive, blocked gutters can’t do their job. Instead of channeling water away, they overflow, causing damage.",
        "content": """# Gutters Overflowing in Spring Rain? Preventing Water Damage to Walls & Foundations

Spring in the UK is beautiful, but it’s also wet. After months of autumn leaves and winter storms, your gutters are likely full of debris. When the heavy spring rains arrive, blocked gutters can’t do their job. Instead of channeling water away, they overflow, sending cascades of water down your walls, into your loft, or pooling around your foundations.

This isn’t just a nuisance; it’s a major cause of damp, mould, and structural damage. If you see water pouring over the edges of your gutters during a shower, you need to act fast. Here is how to assess the situation and prevent costly repairs.

## Step 1: Identify the Signs of Blockage

You don’t always need to climb up to spot a problem. Look for these tell-tale signs:

*   **Water overflowing:** During rain, water spills over the sides instead of flowing down the downpipe.
*   **Sagging gutters:** Heavy debris and standing water weigh down the guttering, causing it to pull away from the fascia board.
*   **Plants growing in gutters:** If you see weeds or moss sprouting from your roofline, it’s definitely blocked.
*   **Damp patches on walls:** Staining or dampness on external walls directly below the gutter line indicates overflow.
*   **Pooling water at foundations:** Water dripping straight down from the roof edge can erode soil and damage foundations.

## Step 2: Safety First – Do Not Climb Unsafely

Cleaning gutters is one of the most dangerous DIY tasks. Falls from ladders are a leading cause of home injury.

*   **Use a stable ladder:** Have someone hold the base. Never lean too far.
*   **Wear gloves:** Debris can be sharp, slimy, or contain bird droppings (which carry disease).
*   **Consider a professional:** If your house is more than one story, or if the roof pitch is steep, hire a professional gutter cleaner. It’s safer and often quicker.

## Step 3: Clear the Debris

If you decide to clean them yourself:

1.  Start near the downpipe and work outward.
2.  Scoop out leaves, twigs, and silt using a trowel or gutter scoop.
3.  Flush the gutters with a garden hose to check for flow and identify any remaining blockages in the downpipe.
4.  Check the downpipe outlet at ground level. Ensure it’s clear and directing water away from the house.

## Step 4: Check for Damage

While cleaning, inspect the guttering itself:

*   **Cracks or holes:** Small cracks can be sealed with waterproof sealant, but large splits need replacement.
*   **Loose brackets:** Tighten any loose screws or brackets holding the gutter to the fascia.
*   **Rust or corrosion:** Metal gutters may need treating or replacing if rusted through.
*   **Fascia board rot:** If the wood behind the gutter is soft or crumbling, it needs repair before re-hanging the gutter.

## Step 5: Install Gutter Guards (Optional but Recommended)

To reduce future maintenance, consider installing gutter guards or leaf screens. These mesh covers allow water through but keep leaves and debris out. They aren’t foolproof (fine silt can still accumulate), but they significantly reduce the frequency of cleaning needed.

## Practical Advice to Prevent Future Blockages

*   **Clean gutters at least twice a year:** late autumn (after leaves fall) and early spring.
*   **Trim overhanging tree branches** to reduce leaf drop onto the roof.
*   **Check downpipes regularly** for blockages, especially after storms.
*   **Ensure downpipes discharge into drains or soakaways**, not directly against the wall.

## When to Call a Professional Roofer or Gutter Specialist

You’ve cleared the debris, but some issues need expert attention. Book a callout if:

*   Gutters are sagging or pulling away from the wall
*   There are significant cracks or holes in the guttering
*   The fascia board is rotten and needs replacement
*   You are unable to access the gutters safely
*   Water is still overflowing despite clearing debris (indicating a hidden blockage or incorrect slope)

Never ignore overflowing gutters. The cost of cleaning is tiny compared to the cost of repairing damp walls, rotten timber, or foundation damage.

## 🔍 Quick Q&A: Real Questions Homeowners Ask

### Q: How often should I clean my gutters?
*   At least twice a year (autumn and spring).
*   More often if you have many overhanging trees.
*   After major storms to check for debris.

### Q: Can blocked gutters cause damp inside?
*   Yes. Overflowing water can seep into brickwork and cavities.
*   This leads to penetrating damp and mould growth indoors.
*   Keeping gutters clear is key to preventing internal damp.

### Q: Are gutter guards worth it?
*   They reduce cleaning frequency but don’t eliminate it.
*   Good for homes with many trees.
*   Still require occasional inspection for fine debris.

### Q: What causes gutters to sag?
*   Weight of debris and standing water.
*   Broken or loose brackets.
*   Age and wear of the gutter material.

## 💡 Two Quick Fun Facts

*   A single inch of rain on a 1,000 sq ft roof produces about 600 gallons of water. Your gutters need to handle that volume quickly!
*   The word "gutter" comes from the Old French "goutiere," meaning a channel for water.

## Need a Trusted Gutter Specialist Fast?

If your gutters are overflowing, sagging, or damaged, don’t wait for the next storm. Visit **emergencytradesmen.net** to connect with vetted, local roofers and gutter specialists who offer emergency callouts. We help you clear blockages, repair damage, and protect your home from water ingress. Stay dry, and let the experts handle the heights.""",
        "published_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "published": True
    }
]

# Insert into Supabase
for post in posts:
    response = requests.post(f"{url}/rest/v1/posts", headers=headers, data=json.dumps(post))
    if response.status_code in [200, 201]:
        print(f"Successfully published: {post['title']}")
    else:
        print(f"Failed to publish {post['title']}: {response.text}")
