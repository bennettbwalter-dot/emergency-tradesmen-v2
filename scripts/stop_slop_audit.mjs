import fs from "node:fs";
import path from "node:path";
import { reviewContent } from "./social_content_quality.mjs";

const ROOT = process.cwd();
const suppliedTargets = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const targets = suppliedTargets.length ? suppliedTargets : ["src", "optimized-blogs", "docs"];
const minimumScore = Number(
  process.argv.find((arg) => arg.startsWith("--min-score="))?.split("=")[1] ?? 35,
);
const textExtensions = new Set([".md", ".mdx", ".txt", ".tsx", ".ts", ".jsx", ".js", ".html", ".json"]);
const skipDirectories = new Set(["node_modules", "dist", ".git", ".wrangler", "output", "tmp", "_logs"]);

function walk(target, files = []) {
  const resolved = path.resolve(ROOT, target);
  if (!fs.existsSync(resolved)) return files;
  const stat = fs.statSync(resolved);
  if (stat.isFile()) {
    if (textExtensions.has(path.extname(resolved).toLowerCase())) files.push(resolved);
    return files;
  }
  for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
    if (entry.isDirectory() && skipDirectories.has(entry.name)) continue;
    walk(path.join(resolved, entry.name), files);
  }
  return files;
}

const findings = [];
for (const target of targets) {
  if (!fs.existsSync(path.resolve(ROOT, target))) {
    findings.push({
      file: target,
      score: 0,
      issues: ["Target does not exist"],
    });
    continue;
  }
  for (const file of walk(target)) {
    const report = reviewContent(fs.readFileSync(file, "utf8"));
    if (report.score < minimumScore) {
      findings.push({
        file: path.relative(ROOT, file),
        score: report.score,
        issues: report.issues,
      });
    }
  }
}

if (!findings.length) {
  console.log(`Stop/Slop audit passed for ${targets.length} target${targets.length === 1 ? "" : "s"}.`);
  process.exit(0);
}

console.error(`Stop/Slop audit failed for ${findings.length} file${findings.length === 1 ? "" : "s"}:`);
for (const finding of findings.slice(0, 80)) {
  console.error(`${finding.file} [${finding.score}/50] ${finding.issues.join("; ")}`);
}
process.exit(1);
