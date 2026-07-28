import { createHash } from "node:crypto";

const bannedPhrases = [
  /\bhere(?:'|’)s (?:the thing|what|why)\b/gi,
  /\bit is important to note\b/gi,
  /\bin today(?:'|’)s\b/gi,
  /\bdelve into\b/gi,
  /\bgame[- ]changer\b/gi,
  /\bseamless experience\b/gi,
  /\bnavigate the complexities\b/gi,
  /\bat the end of the day\b/gi,
  /\bwhen it comes to\b/gi,
];

const fillerWords = /\b(really|just|literally|genuinely|honestly|simply|actually|truly|crucially)\b/gi;
const hazardWords = /\b(gas|carbon monoxide|burning|smoke|sparking|electrical|consumer unit|breaker panel|sewage|structural|fire)\b/i;

export function plainText(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function improveText(value = "") {
  let text = plainText(value)
    .replace(/[—–]/g, " - ")
    .replace(fillerWords, "")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  for (const pattern of bannedPhrases) {
    text = text.replace(pattern, "").replace(/\s{2,}/g, " ").trim();
  }

  return text;
}

export function reviewContent(value = "") {
  const text = plainText(value);
  const issues = [];
  let directness = 10;
  let rhythm = 10;
  let trust = 10;
  let authenticity = 10;
  let density = 10;

  const emDashCount = (text.match(/[—–]/g) ?? []).length;
  if (emDashCount) {
    issues.push(`${emDashCount} em/en dash${emDashCount === 1 ? "" : "es"}`);
    rhythm -= Math.min(4, emDashCount);
  }

  const fillerCount = (text.match(fillerWords) ?? []).length;
  if (fillerCount) {
    issues.push(`${fillerCount} filler word${fillerCount === 1 ? "" : "s"}`);
    density -= Math.min(5, fillerCount);
    authenticity -= Math.min(3, fillerCount);
  }

  for (const pattern of bannedPhrases) {
    const matches = text.match(pattern) ?? [];
    if (matches.length) {
      issues.push(`Formulaic phrase: ${matches[0]}`);
      directness -= Math.min(3, matches.length);
      authenticity -= Math.min(3, matches.length);
    }
  }

  const repeatedSentences = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.length > 30)
    .filter((sentence, index, all) => all.indexOf(sentence) !== index);
  if (repeatedSentences.length) {
    issues.push("Repeated sentence");
    density -= 3;
    trust -= 2;
  }

  const absoluteClaimText = text.replace(
    /\bnever (?:remove|open) (?:the )?boiler casing\b/gi,
    "",
  );
  const vagueClaims =
    absoluteClaimText.match(/\b(always|everyone|never|guaranteed|best ever)\b/gi) ?? [];
  if (vagueClaims.length) {
    issues.push(`${vagueClaims.length} unsupported absolute claim${vagueClaims.length === 1 ? "" : "s"}`);
    trust -= Math.min(4, vagueClaims.length);
  }

  const dimensions = {
    directness: Math.max(1, directness),
    rhythm: Math.max(1, rhythm),
    trust: Math.max(1, trust),
    authenticity: Math.max(1, authenticity),
    density: Math.max(1, density),
  };

  return {
    score: Object.values(dimensions).reduce((total, score) => total + score, 0),
    dimensions,
    issues,
    passed: Object.values(dimensions).reduce((total, score) => total + score, 0) >= 35,
  };
}

export function contentHash(value = "") {
  return createHash("sha256")
    .update(plainText(value).toLowerCase())
    .digest("hex");
}

export function requiresSafetyApproval(...values) {
  return values.some((value) => hazardWords.test(plainText(value ?? "")));
}
