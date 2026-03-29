const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'content');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

console.log("Blogs missing body images:");
for (let f of files) {
  let content = fs.readFileSync(path.join(dir, f), 'utf-8');
  let images = [];
  
  // Find all src="..." for img tags
  let m1 = content.match(/<img[^>]+src=\"([^\"]+)\"/g);
  if (m1) {
    m1.forEach(m => {
      let match = m.match(/src=\"([^\"]+)\"/);
      if (match) images.push(match[1]);
    });
  }
  
  // Find all ![]() entries
  let m2 = content.match(/!\[.*?\]\((.*?)\)/g);
  if (m2) {
    m2.forEach(m => {
      let match = m.match(/!\[.*?\]\((.*?)\)/);
      if (match) images.push(match[1]);
    });
  }
  
  // Filter out the 3 "related posts" images
  let nonRelated = images.filter(img => !img.includes('related-post'));
  
  if (nonRelated.length < 3) {
      console.log(`- ${f} has only ${nonRelated.length} main images.`);
      // console.log(`  Current images: ${nonRelated.join(', ')}`);
  }
}
