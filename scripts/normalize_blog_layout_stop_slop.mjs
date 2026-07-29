import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, 'optimized-blogs', 'backups');
const NOTES_DIR = path.join(ROOT, 'optimized-blogs');

const forbiddenPublicSections = [
  'Social Media Post',
  'SEO Implementation Checklist',
  'Regional Lock Verification',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function inlineTrustedMarkdown(value) {
  return String(value ?? '')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function cleanStopSlop(text) {
  return String(text ?? '')
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€“/g, ' - ')
    .replace(/â€”/g, ' - ')
    .replace(/Â£/g, '£')
    .replace(/Â°C/g, '°C')
    .replace(/Â/g, '')
    .replace(/—/g, ' - ')
    .replace(/\b[Ii]n today'?s world,?\s*/g, '')
    .replace(/\b[Ii]n today'?s\s+/g, 'In current ')
    .replace(/\bIn This Article\b/g, 'Article Sections')
    .replace(/\b[Tt]his guide will (?:show you|walk you through|help you understand)\s*/g, 'Use this guide to ')
    .replace(/\b[Dd]elve into\b/g, 'look at')
    .replace(/\b[Uu]nlock\b/g, 'Open')
    .replace(/\bunlocking\b/g, 'opening')
    .replace(/\bUnlocking\b/g, 'Opening')
    .replace(/\bunlocks\b/g, 'opens')
    .replace(/\bUnlocks\b/g, 'Opens')
    .replace(/\bunlocked\b/g, 'opened')
    .replace(/\bUnlocked\b/g, 'Opened')
    .replace(/\b[Gg]ame[- ]changer\b/g, 'useful change')
    .replace(/\b[Ss]eamless experience\b/g, 'simple experience')
    .replace(/\b[Rr]obust solution\b/g, 'reliable fix')
    .replace(/\b[Ee]levate your\b/g, 'Improve your')
    .replace(/\b[Nn]avigate the complexities of\b/g, 'Handle');
}

function wrapBareTextBlocks(html) {
  let next = String(html ?? '').trim();
  const firstTag = next.search(/<\w+/);
  if (firstTag > 0) {
    const lead = next.slice(0, firstTag).trim();
    const rest = next.slice(firstTag).trimStart();
    if (lead) next = `<p>${inlineMarkdown(lead.replace(/\s+/g, ' '))}</p>\n\n${rest}`;
  }
  return next.replace(/(<\/(?:div|section|ul|ol|blockquote|table)>)\s*([^<\s][\s\S]*?)(?=\n\s*<\w+|\s*<\/main>|\s*$)/g, (match, close, text) => {
    const clean = text.trim();
    if (!clean || clean.includes('<')) return match;
    return `${close}\n<p>${inlineMarkdown(clean.replace(/\s+/g, ' '))}</p>`;
  });
}

function removeInternalSections(html) {
  let next = html;
  for (const section of forbiddenPublicSections) {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    next = next.replace(
      new RegExp(`\\n?\\s*<h2[^>]*>\\s*(?:\\d+\\.\\s*)?${escaped}\\s*<\\/h2>[\\s\\S]*?(?=\\n\\s*<h2[^>]*>|\\n\\s*<\\/main>|\\n\\s*<\\/body>|$)`, 'gi'),
      ''
    );
    next = next.replace(
      new RegExp(`\\n?\\s*#{1,6}\\s*(?:\\d+\\.\\s*)?${escaped}\\s*\\n[\\s\\S]*?(?=\\n#{1,6}\\s|$)`, 'gi'),
      ''
    );
  }
  return next;
}

function stripOuterHtml(content) {
  let next = String(content ?? '').trim();
  next = next.replace(/<!DOCTYPE[^>]*>/gi, '');
  next = next.replace(/<head[\s\S]*?<\/head>/gi, '');
  next = next.replace(/<header[\s\S]*?<\/header>/gi, '');
  next = next.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  const bodyMatch = next.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) next = bodyMatch[1];
  next = next.replace(/<\/?html[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '').trim();
  const mainMatch = next.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) next = mainMatch[1].trim();
  return next;
}

function markdownToHtml(markdown) {
  const lines = String(markdown ?? '').trim().split(/\r?\n/);
  let html = '';
  let para = [];
  let list = [];

  const flushPara = () => {
    if (!para.length) return;
    html += `<p>${inlineTrustedMarkdown(para.join(' '))}</p>\n`;
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html += '<ul>\n' + list.map(item => `  <li>${inlineTrustedMarkdown(item)}</li>`).join('\n') + '\n</ul>\n';
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushPara();
      flushList();
      const level = Math.min(6, heading[1].length);
      html += `<h${level}>${inlineTrustedMarkdown(heading[2])}</h${level}>\n`;
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushPara();
      list.push(bullet[1]);
      continue;
    }
    para.push(line);
  }
  flushPara();
  flushList();
  return html;
}

function regionForPost(post) {
  const slug = post.slug.toLowerCase();
  const title = post.title.toLowerCase();
  if (slug.includes('-us') || slug.includes('usa') || title.includes(' us ') || title.includes('24/7')) return 'us';
  return 'gb';
}

function outputFolder(region) {
  return region === 'us'
    ? path.join(ROOT, 'optimized-blogs', 'usa-emergencycontractors')
    : path.join(ROOT, 'optimized-blogs', 'uk-emergencytradesmen');
}

function languageForRegion(region) {
  return region === 'us' ? 'en-US' : 'en-GB';
}

function teamForRegion(region) {
  return region === 'us' ? 'Emergency Contractors US Team' : 'Emergency Tradesmen UK Team';
}

function formatDate(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  if (Number.isNaN(date.getTime())) return 'July 2026';
  return date.toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Europe/London' });
}

function buildComparisonGrid(post) {
  const slug = post.slug.toLowerCase();
  const title = post.title.toLowerCase();
  const electrical = /electric|breaker|fuse|rcd|gfci|outlet|panel|shower/.test(`${slug} ${title}`);
  const plumbing = /plumb|pipe|water|toilet|drain|sewage|tap|bibb|radiator|boiler|cylinder|washer|washing/.test(`${slug} ${title}`);
  const appliance = /dryer|refrigerator|fridge|appliance|garage-door|fan/.test(`${slug} ${title}`);
  const security = /lock|door|window|board|glazier|glass/.test(`${slug} ${title}`);

  let greenHeader = 'Repair or Clear It';
  let redHeader = 'Replace or Escalate';
  let green = ['Tightening an accessible fitting or connection', 'Replacing a small failed part', 'Clearing a simple blockage or reset fault', 'Drying and testing after a short, contained issue'];
  let red = ['Repeated failure after a basic repair', 'Damage has reached wiring, structure, or finished surfaces', 'Cracked, burnt, corroded, or unsafe parts', 'The repair cost approaches replacement'];

  if (electrical) {
    greenHeader = 'Repair the Circuit';
    redHeader = 'Replace Faulty Parts';
    green = ['Replacing a failed outlet, switch, or protective device after testing', 'Correcting a loose accessible connection', 'Drying and testing a weather-affected circuit', 'Resetting once after the fault has been removed'];
    red = ['Burnt wiring, hot equipment, or repeated trips', 'Breaker, RCD, or GFCI fails electrical testing', 'Water reached the consumer unit or breaker panel', 'Hardwired equipment remains unsafe after isolation'];
  } else if (plumbing) {
    greenHeader = 'Repair or Seal It';
    redHeader = 'Replace the Failed Part';
    green = ['Replacing a washer, seal, valve, hose, or connector', 'Tightening an accessible joint', 'Clearing a local blockage', 'Drying the area after a short clean-water leak'];
    red = ['Cracked pipework, corroded fittings, or a leaking body', 'Foul water, hidden damp, or ceiling staining', 'The valve will not isolate safely', 'The same fault returns after seals are renewed'];
  } else if (appliance) {
    greenHeader = 'Repair the Unit';
    redHeader = 'Replace the Unit';
    green = ['Cleaning a filter, vent, or blocked drain path', 'Replacing a belt, hose, switch, or sensor', 'Tightening a loose bracket or safe connection', 'Resetting after the underlying fault is cleared'];
    red = ['Burning smell, repeated trips, or motor failure', 'Water or heat damage reaches surrounding materials', 'Major sealed components have failed', 'The unit is old and repair cost is high'];
  } else if (security) {
    greenHeader = 'Repair or Secure It';
    redHeader = 'Replace Damaged Parts';
    green = ['Realigning a latch, lock, hinge, or roller', 'Boarding up short-term damage', 'Replacing a cylinder, handle, gasket, or small fitting', 'Securing the opening until a full repair is booked'];
    red = ['Cracked frames, failed glazing units, or bent hardware', 'Forced-entry damage has weakened the opening', 'A lock or door no longer secures reliably', 'Repeated adjustment no longer holds'];
  }

  return `\n<div class="blog-comparison-grid">\n  <div class="blog-comp-col green">\n    <div class="blog-comp-header">${escapeHtml(greenHeader)}</div>\n    <ul class="blog-comp-list">\n${green.map(item => `      <li>${escapeHtml(item)}</li>`).join('\n')}\n    </ul>\n  </div>\n  <div class="blog-comp-col red">\n    <div class="blog-comp-header">${escapeHtml(redHeader)}</div>\n    <ul class="blog-comp-list">\n${red.map(item => `      <li>${escapeHtml(item)}</li>`).join('\n')}\n    </ul>\n  </div>\n</div>\n`;
}

function ensureComparisonGrid(body, post) {
  if (body.includes('blog-comparison-grid')) return body;
  if (!body.includes('blog-step-card')) return body;
  const grid = buildComparisonGrid(post);
  if (body.includes('blog-when-block')) {
    return body.replace(/(<div class="blog-when-block">[\s\S]*?<\/div>)/i, `$1\n${grid}`);
  }
  return body.replace(/(<h2[^>]*>[^<]*(?:Repair vs\. Replace|When to Call)[\s\S]*?<\/h2>)/i, `$1\n${grid}`);
}

function buildDocument(post, body) {
  const region = regionForPost(post);
  return `<!DOCTYPE html>
<html lang="${languageForRegion(region)}">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(post.title)}</title>
    <meta name="description" content="${escapeHtml(post.excerpt || post.title)}">
</head>
<body>

<header>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="meta-bar">
        <span class="author">By ${teamForRegion(region)}</span> |
        <span class="date-updated">Updated: ${formatDate(post.published_at || post.created_at)}</span> |
        <span class="rating">5-Star Service</span>
    </div>
</header>

<main class="blog-magazine-wrap">
${body.trim()}
</main>

</body>
</html>
`;
}

function normalizePost(post) {
  let body = post.content || '';
  const startedAsMarkdown = /^\s*#\s+/m.test(body);
  body = cleanStopSlop(body);
  body = removeInternalSections(body);
  body = startedAsMarkdown ? markdownToHtml(body) : stripOuterHtml(body);
  body = wrapBareTextBlocks(body);
  body = removeInternalSections(body);
  body = ensureComparisonGrid(body, post);
  body = cleanStopSlop(body);
  return buildDocument(post, body);
}

function localPathFor(post) {
  return path.join(outputFolder(regionForPost(post)), `${post.slug}.md`);
}

const { data, error } = await supabase
  .from('posts')
  .select('id,slug,title,excerpt,content,cover_image,published_at,created_at,published')
  .eq('published', true)
  .order('published_at', { ascending: true });

if (error) throw error;

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `supabase-posts-before-layout-stop-slop-${stamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');

let notes = `# Blog Layout and Stop-Slop Cleanup Notes\n\nBackup: ${path.relative(ROOT, backupFile)}\n\n`;
let changed = 0;
let removedPublicNotes = 0;
let addedShell = 0;
let addedGrid = 0;

for (const post of data) {
  const before = post.content || '';
  const after = normalizePost(post);
  if (before === after) continue;

  const beforeHadPublicNotes = forbiddenPublicSections.some(section => new RegExp(section, 'i').test(before));
  const beforeHadShell = before.includes('blog-magazine-wrap');
  const beforeHadGrid = before.includes('blog-comparison-grid');
  const afterHasGrid = after.includes('blog-comparison-grid');
  const afterHasShell = after.includes('blog-magazine-wrap');

  if (beforeHadPublicNotes) removedPublicNotes++;
  if (!beforeHadShell && afterHasShell) addedShell++;
  if (!beforeHadGrid && afterHasGrid) addedGrid++;

  const outPath = localPathFor(post);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, after, 'utf8');

  if (!DRY_RUN) {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ content: after })
      .eq('id', post.id);
    if (updateError) throw updateError;
  }

  changed++;
  notes += `- ${post.slug}: normalized shell=${!beforeHadShell && afterHasShell}, added comparison grid=${!beforeHadGrid && afterHasGrid}, removed public notes=${beforeHadPublicNotes}\n`;
}

const notesPath = path.join(NOTES_DIR, `internal-notes-layout-stop-slop-cleanup-${stamp}.md`);
fs.writeFileSync(notesPath, notes, 'utf8');

console.log(JSON.stringify({
  dryRun: DRY_RUN,
  total: data.length,
  changed,
  addedShell,
  addedGrid,
  removedPublicNotes,
  backupFile: path.relative(ROOT, backupFile),
  notesPath: path.relative(ROOT, notesPath),
}, null, 2));
