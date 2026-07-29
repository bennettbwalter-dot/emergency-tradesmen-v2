import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGETS = ['src', 'optimized-blogs', 'docs'];
const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.txt', '.tsx', '.ts', '.jsx', '.js', '.html']);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.wrangler',
  '.playwright-cli',
  'output',
  'tmp',
  '_logs',
]);

const patterns = [
  { name: 'em dash', regex: /—/g },
  { name: 'throat clearing', regex: /\b(it is important to note|it'?s important to note|in today'?s|this guide will|in this article)\b/gi },
  { name: 'formulaic AI phrase', regex: /\b(delve into|unlock|game[- ]changer|seamless experience|robust solution|elevate your|navigate the complexities)\b/gi },
  { name: 'public internal blog note', regex: /<h2>\s*(\d+\.\s*)?(Social Media Post|SEO Implementation Checklist|Regional Lock Verification)\s*<\/h2>/gi },
  { name: 'markdown internal blog note', regex: /^#{1,6}\s*(\d+\.\s*)?(Social Media Post|SEO Implementation Checklist|Regional Lock Verification)\s*$/gim },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), files);
      continue;
    }
    const file = path.join(dir, entry.name);
    if (TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) files.push(file);
  }
  return files;
}

function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

const findings = [];

for (const target of TARGETS) {
  for (const file of walk(path.join(ROOT, target))) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        findings.push({
          file: rel,
          line: lineForIndex(text, match.index),
          rule: pattern.name,
          text: match[0].replace(/\s+/g, ' ').slice(0, 100),
        });
      }
    }
  }
}

if (!findings.length) {
  console.log('Stop-slop audit passed: no obvious public-copy issues found.');
  process.exit(0);
}

console.error(`Stop-slop audit found ${findings.length} issue(s):`);
for (const finding of findings.slice(0, 80)) {
  console.error(`${finding.file}:${finding.line} [${finding.rule}] ${finding.text}`);
}
if (findings.length > 80) {
  console.error(`...and ${findings.length - 80} more.`);
}
process.exit(1);
