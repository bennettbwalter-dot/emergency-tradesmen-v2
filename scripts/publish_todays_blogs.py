import os
import requests
import json
from datetime import datetime

# Supabase Configuration — matches the project used across all scripts
SUPABASE_URL = "https://xwqvhymkwuasotsgmarn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# ─────────────────────────────────────────────────────────────────────────────
# HTML TEMPLATE BUILDER
# Matches the "Funky Magazine" layout shown in the reference image:
#   - Hero image full-width (portrait card, added later)
#   - Country badge
#   - Large title
#   - Intro paragraph
#   - Numbered step cards
#   - Practical tips block
#   - Q&A grey cards
#   - Fun facts highlight box
#   - CTA button
# ─────────────────────────────────────────────────────────────────────────────

def build_step(number, title, body_html):
    return f"""
<div class="blog-step-card">
  <div class="blog-step-header">
    <span class="blog-step-number">Step {number}</span>
    <h2>{title}</h2>
  </div>
  <div class="blog-step-body">
    {body_html}
  </div>
</div>
"""

def build_tips(title, items_html):
    return f"""
<div class="blog-tips-block">
  <h2>{title}</h2>
  <ul>
    {items_html}
  </ul>
</div>
"""

def build_when_to_call(title, items_html):
    return f"""
<div class="blog-when-block">
  <h2>{title}</h2>
  <ul>
    {items_html}
  </ul>
</div>
"""

def build_qa(questions):
    """questions: list of (q, answers_list)"""
    cards = ""
    for q, answers in questions:
        answers_html = "".join(f"<li>{a}</li>" for a in answers)
        cards += f"""
<div class="blog-qa-card">
  <p class="blog-qa-q">Q: {q}</p>
  <ul>{answers_html}</ul>
</div>
"""
    return f"""
<div class="blog-qa-section">
  <h2>🔍 Quick Q&amp;A: Real Questions Readers Ask</h2>
  {cards}
</div>
"""

def build_fun_facts(facts):
    facts_html = "".join(f"<li>{f}</li>" for f in facts)
    return f"""
<div class="blog-fun-facts">
  <h2>💡 Two Quick Fun Facts</h2>
  <ul>{facts_html}</ul>
</div>
"""

def build_comparison_grid(green_title, green_items, red_title, red_items):
    green_li = "".join(f"<li>{item}</li>" for item in green_items)
    red_li = "".join(f"<li>{item}</li>" for item in red_items)
    return f"""
<div class="blog-comparison-grid">
  <div class="blog-comp-col green">
    <div class="blog-comp-header"><span>✓</span> {green_title}</div>
    <ul class="blog-comp-list">{green_li}</ul>
  </div>
  <div class="blog-comp-col red">
    <div class="blog-comp-header"><span>✕</span> {red_title}</div>
    <ul class="blog-comp-list">{red_li}</ul>
  </div>
</div>
"""

def build_cta(headline, body, site_url, link_label="Find a Professional Now"):
    return f"""
<div class="blog-cta-block">
  <h2>{headline}</h2>
  <p>{body}</p>
  <a href="{site_url}" class="blog-cta-btn" target="_blank" rel="noopener noreferrer">{link_label} →</a>
</div>
"""

# ─────────────────────────────────────────────────────────────────────────────
# US BLOG: Water Heater Leaking or No Hot Water
# ─────────────────────────────────────────────────────────────────────────────

