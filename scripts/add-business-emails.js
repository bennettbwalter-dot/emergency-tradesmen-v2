// Script to add email addresses to all businesses
// Run with: node scripts/add-business-emails.js

const fs = require('fs');
const path = require('path');

// Generate email from business name
function generateEmail(businessName) {
    // Convert business name to email-friendly format
    const emailPrefix = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '')           // Remove spaces
        .substring(0, 30);              // Limit length

    return `${emailPrefix}@gmail.com`;
}

// Read the businesses.ts file
const businessesPath = path.join(__dirname, '..', 'src', 'lib', 'businesses.ts');
let content = fs.readFileSync(businessesPath, 'utf8');

// Find all business objects and add email field after phone
const businessPattern = /({\s*id:\s*"[^"]+",\s*name:\s*"([^"]+)",[\s\S]*?phone:\s*"[^"]*")/g;

content = content.replace(businessPattern, (match, capturedGroup, businessName) => {
    // Check if email already exists
    if (match.includes('email:')) {
        return match;
    }

    const email = generateEmail(businessName);
    return `${capturedGroup},\n                email: "${email}"`;
});

// Write back to file
fs.writeFileSync(businessesPath, content, 'utf8');

console.log('✅ Email addresses added to all businesses!');
console.log('📧 Format: businessname@gmail.com');
