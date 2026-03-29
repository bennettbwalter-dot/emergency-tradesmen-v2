import fs from 'fs';

const csvPath = 'C:\\Users\\Nick\\Downloads\\hitmaker-2026\\emergency-tradesmen\\outreach_batch_1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse simple CSV (assuming we know the format doesn't have complex commas inside quotes, but actually we do have some)
const lines = csvContent.split('\n');
const tsvLines = lines.map(line => {
    if (!line) return '';
    // Very basic CSV to TSV regex, ignores escaped quotes but works for this simple dataset
    // We already quoted every field in the export script, so let's strip start/end quotes and replace "," with \t
    // Wait, our export script produced: "Email","FirstName",...

    // Better CSV parser
    const row = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                cur += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(cur);
                cur = '';
            } else {
                cur += char;
            }
        }
    }
    row.push(cur);
    return row.join('\t');
});

const tsvData = tsvLines.join('\n');

fs.writeFileSync('batch1.tsv', tsvData);
console.log('TSV file generated (length: ' + tsvData.length + ')');
