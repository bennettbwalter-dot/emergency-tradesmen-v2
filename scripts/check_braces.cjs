
const fs = require('fs');
const content = fs.readFileSync('c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/src/pages/BusinessProfilePage.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');

lines.forEach((line, i) => {
    let openMatches = line.matchAll(/<div/g);
    for (const match of openMatches) {
        stack.push({ type: 'div', line: i + 1 });
    }
    let closeMatches = line.matchAll(/<\/div/g);
    for (const match of closeMatches) {
        if (stack.length === 0) {
            console.log(`Extra </div> on line ${i + 1}`);
        } else {
            stack.pop();
        }
    }
});

console.log(`Unbalanced open tags: ${stack.length}`);
stack.forEach(tag => console.log(`Open ${tag.type} on line ${tag.line}`));
