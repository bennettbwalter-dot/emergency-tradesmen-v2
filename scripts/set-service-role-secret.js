
const { exec } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🔑  Set Up Supabase Service Role Key  🔑");
console.log("------------------------------------------");
console.log("This key is required for the `revolut-webhook` to update user subscriptions.");
console.log("You can find it in Supabase Dashboard > Settings > API > service_role (secret).\n");

rl.question('Paste your service_role key here: ', (key) => {
    if (!key) {
        console.error('❌ Key is required.');
        rl.close();
        return;
    }

    // Clean any whitespace
    const cleanKey = key.trim();

    console.log(`\nSetting secret...\n`);

    // Command to set secrets using Supabase CLI
    // Added --project-ref explicit hardcoded or auto-detected? 
    // Best to rely on linking or just add the flag if we know it.
    // The previous deployment worked with `antqstrspkchkoylysqa` so we will use that.

    const command = `npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="${cleanKey}" --project-ref antqstrspkchkoylysqa`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error setting secret: ${error.message}`);
            console.error(stderr);
        } else {
            console.log(`✅ Secret set successfully!`);
            console.log(stdout);
            console.log(`\nThe webhook is now fully configured!`);
        }
        rl.close();
    });
});