us_content = """
<div class="blog-magazine-wrap">

<p class="blog-intro">
There is nothing quite like stepping into a shower expecting warm water and getting hit with an icy blast instead.
Or maybe you walk into your utility room and notice a puddle forming around the base of your water heater.
In the US, water heaters work hard year-round, but they often show their age right when spring turns to summer
and household water usage spikes. Before you panic about a full replacement or dial a 24/7 emergency plumber,
there are a few simple checks you can do yourself. Most of the time, the issue is straightforward.
</p>

<p>Let's walk through it calmly, step by step.</p>

""" + build_step(1, "Check the Power or Gas Supply", """
<p>If you have an <strong>electric water heater</strong>, head to your main breaker panel. Look for the breaker
labeled "Water Heater" or "WH." If it's tripped (stuck in the middle or flipped off), turn it fully off,
then back on.</p>
<p>If you have a <strong>gas unit</strong>, check that the gas valve is in the "On" position and the pilot light
is lit. Follow the manufacturer's relighting instructions carefully. <strong>Never</strong> force a gas valve or
ignore the smell of gas. If you smell rotten eggs, leave the house and call your gas company immediately.</p>
""") + build_step(2, "Verify the Thermostat Settings", """
<p>Sometimes the thermostat gets bumped or resets after a power flicker. Remove the access panel (turn off power
first for electric units) and check the temperature dial.</p>
<p>The recommended setting is <strong>120°F</strong>. This is hot enough for comfortable showers and dishwashing
but low enough to prevent scalding. If it's set too low, raise it slightly and wait an hour. For dual-element
electric heaters, check both the upper and lower thermostats.</p>
""") + build_comparison_grid(
    "Safe DIY Maintenance",
    ["Checking circuit breakers", "Resetting the red button", "Visual leak inspection", "Flushing sediment"],
    "Call a Pro Immediately",
    ["Smelling gas/rotten eggs", "Internal tank corrosion", "Failing gas valves", "Repeated electrical trips"]
) + build_step(3, "Inspect for Leaks and the T&P Valve", """
<p>A small puddle doesn't always mean your tank is failing. Check the connections at the top: the cold water inlet
and hot water outlet pipes. Tighten any loose fittings gently with a wrench.</p>
<p>Next, look at the <strong>Temperature and Pressure (T&P) relief valve</strong> on the side or top of the tank.
If it's dripping, place a bucket under the discharge pipe and monitor it. If water keeps flowing after pressure
normalizes, the valve needs replacement.</p>
""") + build_step(4, "Flush Sediment Buildup", """
<p>If your water heater is making popping, rumbling, or cracking noises, sediment is likely trapped at the bottom.
Minerals from hard water settle over time, insulating the heating element. You can flush it yourself:</p>
<ol>
  <li>Turn off power or gas.</li>
  <li>Attach a garden hose to the drain valve at the bottom.</li>
  <li>Run the hose to a floor drain or outside.</li>
  <li>Open the drain valve and let water flow until it runs clear.</li>
  <li>Close the valve, remove the hose, refill, and restore power.</li>
</ol>
""") + build_step(5, "Press the Reset Button (Electric Units Only)", """
<p>Electric water heaters have a <strong>red reset button</strong> near the upper thermostat. If the unit
overheats or experiences a power surge, this button pops out to cut power.</p>
<p>Turn off the breaker, remove the access panel, press the reset button firmly, replace the panel, and turn the
breaker back on. <strong>If it trips again within a day, do not keep resetting it.</strong> This points to a
failing heating element or wiring issue that needs a licensed technician.</p>
""") + build_tips("Practical Tips to Keep Your Water Heater Running Strong", """
<li>Test the T&P valve once a year by lifting the lever slightly — water should discharge and stop when released.</li>
<li>Insulate hot water pipes and the tank itself to reduce heat loss.</li>
<li>Keep the area around the unit clear — gas heaters need airflow for safe combustion.</li>
<li>Schedule a professional flush and inspection every 1–2 years, especially in hard water areas.</li>
""") + build_when_to_call("When to Call a 24/7 Plumber or Technician", """
<li>Water is pooling heavily from the bottom of the tank (likely internal corrosion)</li>
<li>You smell gas or hear hissing near a gas unit</li>
<li>Hot water is discolored, rusty, or smells like sulfur</li>
<li>The breaker trips repeatedly or the reset button won't stay engaged</li>
<li>The unit is over 10–12 years old and showing multiple failure signs</li>
""") + """

<p>Never attempt to replace gas valves, heating elements, or internal tank components unless you are licensed.
Water heaters operate under high pressure and temperature. Incorrect repairs can lead to flooding, electrical
shock, or even tank rupture.</p>

<hr class="blog-divider" />

""" + build_qa([
    ("Why is my water heater making popping noises?", [
        "Sediment buildup trapping steam bubbles",
        "Hard water minerals settling at the tank bottom",
        "Overheating due to poor heat transfer"
    ]),
    ("How long should a water heater last?", [
        "Traditional tank units: 8–12 years",
        "Tankless models: 15–20 years with maintenance",
        "Water quality and usage heavily impact lifespan"
    ]),
    ("Why is my hot water running out so fast?", [
        "Broken dip tube mixing cold and hot water",
        "Failing lower heating element (electric)",
        "Undersized unit for current household demand"
    ]),
    ("Is a leaking water heater dangerous?", [
        "Small drips from valves are usually manageable",
        "Tank bottom leaks indicate internal failure",
        "Shut off water and power, then call a pro immediately"
    ])
]) + build_fun_facts([
    "The average US household uses about 64 gallons of water per day. Your water heater is likely the second-largest energy user in your home after HVAC.",
    "Tankless water heaters heat water on demand and can cut energy costs by up to 30%, but they require proper sizing and gas/electrical upgrades."
]) + build_cta(
    "Need a Reliable Water Heater Technician Today?",
    "If your unit is leaking, making strange noises, or leaving you with cold showers, don't wait for a flood. Connect with licensed, background-checked plumbers and water heater specialists in your area — 24/7 emergency service calls, upfront pricing, and fast response times.",
    "https://emergencycontractors.net",
    "Find a Contractor Now"
) + """
</div>
"""

