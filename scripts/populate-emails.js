import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const businessesPath = path.join(__dirname, '../src/lib/businesses.ts');

try {
    const content = fs.readFileSync(businessesPath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];

    let currentObjectBuffer = [];
    let insideBusinessObject = false;
    let hasWebsite = false;
    let hasEmail = false;
    let currentWebsite = '';

    // Regex for 12-space indentation start/end
    const startRegex = /^ {12}\{$/;
    // End regex: 12 spaces, then "}", optional comma
    const endRegex = /^ {12}\},?$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Remove \r for logic checks, but keep original line for output
        const cleanLine = line.replace(/\r$/, '');

        if (startRegex.test(cleanLine)) {
            // Flush previous buffer if somehow stuck (shouldn't happen)
            if (currentObjectBuffer.length > 0) {
                newLines.push(...currentObjectBuffer);
                currentObjectBuffer = [];
            }
            insideBusinessObject = true;
            hasWebsite = false;
            hasEmail = false;
            currentWebsite = '';
            currentObjectBuffer.push(line);
            continue;
        }

        if (insideBusinessObject) {
            currentObjectBuffer.push(line);

            // Check for website (ensure it's the expected line format to avoid false positives)
            const websiteMatch = cleanLine.match(/website:\s*"(https?:\/\/[^"]+)"/);
            if (websiteMatch) {
                hasWebsite = true;
                currentWebsite = websiteMatch[1];
            }

            // Check for email
            if (cleanLine.match(/email:\s*"/)) {
                hasEmail = true;
            }

            if (endRegex.test(cleanLine)) {
                // End of business object
                if (hasWebsite && !hasEmail && currentWebsite) {
                    try {
                        const url = new URL(currentWebsite);
                        const domain = url.hostname.replace(/^www\./, '');
                        // Find indentation of website line to match
                        const websiteLineIndex = currentObjectBuffer.findIndex(l => l.includes('website:'));
                        if (websiteLineIndex !== -1) {
                            // Extract indent from the actual line in buffer
                            const indentMatch = currentObjectBuffer[websiteLineIndex].match(/^(\s*)/);
                            const indent = indentMatch ? indentMatch[1] : '                ';

                            const emailLine = `${indent}email: "info@${domain}",` + (line.match(/\r$/) ? '\r' : '');

                            // Insert BEFORE website line
                            currentObjectBuffer.splice(websiteLineIndex, 0, emailLine);
                            console.log(`Injecting email for ${domain}`);
                        }
                    } catch (e) {
                        // Ignore invalid URLs
                    }
                }

                newLines.push(...currentObjectBuffer);
                currentObjectBuffer = [];
                insideBusinessObject = false;
            }
        } else {
            newLines.push(line);
        }
    }

    // Flush remaining
    if (currentObjectBuffer.length > 0) {
        newLines.push(...currentObjectBuffer);
    }

    fs.writeFileSync(businessesPath, newLines.join('\n'));
    console.log('Successfully updated business emails!');

} catch (error) {
    console.error('Error processing file:', error);
}
