const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/showroom-templates/v0-compute-the-platform-to-build');

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath, callback);
        } else {
            callback(filepath);
        }
    }
}

console.log('Scanning files in:', targetDir);

const prefix = '/showroom-templates/v0-compute-the-platform-to-build';

walk(targetDir, (filepath) => {
    const ext = path.extname(filepath);
    if (!['.html', '.css', '.js'].includes(ext)) {
        return;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // 1. Replace absolute "/images/" references
    const imgRegex1 = /"\/images\//g;
    if (imgRegex1.test(content)) {
        content = content.replace(imgRegex1, `"${prefix}/images/`);
        modified = true;
    }
    const imgRegex2 = /'\/images\//g;
    if (imgRegex2.test(content)) {
        content = content.replace(imgRegex2, `'${prefix}/images/`);
        modified = true;
    }
    const imgRegex3 = /\(\/images\//g;
    if (imgRegex3.test(content)) {
        content = content.replace(imgRegex3, `(${prefix}/images/`);
        modified = true;
    }

    // 2. Replace other standard root-absolute asset paths from the locksmith template
    const assets = [
        'apple-icon.png',
        'icon.svg',
        'icon-dark-32x32.png',
        'icon-light-32x32.png',
        'placeholder-logo.png',
        'placeholder-logo.svg',
        'placeholder-user.jpg',
        'placeholder.jpg',
        'placeholder.svg'
    ];

    for (const asset of assets) {
        const regex1 = new RegExp(`"\\/${asset}"`, 'g');
        if (regex1.test(content)) {
            content = content.replace(regex1, `"${prefix}/${asset}"`);
            modified = true;
        }
        const regex2 = new RegExp(`'\\/${asset}'`, 'g');
        if (regex2.test(content)) {
            content = content.replace(regex2, `'${prefix}/${asset}'`);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated paths in: ${path.relative(targetDir, filepath)}`);
    }
});

console.log('Path correction complete!');
