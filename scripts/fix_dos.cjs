const fs = require('fs');
const path = require('path');

const dirs = [
    'scripts/content', 
    'emergency-content-orchestrator/optimized-blogs/uk-emergencytradesmen', 
    'emergency-content-orchestrator/optimized-blogs/usa-emergencycontractors'
];

let updatedCount = 0;

for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Strip inline styles previously added in specific files
        if (content.includes('style="background-color: rgba(46, 204, 113, 0.05)')) {
            content = content.replace(/<div class="dos-column"[^>]*>/g, '<div class="dos-column">');
            content = content.replace(/<div class="donts-column"[^>]*>/g, '<div class="donts-column">');
            content = content.replace(/<h3[^>]*>CAN<\/h3>/g, '<h3>CAN</h3>');
            content = content.replace(/<h3[^>]*>CANNOT<\/h3>/g, '<h3>CANNOT</h3>');
            modified = true;
        }

        // Replace `<div class="dos-donts">...</div>` correctly
        const dosDontsRegex = /<div class="dos-donts">([\s\S]*?)<\/div>/g;
        content = content.replace(dosDontsRegex, (match, innerHtml) => {
            const listItemsRegex = /<li>(.*?)<\/li>/g;
            let cans = [];
            let cannots = [];
            
            let itemMatch;
            while ((itemMatch = listItemsRegex.exec(innerHtml)) !== null) {
                let liText = itemMatch[1];
                let textContent = liText.replace(/<strong>.*?<\/strong>/, '').trim();
                
                // Determine category
                if (liText.match(/<strong>\s*(CANNOT|DON'T|DONT)/i)) {
                    // strip prefix
                    textContent = textContent.replace(/^(CAN:|CANNOT:|DO:|DON'T:|DON'T:|DONT:)\s*/i, '').trim();
                    textContent = textContent.replace(/^[:\-]\s*/, '').trim();
                    cannots.push(textContent);
                } else {
                    // default to CAN or 'DO'
                    textContent = textContent.replace(/^(CAN:|CANNOT:|DO:|DON'T:|DON'T:|DONT:)\s*/i, '').trim();
                    textContent = textContent.replace(/^[:\-]\s*/, '').trim();
                    cans.push(textContent);
                }
            }

            let newHtml = `<div class="split-dos-donts">\n`;
            newHtml += `    <div class="dos-column">\n`;
            newHtml += `        <h3>CAN</h3>\n`;
            newHtml += `        <ul>\n`;
            for (let can of cans) {
                newHtml += `            <li>${can}</li>\n`;
            }
            newHtml += `        </ul>\n`;
            newHtml += `    </div>\n`;
            
            newHtml += `    <div class="donts-column">\n`;
            newHtml += `        <h3>CANNOT</h3>\n`;
            newHtml += `        <ul>\n`;
            for (let cannot of cannots) {
                newHtml += `            <li>${cannot}</li>\n`;
            }
            newHtml += `        </ul>\n`;
            newHtml += `    </div>\n`;
            newHtml += `</div>`;
            
            modified = true;
            return newHtml;
        });

        if (modified) {
            fs.writeFileSync(filePath, content);
            updatedCount++;
        }
    }
}
console.log(`Updated ${updatedCount} files.`);
