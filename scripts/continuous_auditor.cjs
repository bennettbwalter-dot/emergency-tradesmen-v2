const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, 'audit_progress.json');

function runCommand(cmd) {
    console.log(`Executing: ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit' });
        return true;
    } catch (e) {
        console.error(`Command failed: ${cmd}`, e.message);
        return false;
    }
}

async function start() {
    console.log("================================================");
    console.log("🤖 STARTING AUTOMATED CONTINUOUS AUDITOR (UK -> USA)");
    console.log("================================================");
    
    // 1. UK Auditing Loop
    let ukFinished = false;
    while (!ukFinished) {
        console.log("\n--- Starting UK Batch Audit ---");
        
        // Before running, read processedCount
        let beforeCount = 0;
        if (fs.existsSync(PROGRESS_FILE)) {
            try {
                beforeCount = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')).processedCount || 0;
            } catch (e) {}
        }
        
        // Run UK audit batch
        const success = runCommand('node scripts/audit_listings.cjs --resume --limit=1000');
        
        // After running, check progress
        if (!fs.existsSync(PROGRESS_FILE)) {
            console.log("🎉 Progress file not found after run. UK auditing is complete!");
            ukFinished = true;
            break;
        }
        
        let afterCount = 0;
        try {
            afterCount = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')).processedCount || 0;
        } catch (e) {}
        
        console.log(`Progress: ${beforeCount} -> ${afterCount} audited.`);
        
        if (afterCount === beforeCount || afterCount >= 29340) {
            console.log("🎉 Reached the end of UK listings or no progress made.");
            ukFinished = true;
            break;
        }
        
        // Cooldown delay between batches to protect Supabase DB and DNS
        await new Promise(r => setTimeout(r, 3000));
    }
    
    console.log("\n================================================");
    console.log("🌐 UK SIDE COMPLETE! SWITCHING TO USA SIDE LISTINGS");
    console.log("================================================");
    
    // Reset/delete the progress file so US side starts fresh
    if (fs.existsSync(PROGRESS_FILE)) {
        fs.unlinkSync(PROGRESS_FILE);
    }
    
    // 2. US Auditing Loop (Run 10 batches of 1,000 for US side to get a great start!)
    console.log("Starting USA Listing Audits...");
    for (let batch = 1; batch <= 10; batch++) {
        console.log(`\n--- Starting US Batch ${batch}/10 ---`);
        runCommand('node scripts/audit_listings.cjs --region=US --resume --limit=1000');
        
        // Cooldown delay between batches
        await new Promise(r => setTimeout(r, 3000));
    }
    
    console.log("\n================================================");
    console.log("🎉 SUCCESS: AUTOMATED CONTINUOUS AUDITOR SESSION COMPLETE");
    console.log("================================================");
}

start();
