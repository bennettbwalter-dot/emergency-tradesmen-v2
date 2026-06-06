const fs = require('fs');
const path = require('path');

const logFiles = [
  'vite-3000-live.log',
  'vite-3001-live.log',
  'vite-3002-live.log',
  'vite-3000.log',
  'vite-3001.log',
  'vite-3002-live.err.log',
  'vite-3000.err.log',
  'vite-3001.err.log'
];

logFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    console.log(`=== ${file} (Buffer length: ${buffer.length}) ===`);
    
    // Check for UTF-16 BOM (FF FE or FE FF)
    let encoding = 'utf8';
    if (buffer.length >= 2) {
      if ((buffer[0] === 0xFF && buffer[1] === 0xFE) || (buffer[0] === 0xFE && buffer[1] === 0xFF)) {
        encoding = 'utf16le';
      }
    }
    
    // If we detect no BOM, let's try to detect if it's UTF-16 by checking if every second byte is 0
    if (encoding === 'utf8' && buffer.length >= 4) {
      const zeroes = [buffer[1], buffer[3]].filter(x => x === 0).length;
      if (zeroes === 2) {
        encoding = 'utf16le';
      }
    }

    const content = buffer.toString(encoding);
    console.log(`Detected encoding: ${encoding}`);
    console.log(content.substring(0, 1000));
  } else {
    console.log(`${file} does not exist.`);
  }
});
