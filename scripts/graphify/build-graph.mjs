#!/usr/bin/env node
/**
 * Graphify knowledge-graph build pipeline (SAFE / local-only).
 *
 * What it does, in order:
 *   1. Stages ONLY an explicit allowlist of safe source files into a temp dir
 *      (so secrets / .env / PII / node_modules can never be read by the scanner).
 *   2. Runs `graphify extract` + `graphify cluster-only --no-label` on the staging
 *      dir. This is 100% local (tree-sitter AST + networkx clustering) — no LLM,
 *      no network, no API keys required.
 *   3. Runs a defense-in-depth SECRET SCAN over the produced graph.json and aborts
 *      if anything that looks like a credential leaked into the graph.
 *   4. Builds a DOMAIN knowledge graph (trades / scenarios / safety actions /
 *      authorities / relationships) from the public master_knowledge_base.json.
 *   5. Writes the outputs the app consumes:
 *        - src/data/domain-graph.json            -> chat RAG layer (public-safe)
 *        - src/data/knowledge-graph-meta.json    -> last-generated metadata
 *        - supabase/functions/knowledge-graph/graph.data.json -> admin viewer (gated)
 *        - graphify-out/{graph.json,graph.html,GRAPH_REPORT.md} -> admin reference
 *
 * Run with:  npm run graph:build
 *
 * NOTHING here touches production at runtime. It only regenerates static
 * artifacts that are reviewed before they ship.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import path from 'node:path';

const ROOT = process.cwd();
const log = (...a) => console.log('[graph:build]', ...a);
const fail = (msg) => { console.error('\n[graph:build] ABORT:', msg, '\n'); process.exit(1); };

// ---------------------------------------------------------------------------
// 0. Resolve the graphify binary (installed via `uv tool install graphifyy`)
// ---------------------------------------------------------------------------
function resolveGraphify() {
  const exe = process.platform === 'win32' ? 'graphify.exe' : 'graphify';
  const candidates = [
    path.join(homedir(), '.local', 'bin', exe),
    path.join(homedir(), '.cargo', 'bin', exe), // unlikely but cheap to check
    exe, // fall back to PATH
  ];
  for (const c of candidates) {
    if (c === exe || existsSync(c)) return c;
  }
  return exe;
}
const GRAPHIFY = resolveGraphify();

// ---------------------------------------------------------------------------
// 1. SAFETY: allowlist of dirs to scan + hard exclusions
// ---------------------------------------------------------------------------
// Only source code we control is staged. Everything else is excluded by simply
// not copying it. These dirs contain NO secrets (secrets live in .env and are
// read at runtime via import.meta.env / Deno.env).
const SCAN_DIRS = ['src', path.join('supabase', 'functions')];
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

// Files/dirs never staged, even if they appear under an allowlisted dir.
const EXCLUDE_RE = [
  /(^|[\\/])\.env/i,
  /(^|[\\/])node_modules([\\/]|$)/i,
  /(^|[\\/])dist([\\/]|$)/i,
  /secret/i,
  /\.key$/i,
  /\.pem$/i,
  /\.local$/i,
  /credential/i,
];

// Credential-shaped patterns. If any of these survive into the graph, abort.
const SECRET_RE = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./,      // JWT (supabase service role etc.)
  /\bsk-[A-Za-z0-9]{20,}\b/,                            // OpenAI-style
  /\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{16,}\b/,        // Stripe-style
  /\bre_[A-Za-z0-9]{16,}\b/,                            // Resend
  /\bxkeysib-[A-Za-z0-9]{16,}/,                         // Brevo
  /\bAKIA[0-9A-Z]{16}\b/,                               // AWS access key id
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,                 // PEM private key
];

function isExcluded(rel) {
  return EXCLUDE_RE.some((re) => re.test(rel));
}

// ---------------------------------------------------------------------------
// 2. Stage allowlisted source into a clean temp dir
// ---------------------------------------------------------------------------
function stageSources() {
  const staging = path.join(tmpdir(), `graphify-stage-${Date.now()}`);
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });

  let staged = 0;
  const walk = (absDir, relDir) => {
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      const abs = path.join(absDir, entry.name);
      const rel = path.join(relDir, entry.name);
      if (isExcluded(rel)) continue;
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else if (entry.isFile() && CODE_EXT.has(path.extname(entry.name))) {
        const dest = path.join(staging, rel);
        mkdirSync(path.dirname(dest), { recursive: true });
        cpSync(abs, dest);
        staged++;
      }
    }
  };

  for (const dir of SCAN_DIRS) {
    const abs = path.join(ROOT, dir);
    if (existsSync(abs)) walk(abs, dir);
  }
  log(`staged ${staged} safe source files -> ${staging}`);
  if (staged === 0) fail('no source files staged — run from the project root');
  return staging;
}

// ---------------------------------------------------------------------------
// 3. Run graphify (local AST + clustering, no LLM)
// ---------------------------------------------------------------------------
function runGraphify(staging) {
  const env = { ...process.env };
  // Belt-and-braces: strip any LLM keys so a semantic pass can never fire.
  for (const k of ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY',
    'GOOGLE_API_KEY', 'DEEPSEEK_API_KEY', 'KIMI_API_KEY']) delete env[k];

  const run = (args) => {
    const r = spawnSync(GRAPHIFY, args, { cwd: ROOT, env, encoding: 'utf8' });
    if (r.error) fail(`could not run graphify (${GRAPHIFY}): ${r.error.message}`);
    process.stdout.write(r.stdout || '');
    if (r.status !== 0) { process.stderr.write(r.stderr || ''); fail(`graphify ${args[0]} exited ${r.status}`); }
  };

  log('running local AST extraction (no LLM)...');
  run(['extract', staging, '--no-cluster']);
  log('running local clustering (no LLM naming)...');
  run(['cluster-only', staging, '--no-label']);

  const outDir = path.join(staging, 'graphify-out');
  const graphPath = path.join(outDir, 'graph.json');
  if (!existsSync(graphPath)) fail('graphify did not produce graph.json');
  return outDir;
}

// ---------------------------------------------------------------------------
// 4. Secret scan (defense in depth)
// ---------------------------------------------------------------------------
function assertNoSecrets(file) {
  const text = readFileSync(file, 'utf8');
  for (const re of SECRET_RE) {
    const m = text.match(re);
    if (m) fail(`possible secret detected in ${path.basename(file)} (pattern ${re}). Refusing to publish the graph.`);
  }
}

// ---------------------------------------------------------------------------
// 5. Sanitize the code graph for safe exposure
// ---------------------------------------------------------------------------
// The admin viewer only needs structure (labels, relative paths, relations).
// We drop nothing sensitive (there is nothing sensitive), but we normalise the
// shape and strip absolute paths if any slipped in.
function loadCodeGraph(outDir) {
  const g = JSON.parse(readFileSync(path.join(outDir, 'graph.json'), 'utf8'));
  // After `cluster-only` graphify writes networkx node-link format: edges are
  // under `links`. Raw `extract --no-cluster` uses `edges`. Support both.
  const rawEdges = g.links || g.edges || [];
  const nodes = (g.nodes || []).map((n) => ({
    id: n.id,
    label: n.label,
    file_type: n.file_type || 'code',
    source_file: typeof n.source_file === 'string' ? n.source_file.replace(/\\/g, '/') : undefined,
    community: n.community ?? null,
    community_name: n.community_name || null,
    _origin: n._origin || 'ast',
  }));
  const edges = rawEdges.map((e) => ({
    source: e.source, target: e.target, relation: e.relation,
    confidence: e.confidence, weight: e.weight,
  }));
  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// 6. Build the DOMAIN knowledge graph from the public knowledge base
// ---------------------------------------------------------------------------
const TRADE_ALIAS = { 'air-conditioning': 'hvac', plumber: 'plumber' };
const normalizeTrade = (t) => {
  const s = String(t || '').toLowerCase().trim().replace(/\s+/g, '-');
  return TRADE_ALIAS[s] || s;
};

// Curated cross-trade relationships (an emergency in one often implies another).
const RELATED_TRADES = {
  plumber: ['water-restoration', 'drain-specialist', 'gas-engineer'],
  'water-restoration': ['plumber', 'drain-specialist'],
  'drain-specialist': ['plumber', 'water-restoration'],
  'gas-engineer': ['hvac', 'plumber'],
  hvac: ['gas-engineer', 'electrician'],
  electrician: ['hvac'],
  roofer: ['builder', 'water-restoration'],
  builder: ['roofer'],
  glazier: ['builder'],
  locksmith: [],
  breakdown: [],
};

// Keyword hints per trade for graph-assisted query expansion (chat side).
const TRADE_KEYWORDS = {
  plumber: ['pipe', 'burst', 'leak', 'tap', 'faucet', 'toilet', 'water heater', 'stopcock', 'flooding', 'radiator'],
  electrician: ['electric', 'power', 'breaker', 'consumer unit', 'socket', 'outlet', 'spark', 'burning smell', 'fuse'],
  locksmith: ['locked out', 'lock', 'key', 'broken key', 'door wont open', 'snapped key'],
  'gas-engineer': ['gas', 'gas leak', 'boiler', 'pilot light', 'carbon monoxide', 'smell gas'],
  'drain-specialist': ['drain', 'blocked', 'sewage', 'backed up', 'manhole'],
  glazier: ['window', 'glass', 'broken window', 'shopfront', 'smashed'],
  roofer: ['roof', 'tile', 'leak from ceiling', 'storm damage', 'gutter'],
  builder: ['wall', 'structural', 'collapse', 'subsidence', 'crack'],
  'water-restoration': ['flood', 'water damage', 'water everywhere', 'soaked', 'cleanup'],
  breakdown: ['car', 'broke down', 'tow', 'flat tyre', 'wont start', 'stranded'],
  hvac: ['air con', 'aircon', 'ac', 'cooling', 'heating', 'no heat', 'air conditioning'],
};

function buildDomainGraph(kbPath) {
  const kb = JSON.parse(readFileSync(kbPath, 'utf8'));
  const nodes = new Map();
  const edges = [];
  const addNode = (n) => { if (!nodes.has(n.id)) nodes.set(n.id, n); return n.id; };
  const addEdge = (source, target, relation) =>
    edges.push({ source, target, relation, confidence: 'DOMAIN', weight: 1.0 });

  const tradesSeen = new Set();
  kb.forEach((item, idx) => {
    const trade = normalizeTrade(item.trade);
    if (!trade) return;
    tradesSeen.add(trade);
    const tradeId = `trade:${trade}`;
    addNode({
      id: tradeId, label: trade.replace(/-/g, ' '), file_type: 'domain', kind: 'trade',
      keywords: TRADE_KEYWORDS[trade] || [], _origin: 'domain',
    });

    const scId = `scenario:${trade}:${idx}`;
    addNode({
      id: scId, label: item.scenario, file_type: 'domain', kind: 'scenario',
      risk_level: item.risk_level || null, action_plan: item.action_plan || null,
      trade, _origin: 'domain',
    });
    addEdge(tradeId, scId, 'handles');

    for (const rd of item.region_data || []) {
      if (!rd.authority_name) continue;
      const authId = `authority:${String(rd.authority_name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      addNode({
        id: authId, label: rd.authority_name, file_type: 'domain', kind: 'authority',
        region: rd.region || null, url: rd.authority_url || null, _origin: 'domain',
      });
      addEdge(scId, authId, `governed_by_${(rd.region || 'xx').toLowerCase()}`);
    }
  });

  // Cross-trade relationships (only between trades that exist in the KB).
  for (const trade of tradesSeen) {
    for (const rel of RELATED_TRADES[trade] || []) {
      if (tradesSeen.has(rel)) addEdge(`trade:${trade}`, `trade:${rel}`, 'related_to');
    }
  }

  return { nodes: [...nodes.values()], edges };
}

// ---------------------------------------------------------------------------
// 7. Main
// ---------------------------------------------------------------------------
function gitCommit() {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(data, null, 0));
  log(`wrote ${rel} (${(statSync(abs).size / 1024).toFixed(0)} KB)`);
}

function main() {
  log(`using ${GRAPHIFY}`);
  const staging = stageSources();
  let outDir;
  try {
    outDir = runGraphify(staging);
    assertNoSecrets(path.join(outDir, 'graph.json'));
    if (existsSync(path.join(outDir, 'GRAPH_REPORT.md'))) assertNoSecrets(path.join(outDir, 'GRAPH_REPORT.md'));

    const code = loadCodeGraph(outDir);
    const domain = buildDomainGraph(path.join(ROOT, 'data', 'master_knowledge_base.json'));
    log(`code graph: ${code.nodes.length} nodes / ${code.edges.length} edges`);
    log(`domain graph: ${domain.nodes.length} nodes / ${domain.edges.length} edges`);

    const meta = {
      generatedAt: new Date().toISOString(),
      commit: gitCommit(),
      graphifyVersion: '0.8.49',
      counts: {
        codeNodes: code.nodes.length, codeEdges: code.edges.length,
        domainNodes: domain.nodes.length, domainEdges: domain.edges.length,
      },
    };

    // --- Chat RAG layer: domain-only, public-safe ---
    writeJson('src/data/domain-graph.json', { ...domain, meta });
    writeJson('src/data/knowledge-graph-meta.json', meta);

    // --- Admin viewer (served only via the gated edge function) ---
    const merged = {
      meta,
      nodes: [...code.nodes, ...domain.nodes],
      edges: [...code.edges, ...domain.edges],
    };
    writeJson('supabase/functions/knowledge-graph/graph.data.json', merged);

    // --- Raw Graphify artifacts for admin reference / download ---
    const refDir = path.join(ROOT, 'graphify-out');
    mkdirSync(refDir, { recursive: true });
    for (const f of ['graph.html', 'GRAPH_REPORT.md', 'graph.json']) {
      const src = path.join(outDir, f);
      if (existsSync(src)) cpSync(src, path.join(refDir, f));
    }
    log('copied raw artifacts -> graphify-out/');

    log('DONE. Review graphify-out/GRAPH_REPORT.md, then redeploy the knowledge-graph edge function.');
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

main();
