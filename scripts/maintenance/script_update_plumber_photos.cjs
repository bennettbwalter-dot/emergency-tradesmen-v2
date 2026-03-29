const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/businesses.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The new plumber images
const images = [
    "/images/trades/plumber-1.png",
    "/images/trades/plumber-2.png",
    "/images/trades/plumber-3.jpg",
    "/images/trades/plumber-4.png",
    "/images/trades/plumber-5.png"
];

const lines = content.split('\n');
let inPlumberArray = false;
let inObject = false;
let objectBuffer = [];
let plumberCount = 0;

const newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for start of plumber array: 8 spaces + "plumber: ["
    if (line.match(/^ {8}plumber: \[/)) {
        inPlumberArray = true;
        newLines.push(line);
        continue;
    }

    if (inPlumberArray) {
        // Check for end of plumber array: 8 spaces + "],"
        if (line.match(/^ {8}\],/)) {
            inPlumberArray = false;
            newLines.push(line);
            continue;
        }

        // Start of an object: 12 spaces + "{"
        if (line.match(/^ {12}\{/)) {
            inObject = true;
            objectBuffer = [line];
            continue;
        }

        if (inObject) {
            objectBuffer.push(line);
            // End of an object: 12 spaces + "},"
            if (line.match(/^ {12}\},/)) {
                inObject = false;
                processObject(objectBuffer);
                objectBuffer = [];
            }
            continue;
        }
    }

    // Default: just push the line
    newLines.push(line);
}

function processObject(lines) {
    // Determine images to use (cycle)
    const startIdx = (plumberCount * 2) % images.length;
    const img1 = images[startIdx];
    const img2 = images[(startIdx + 1) % images.length];

    plumberCount++;

    const photosField = `                photos: [
                    {
                        id: "p-${plumberCount}-1",
                        url: "${img1}",
                        isPrimary: true,
                        altText: "Emergency Plumber"
                    },
                    {
                        id: "p-${plumberCount}-2",
                        url: "${img2}",
                        isPrimary: false,
                        altText: "Plumbing Services"
                    }
                ],`;

    // Remove existing photos block if present
    const filteredLines = [];
    let skippingPhotos = false;

    // Need to handle nested brackets if scanning line by line?
    // "photos: [" (16 spaces)
    // "                ]," (16 spaces)

    for (const l of lines) {
        // Start of photos array: 16 spaces + "photos: ["
        if (l.match(/^ {16}photos: \[/)) {
            skippingPhotos = true;
            continue;
        }
        if (skippingPhotos) {
            // End of photos array: 16 spaces + "],"
            if (l.match(/^ {16}\],/)) {
                skippingPhotos = false;
            }
            continue;
        }
        filteredLines.push(l);
    }

    lines = filteredLines;

    // Remove the last line "            },"
    const lastLine = lines.pop();

    // Insert new photos
    lines.push(photosField);
    lines.push(lastLine); // Add "}," back

    // Push content
    for (const l of lines) {
        newLines.push(l);
    }
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log(`Updated ${plumberCount} plumber listings.`);
