const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'content');
if (!fs.existsSync(dir)) process.exit(1);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
let images = new Set();
for (let f of files) {
  let content = fs.readFileSync(path.join(dir, f), 'utf-8');
  let lines = content.split('\n');
  for (let line of lines) {
    if (line.includes('<img ')) {
        let m = line.match(/src=\"([^\"]+)\"/);
        if(m && m[1]) images.add(m[1]);
    }
    if (line.includes('![')) {
        let m = line.match(/!\[.*?\]\((.*?)\)/);
        if(m && m[1]) images.add(m[1]);
    }
  }
}
console.log(Array.from(images).join('\n'));