# ─────────────────────────────────────────────────────────────────────────────
# UK BLOG: Car Won't Start on a Spring Journey
# ─────────────────────────────────────────────────────────────────────────────

uk_content = """
<div class="blog-magazine-wrap">

<p class="blog-intro">
You've packed the boot, the kids are buckled in, and you're ready for a spring weekend away. You turn the key,
and instead of the engine roaring to life, you hear a rapid clicking sound. Or worse, complete silence.
It's a familiar frustration for many UK drivers, especially after a damp winter that takes a heavy toll on
car batteries and electrical systems. Take a breath. Before you ring for breakdown recovery, there are a few
safe, practical checks you can do yourself.
</p>

<p>Let's go through them calmly, so you can either get moving again or wait for help safely.</p>

""" + build_step(1, "Listen to the Sound and Check the Dashboard", """
<p>The noise your car makes when you turn the key tells you a lot:</p>
<ul>
  <li><strong>Rapid clicking</strong> — battery is flat but the starter motor is trying to engage.</li>
  <li><strong>Single click</strong> — faulty starter motor or poor battery connection.</li>
  <li><strong>Complete silence</strong> — dead battery, blown fuse, or immobiliser issue.</li>
</ul>
<p>Look at your dashboard. Are the lights dim or flickering? Is there a battery warning symbol?
If the dash is completely dark, the battery is likely fully drained or disconnected.</p>
""") + build_comparison_grid(
    "Safe Roadside Checks",
    ["Visual battery inspection", "Cleaning terminal corrosion", "Jump starting with leads", "Checking fuel & key fobs"],
    "Dangerous Risks",
    ["Opening hot radiator caps", "Working under heavy traffic", "Major engine disassembly", "Touching exposed wiring"]
) + build_step(2, "Check Battery Terminals and Connections", """
<p>Pop the bonnet and locate the battery. Check the terminals for white, blue, or green corrosion —
this powdery buildup blocks electrical flow. If you see it:</p>
<ol>
  <li>Disconnect the terminals (negative first, then positive).</li>
  <li>Clean them with a wire brush or baking soda and water.</li>
  <li>Reconnect tightly (positive first, then negative).</li>
</ol>
<p>Sometimes a loose or corroded connection is all that's stopping your car from starting. Ensure the battery
is securely mounted and not cracked or leaking.</p>
""") + build_step(3, "Try a Safe Jump Start", """
<p>If you have jump leads and access to another vehicle, you can often revive a flat battery:</p>
<ol>
  <li>Park the working car close but not touching. Turn both engines off.</li>
  <li>Connect the <strong>red lead</strong> to the positive (+) terminal on the dead battery, then to the positive on the good battery.</li>
  <li>Connect the <strong>black lead</strong> to the negative (−) on the good battery, then to an unpainted metal part of the dead car's engine block.</li>
  <li>Start the working car and let it run for a few minutes, then try starting your car.</li>
  <li>If it starts, leave it running for at least 20 minutes to recharge.</li>
</ol>
""") + build_step(4, "Check for Fuel and Immobiliser Issues", """
<p>It sounds obvious, but running out of fuel is a leading cause of breakdowns. Check your gauge.
If you recently refuelled, ensure you used the correct type (petrol vs diesel) — misfuelling can cause serious damage.</p>
<p>Also, check your <strong>key fob</strong>. If the battery is dead, the immobiliser may not recognise the key.
Try holding the fob directly against the start button or using the spare key. Some cars have a manual override slot
for emergency starts.</p>
""") + build_step(5, "Assess Tyres and Warning Lights", """
<p>If the car starts but feels unstable, check your tyres. Spring road trips often reveal slow punctures or worn
tread that went unnoticed in winter. Use a gauge to check pressure and look for bulges, cracks, or objects embedded
in the rubber.</p>
<p>If a tyre is flat and you have a spare, change it only if you are on <strong>safe, level ground</strong> away
from traffic. If you're on a hard shoulder or busy road, <strong>stay inside the vehicle</strong> with seatbelts
on and call for help.</p>
""") + build_tips("Practical Advice to Prevent Spring Breakdowns", """
<li>Test your battery before long journeys — most garages offer free checks, or use a multimeter (healthy reading: 12.6V+).</li>
<li>Keep an emergency kit in your boot: jump leads, warning triangle, high-vis vest, torch, and a basic first aid kit.</li>
<li>Check tyre pressure and tread depth monthly — the legal minimum is 1.6mm, but 3mm is safer for wet spring roads.</li>
<li>Service your car annually — oil changes, filter replacements, and brake checks catch small faults before they strand you.</li>
""") + build_when_to_call("When to Call Breakdown Recovery", """
<li>The car won't jump start or dies immediately after starting</li>
<li>You smell burning, see smoke, or notice fluid leaks under the bonnet</li>
<li>You have a flat tyre but no spare or unsafe conditions to change it</li>
<li>Warning lights (engine, oil, brake) stay on after starting</li>
<li>You are stranded on a motorway, hard shoulder, or unsafe location</li>
""") + """

<p>Never attempt major repairs on the roadside. Traffic moves fast, and visibility can be poor. Your safety comes first.
Move to a safe spot, turn on hazard lights, place a warning triangle if safe, and wait for recovery.</p>

<hr class="blog-divider" />

""" + build_qa([
    ("Why does my car battery keep going flat?", [
        "Short journeys don't allow the alternator to recharge it fully",
        "Parasitic drain from dashcams, alarms, or interior lights",
        "Age — most batteries last 3–5 years in UK climate"
    ]),
    ("Can I jump start a car in the rain?", [
        "Yes, but keep connections dry and avoid touching metal parts",
        "Use insulated jump leads and stand on dry ground if possible",
        "If heavy rain or lightning is present, wait for recovery"
    ]),
    ("What should I do if I break down on a motorway?", [
        "Pull onto the hard shoulder or emergency refuge area",
        "Turn on hazard lights and side lights",
        "Exit via the passenger door and wait behind the barrier"
    ]),
    ("How long should I drive after a jump start?", [
        "At least 20–30 minutes at steady speed to recharge the battery",
        "Stop-start traffic won't charge it efficiently",
        "Consider a proper battery charge or replacement if it dies again"
    ])
]) + build_fun_facts([
    "The average UK driver experiences a breakdown once every three years. Battery failure accounts for over 40% of all callouts.",
    "Modern car batteries are maintenance-free, but cold, damp winters reduce their capacity by up to 30%, making spring a peak time for failures."
]) + build_cta(
    "Need Trusted Breakdown Recovery Fast?",
    "If your car won't start, you're stranded roadside, or you need a safe tow to a garage, don't risk it. Connect with vetted, local breakdown recovery operators who offer emergency callouts — honest pricing, no long waits.",
    "https://emergencytradesmen.net",
    "Find Recovery Near You"
) + """
</div>
"""

