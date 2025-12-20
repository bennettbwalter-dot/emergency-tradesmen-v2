const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Index.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update Tagline
content = content.replace('When You Need Them Most', 'When you need them most');

// Update Description
// Using a simpler regex that doesn't worry about exact whitespace/newlines but matches the core text
const oldDescRegex = /24\/7 verified plumbers.*?No call-out fee if we can't help\./s;
const newDesc = `<span className="hidden md:inline">
                      Find trusted local emergency tradespeople fast.<br />
                      Describe your emergency or search and call immediately
                    </span>
                    <span className="md:hidden">
                      Find local emergency help and call now
                    </span>`;

content = content.replace(oldDescRegex, newDesc);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Index.tsx');
