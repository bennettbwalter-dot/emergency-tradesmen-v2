
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const post = {
    title: 'Blocked Drains vs. Flooded Sewers: How to Spot the Danger',
    slug: 'blocked-drains-vs-flooded-sewers-danger-guide',
    excerpt: 'Not sure if your drain is blocked or the sewer is flooded? Learn the signs, the health risks of black water, and how to find emergency help quickly using smart tech.',
    content: `Let’s be honest: plumbing is one of those things we all take for granted—until it stops working. One minute you’re washing the dishes, and the next, the water just won’t go down. Or worse, it starts coming back up.

It’s stressful, messy, and can send anyone into a bit of a panic. But before you grab the plunger or worry about the cost, it’s really important to know what you’re dealing with. Is it just a stubborn sink, or is it a major sewer backup?

The difference isn't just about the mess—it’s about your health. One is a nuisance; the other is a serious biohazard that needs professional gear, not just a pair of rubber gloves.

Here is a simple, no-nonsense guide to spotting the difference and staying safe.

## 1. Is it a Blockage or a Backup?

![Blocked Drains vs. Flooded Sewers Comparison](/blog/blocked-drains/blocked-vs-flooded-main.jpg "Blocked Drains vs Flooded Sewers")

To the untrained eye, water pooling in a pipe looks the same. But there are a few tell-tale signs that can help you figure out if this is a quick fix or an emergency.

### The "Local" Blockage (Usually Your Responsibility)

Think of this as an isolated incident. It’s annoying, but usually contained.

*   **One thing at a time**: If your kitchen sink is clogged but the toilet flushes fine, the problem is likely just in the pipe under that sink.
*   **Slow draining**: The water eventually goes down, but it takes forever.
*   **The "Nasty Whiff"**: You might smell rotting food or old soap right near the plughole. It’s unpleasant, but it’s usually just debris stuck in the U-bend.

### The Sewer Flood (The Serious Stuff)

This is when the main system fails. It’s like a traffic jam on the motorway—nothing moves, and it affects everyone.

*   **Everything is acting up**: You flush the toilet, and suddenly water gurgles up in the shower or the bath. This happens because the wastewater has nowhere to go, so it tries to escape through the lowest point in your house.
*   **The "See-Saw" Effect**: You might notice the water level in your toilet rising and falling all by itself. This is caused by pressure shifts in the main sewer line.
*   **Check outside**: If you can safely see your outdoor inspection chamber (manhole), take a look. If waste is leaking out or the cover has popped up, that’s a confirmed sewer failure.

![Sewage Overflow](/blog/blocked-drains/sewer-overflow.jpg "Sewage escaping from a clogged drain")

## 2. Why You Shouldn't Touch Sewage

It’s tempting to try and clean up a mess yourself to save money, but sewer water is different. In the trade, we call it Category 3 "Black Water".

That sounds scary because it is. It’s not just dirty water; it’s carrying raw waste, which is full of nasty things that can make you very sick.

### The Health Risks

*   **The Bugs**: Sewage is home to bacteria like E. coli and Salmonella, plus viruses like Norovirus.
*   **The Resilience**: Some parasites found in sewage are tough—standard household cleaners often won’t kill them.
*   **The Gases**: In enclosed spaces, sewage can release gases like methane and hydrogen sulfide (that rotten egg smell), which are dangerous to breathe in.

![Fatberg Accumulation](/blog/blocked-drains/blocked-drain-grease.jpg "Fat and grease accumulation blocking a drain")

> **Friendly Advice**: Please don’t try to mop up a major sewage spill with just bleach and a bucket. Professionals use industrial disinfectants and protective suits for a reason. If carpet or drywall gets soaked with black water, it usually needs to be ripped out to prevent dangerous mould.

## 3. Who Do I Call?

Since the rules changed in 2011, figuring out who pays for the fix is actually simpler than it used to be.

### When to Call the Water Company

If the blockage is in the **Lateral Drain** (the pipe that runs from your property to the sewer, usually under the pavement) or the **Public Sewer** (pipes shared by neighbours), it’s usually the water company’s job to fix it.

If you see sewage spilling outside or suspect a main sewer issue, call your local water authority immediately. They have 24-hour emergency lines.

### When to Call a Pro

If the blockage is inside your property boundary and serves only your home (like your sink, toilet, or driveway drain), it’s down to you to get it sorted.

Finding a reliable tradesperson in an emergency used to be a hassle, but technology has made it much smoother. You can use smart platforms like **[emergencytradesmen](https://emergencytradesmen.net/)** to instantly connect with verified local engineers. It takes the guesswork out of a stressful situation and gets help to your door fast.

For more legal details on who owns which pipe, **[Citizens Advice](https://www.citizensadvice.org.uk/)** has a great guide.

## 4. What to Do Right Now

![Flooded Street](/blog/blocked-drains/flooded-sewer-street.jpg "Street flooded by blocked sewer")

### If It’s a Sewer Backup:

1.  **Stop!** Don’t run the tap, don't use the washing machine, and definitely don't flush the toilet. You’ll just add to the flood.
2.  **Ask the neighbours**: If they have the same problem, it’s a public sewer issue.
3.  **Stay safe**: Keep kids and pets well away from the mess.

### If It’s a Private Blockage:

1.  **Try the basics**: A plunger can work wonders on a sink. But be careful with harsh chemical cleaners—they can actually damage your pipes and are bad for the environment.
2.  **Get expert help**: If you can’t shift it, don't force it. Use **[emergencytradesmen](https://emergencytradesmen.net/)** to find a specialist who can clear it safely using the right tech.
3.  **Check your cover**: Take a look at your home insurance. Some policies have "Home Emergency" cover that might pay for the call-out.

## 5. A Final Tip: Bin the Wipe!

Want to avoid this headache in the future? The biggest villain in UK drains is the wet wipe. Even the ones that say "flushable" often aren't. They mix with cooking fat to create "fatbergs" that block pipes solid.

**The Golden Rule**: Only flush the "Three Ps"—Pee, Poo, and Paper. Everything else goes in the bin.

Stay dry and stay safe!`,
    cover_image: '/blog/blocked-drains/blocked-vs-flooded-main.jpg',
    published: true,
    published_at: new Date().toISOString()
};

async function publishPost() {
    console.log('Publishing blog post...');

    const { data, error } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error(`Error publishing post "${post.title}": `, error.message);
    } else {
        console.log(`Successfully published post: ${post.title} `);
    }
}

publishPost();
