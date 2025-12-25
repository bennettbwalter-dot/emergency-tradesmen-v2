import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const post = {
    title: 'Emergency At Home: Your Complete Guide to Crisis Management',
    slug: 'emergency-at-home-guide',
    excerpt: 'From burst pipes to electrical fires, learn exactly what to do when a home emergency strikes. Expert advice on how to stay safe and minimize damage.',
    content: `Plumbing emergencies often escalate quickly because water spreads through floors, walls, and ceilings. Even a small leak can weaken structures, damage electrics, and create mould if left untreated. Burst pipes, overflowing toilets, and boiler leaks should always be treated as urgent.

![Emergency Plumber](/emergency-plumber-v2.jpg)

### How to help and what to do

*   Turn off the nearest water valve immediately to stop further flow
*   If you cannot identify the source, turn off the main water supply to the property
*   Switch off the boiler if hot water pipes are affected to prevent pressure buildup
*   Open taps to drain remaining water from the system
*   Avoid using electrical appliances near standing water to prevent shock risk
*   Move furniture, rugs, and valuables away from affected areas
*   Use towels, buckets, or a wet vacuum to control flooding
*   Keep internal doors open to improve air circulation and reduce moisture buildup
*   Do not attempt pipe repairs with tape or sealants during active leaks
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to find an emergency plumber when water cannot be safely contained

> **Helpful homeowner tip**
> Knowing where your main stopcock is can prevent thousands in damage. Locate it now, not during an emergency.

## Emergency Electrician Available 24 Hours a Day

Electrical emergencies can be dangerous because faults are often hidden behind walls or inside wiring. Burning smells, sparks, or repeated power failures may indicate overheating cables or failing components that could start a fire.

![Electrical Fire Hazard](/blog/emergency-at-home/electrical-fire.png)

### How to help and what to do

*   Turn off power at the fuse box if it is safe to do so
*   Never use water on electrical fires as it increases electrocution risk
*   Use a fire extinguisher only if it is designed for electrical fires
*   Evacuate the property if fire spreads or smoke increases
*   If someone is shocked, do not touch them until power is fully switched off
*   Call emergency services if there is injury or fire risk
*   During power cuts, unplug sensitive electronics to prevent surge damage
*   Avoid candles and use torches to reduce fire risk
*   Do not reset breakers repeatedly if they keep tripping
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to find an emergency electrician when faults persist

> **Helpful homeowner tip**
> Frequent breaker trips are a warning sign, not an inconvenience. Repeated resets can worsen electrical faults.

## Emergency Locksmith Available 24 Hours a Day

Lock emergencies can leave homeowners feeling exposed and unsafe, especially late at night. Broken locks or lockouts should be resolved carefully to avoid damage or security risks.

![Emergency Locksmith](/emergency-locksmith-v2.jpg)

### How to help and what to do

*   Stay calm and assess whether another entry point is safely accessible
*   Contact someone you trust who may have a spare key
*   Avoid forcing doors or windows as this often causes more damage
*   Keep well lit and visible if locked out at night
*   If a lock is damaged, secure the area and avoid leaving the property unattended
*   Change locks immediately if keys are lost or stolen
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to find a trusted emergency locksmith who can gain access without damage

> **Helpful homeowner tip**
> Keeping a spare key with a trusted neighbour can prevent many lock emergencies.

## Emergency Gas Engineer Available 24 Hours a Day

Gas emergencies are extremely serious and can be life threatening. Gas leaks and faulty appliances can lead to explosions or carbon monoxide poisoning if not handled correctly.

![Gas Emergency Safety](/blog/emergency-at-home/gas-emergency.jpg)

### How to help and what to do

*   Do not use flames, lighters, or electrical switches
*   Open doors and windows while leaving the property
*   Evacuate immediately and keep people and pets away
*   Turn off the gas supply at the main valve if it is safe
*   Call the emergency gas service from outside the property
*   Do not re-enter until professionals confirm it is safe
*   Arrange professional repairs immediately after the incident
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to find a qualified emergency gas engineer

> **Helpful homeowner tip**
> Install carbon monoxide alarms on every level of your home and test them regularly.

## Emergency Drain Specialist Available 24 Hours a Day

Drain emergencies often involve contaminated water and should be treated as a health risk. Sewage backups can spread bacteria and cause long term damage if not cleaned properly.

![Emergency Drain Works](/blog/emergency-at-home/drain-works.jpg)

### How to help and what to do

*   Stop using all water immediately to prevent further backup
*   Do not flush toilets or run taps
*   Keep children and pets away from affected areas
*   Turn off electricity if water is near sockets or appliances
*   Avoid chemical drain cleaners as they can worsen blockages
*   Ventilate the area to reduce odours
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to find an emergency drain specialist

> **Helpful homeowner tip**
> Slow draining sinks and gurgling sounds are early warning signs. Acting early can prevent full backups.

## Emergency Glazier Available 24 Hours a Day

Broken glass creates immediate safety risks and leaves your home exposed to intruders and weather.

![Emergency Glazier](/blog/emergency-at-home/glazier.png)

### How to help and what to do

*   Wear shoes and gloves before approaching broken glass
*   Keep children and pets away from the area
*   Carefully remove loose glass fragments
*   Cover the opening with boards or heavy plastic
*   Secure the area until repairs are completed
*   Report vandalism or break ins if applicable
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to contact an emergency glazier

> **Helpful homeowner tip**
> Avoid sweeping glass with bare hands. Small fragments can cause serious injuries.

## Emergency Breakdown Recovery Available 24 Hours a Day

Vehicle breakdowns can be dangerous, particularly on fast roads or in poor weather. Remaining visible and safe is essential.

![Emergency Breakdown Recovery](/blog/emergency-at-home/breakdown-recovery.png)

### How to help and what to do

*   Turn on hazard lights immediately
*   Pull over safely where possible
*   Stay inside the vehicle on busy roads
*   Wear a high visibility vest if exiting the vehicle
*   Place warning triangles if it is safe to do so
*   Call breakdown recovery services with your exact location
*   Contact emergency services if you feel unsafe
*   Use **[EmergencyTradesmen.net](https://emergencytradesmen.net/)** to find emergency breakdown recovery support

> **Helpful driver tip**
> Keep your phone charged and avoid standing behind or near traffic lanes.

## Preparing Your Home for Emergencies

Preparation reduces stress and limits damage.

### How to prepare

*   Locate and label water, gas, and electric shut offs
*   Keep emergency numbers accessible
*   Store torches, batteries, gloves, and first aid kits
*   Test smoke and carbon monoxide alarms regularly

## Preparing Your Vehicle for Emergencies

Preparation makes roadside emergencies safer.

### How to prepare

*   Carry a torch and phone charger
*   Store a high visibility vest and warning triangles
*   Keep a first aid kit in the vehicle
*   Maintain tyres, fluids, and battery regularly

## Why Use EmergencyTradesmen.net

When emergencies happen, finding the right professional quickly is critical.

**EmergencyTradesmen.net helps homeowners:**
*   Find verified local tradespeople
*   Access help twenty four hours a day
*   Search by trade and location
*   Contact professionals instantly
*   Avoid unreliable or unsafe services

## Final Thoughts

Emergencies are stressful, but knowledge gives control. Acting quickly, staying safe, and using **EmergencyTradesmen.net** to find qualified emergency tradespeople protects your home and your family when it matters most.

Preparation today saves time, money, and stress tomorrow.
`,
    cover_image: '/blog/emergency-at-home/glazier.png',
    published: true,
    published_at: new Date().toISOString()
};

async function publishPost() {
    console.log(`Publishing post: ${post.title}`);

    const { data, error } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error publishing post:', error);
    } else {
        console.log('Successfully published post:', data[0].title);
    }
}

publishPost();
