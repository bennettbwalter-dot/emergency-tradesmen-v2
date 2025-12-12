
const { exec } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n📧  Set Up SendGrid Secrets for Supabase  📧");
console.log("----------------------------------------------");
console.log("This script will help you set the necessary secrets for the `send-email` Edge Function.\n");

rl.question('Enter your SendGrid API Key (starts with SG...): ', (apiKey) => {
    if (!apiKey) {
        console.error('❌ API Key is required.');
        rl.close();
        return;
    }

    rl.question('Enter your "From" Email (must be verified in SendGrid): ', (fromEmail) => {
        if (!fromEmail) {
            console.error('❌ From Email is required.');
            rl.close();
            return;
        }

        console.log(`\nSetting secrets...\n`);

        // Command to set secrets using Supabase CLI
        // Using "npx supabase" to ensure we use the local installation
        const command = `npx supabase secrets set SENDGRID_API_KEY="${apiKey}" SENDGRID_FROM_EMAIL="${fromEmail}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error setting secrets: ${error.message}`);
                console.error(stderr);
            } else {
                console.log(`✅ Secrets set successfully!`);
                console.log(stdout);
                console.log(`\nNow you can deploy the function with:\n  npx supabase functions deploy send-email --no-verify-jwt`);
            }
            rl.close();
        });
    });
});
