import fs from 'fs';
import path from 'path';

function generateSql() {
    console.log("Reading batch 1 CSV to generate direct SQL update...");

    const csvPath = 'C:\\Users\\Nick\\Downloads\\hitmaker-2026\\emergency-tradesmen\\outreach_batch_1.csv';
    if (!fs.existsSync(csvPath)) {
        console.error("Batch 1 CSV not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    // Skip header
    lines.shift();

    const emails = lines.map(line => {
        // Basic CSV parsing for the first column (Email) which is quoted
        const match = line.match(/^"([^"]+)"/);
        return match ? match[1] : null;
    }).filter(e => e !== null);

    console.log(`Found ${emails.length} emails.`);

    // Generate the SQL statement
    const emailList = emails.map(e => `'${e.replace(/'/g, "''")}'`).join(',\n  ');

    const sql = `
-- Update the 100 leads from Batch 1 to mark them as emailed
UPDATE businesses
SET last_emailed_at = NOW()
WHERE email IN (
  ${emailList}
);
`;

    const outputPath = 'C:\\Users\\Nick\\Downloads\\hitmaker-2026\\emergency-tradesmen\\mark_batch_1_emailed.sql';
    fs.writeFileSync(outputPath, sql.trim());
    console.log(`\nSQL script generated successfully at: ${outputPath}`);
}

generateSql();
