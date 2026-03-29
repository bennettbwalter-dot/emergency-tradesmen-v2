import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsDir = path.join(__dirname);
const files = fs.readdirSync(scriptsDir);

const injectScripts = files.filter(f => 
    (f.startsWith('inject_verified_') || f.startsWith('import_mega_')) && 
    (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.cjs')) &&
    !f.includes('master_ingester')
).sort();

console.log(`🚀 Found ${injectScripts.length} injection scripts.`);

for (const script of injectScripts) {
    console.log(`\n📦 Running ${script}...`);
    try {
        const fullPath = path.join(scriptsDir, script);
        // Use ts-node if it's a .ts file, otherwise node
        const engine = script.endsWith('.ts') ? 'npx tsx' : 'node';

        const output = execSync(`${engine} "${fullPath}"`, { stdio: 'inherit', env: process.env });
    } catch (err) {
        console.error(`❌ Error running ${script}:`, err.message);
    }
}

console.log(`\n🎉 All identified batches have been processed.`);
