const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const blogsDir = 'c:/Users/Nick/Downloads/hitmaker-2026/emergency-tradesmen/optimized-blogs';

walk(blogsDir, (filePath) => {
  if (filePath.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('—')) {
      console.log(`Replacing in ${filePath}`);
      const newContent = content.replace(/—/g, '-');
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }
});