# ─────────────────────────────────────────────────────────────────────────────
# Posts to publish
# ─────────────────────────────────────────────────────────────────────────────

now = datetime.now().isoformat()

posts = [
    {
        "title": "Water Heater Leaking or No Hot Water? Quick Checks Before Calling a 24/7 Technician",
        "slug": "water-heater-leaking-no-hot-water-checks-us",
        "excerpt": "Before you panic about a full replacement or call a 24/7 emergency plumber, there are a few simple checks you can do yourself on your water heater. Most of the time, the issue is straightforward and you can save time and money.",
        "content": us_content,
        "published_at": now,
        "created_at": now,
        "published": True,
    },
    {
        "title": "Car Won't Start on a Spring Journey? Safe Checks Before Calling Breakdown Recovery",
        "slug": "car-wont-start-spring-breakdown-checks-gb",
        "excerpt": "It's a familiar frustration for many UK drivers, especially after a damp winter. Before you ring for breakdown recovery, there are a few safe, practical checks you can do yourself to get moving again.",
        "content": uk_content,
        "published_at": now,
        "created_at": now,
        "published": True,
    }
]

# ─────────────────────────────────────────────────────────────────────────────
# Duplicate check + publish
# ─────────────────────────────────────────────────────────────────────────────

for post in posts:
    slug = post["slug"]
    # Check for existing slug
    check_url = f"{SUPABASE_URL}/rest/v1/posts?select=id,slug&slug=eq.{slug}"
    check_resp = requests.get(check_url, headers=HEADERS)
    existing = check_resp.json() if check_resp.status_code == 200 else []

    if existing:
        print(f"[UPDATE] Slug exists, patching: {slug}")
        post_id = existing[0]['id']
        resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/posts?id=eq.{post_id}",
            headers=HEADERS,
            data=json.dumps(post)
        )
    else:
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/posts",
            headers=HEADERS,
            data=json.dumps(post)
        )
    
    if resp.status_code in [200, 201, 204]:
        print(f"[OK] { 'Patched' if existing else 'Published' }: {post['title']}")
    else:
        print(f"[FAIL] ({resp.status_code}): {post['title']}")
        print(resp.text[:500])
