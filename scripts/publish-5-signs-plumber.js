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
    title: '5 Signs You Need an Emergency Plumber Immediately',
    slug: '5-signs-you-need-emergency-plumber-immediately',
    excerpt: 'Water damage waits for no one. Learn the 5 critical signs that mean you need to pick up the phone and call an emergency plumber right now.',
    content: `# 5 Signs You Need an Emergency Plumber Immediately

![Emergency plumber working on a pipe under a sink](https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=1200&auto=format&fit=crop)

Water damage is one of the most expensive disasters a homeowner can face. While a dripping tap might seem minor, ignored plumbing issues can lead to catastrophic structural damage. This guide covers the 5 definitive signs that you need to call an emergency plumber immediately to save your home.

## What This Service Is

An emergency plumber is a specialized tradesperson available 24/7 to tackle urgent plumbing disasters. Unlike standard plumbers who work 9-5, these experts are equipped to handle crisis situations like uncontrolled leaks, burst pipes, and sewage backups at any hour.

They arrive quickly with the specific goal of stopping damage and restoring essential services. Their priority is containment and safety, ensuring your home is habitable or at least dry until permanent repairs can be made.

![Plumber explaining issue to homeowner](https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop)

## Common Problems This Solves

- Uncontrolled water pouring through ceilings
- Complete loss of water pressure
- Sewage backing up into the bath or sink
- Frozen pipes threatening to burst
- Boiler failure during freezing weather

## How The Process Works

1. Call Us – You contact a 24/7 emergency line describing your issue.
2. Dispatch – We locate the nearest verified engineer to your postcode.
3. Arrival – The plumber arrives, typically within 60 minutes, to assess the situation.
4. Containment – The immediate leak or danger is isolated to prevent further damage.
5. Repair – A permanent fix is applied or a temporary solution installed until parts arrive.

![Plumber fixing a pipe with tools](https://images.unsplash.com/photo-1581242163695-19d0acacd486?q=80&w=1200&auto=format&fit=crop)

## Why Choosing a Verified Professional Matters

Choosing a verified professional is crucial during an emergency when you are most vulnerable. [emergencytradesmen](https://emergencytradesmen.net/) ensures every tradesperson has been vetted for valid insurance and qualifications so you have peace of mind.

This protects you from "cowboy" traders who might exploit your panic with poor workmanship or inflated prices. A verified pro provides accountability and ensures the job is done safely and to code.

## Pricing & Response Times (Guide Only)

Prices vary depending on location, urgency, and complexity.

- Typical call-out range: £80 - £150
- Factors affecting price: Time of day (night/weekend is higher), complexity of leak, parts required
- Average response times: 30-90 minutes from call

![Reassuring handshake between tradesman and client](https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200&auto=format&fit=crop)

## Frequently Asked Questions

**Q: How quickly can an emergency plumber arrive?**
A: Most emergency plumbers aim to be with you within an hour, traffic permitting.

**Q: Do I need to turn off my water before they arrive?**
A: Yes, if possible. Locating and turning off your stopcock can save thousands in damage.

**Q: Is emergency plumbing covered by insurance?**
A: Often yes, "trace and access" and the resulting damage are covered, but check your specific policy. Resources like [Citizens Advice](https://www.citizensadvice.org.uk/consumer/insurance/insurance/) can help you understand your rights.

**Q: Do emergency plumbers carry spare parts?**
A: They carry common parts for standard leaks, but specific boiler parts may usually need ordering.

## When to Act Immediately

- Water is touching electrical fittings
- You cannot stop a leak using the stopcock
- You smell gas (call National Gas Emergency Service first and see [Gas Safe Register advice](https://www.gassaferegister.co.uk/)) or sewage
- There is a risk of ceiling collapse

![Clean and dry bathroom after repair](https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop)

## Conclusion

Ignoring these signs can turn a small leak into a major renovation project. If you spot any of these red flags, acting fast is the only way to minimize damage and cost.

Don't wait for "business hours"—protect your home by calling a professional now. Your home is your most valuable asset, and quick action is the best defense against water damage.

Find a verified emergency plumber near you today at [emergencytradesmen](https://emergencytradesmen.net/) to secure your home.
`,
    cover_image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=1200&auto=format&fit=crop',
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
