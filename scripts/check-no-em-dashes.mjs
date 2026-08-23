#!/usr/bin/env node
/**
 * Fails if an em-dash appears in any copy we wrote.
 *
 * House style: no em-dashes in user-facing text. Use a comma, a colon or a full
 * stop instead. It is a deliberate rule, so it gets a check rather than a note
 * in a style guide nobody reads.
 *
 * Scope is our own writing, not data. Real track titles and artist names
 * contain dashes we must not touch, "Run–D.M.C.", "Laxed – Siren Beat",
 * and "We Contain Multitudes" with its em-dashed suffix. So this reads source
 * files rather than rendered pages, where the two are indistinguishable.
 *
 * Comments are checked too. Prose is prose, and a comment that leaks into a
 * commit message or a doc carries the same tell.
 *
 * Usage: node scripts/check-no-em-dashes.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SEARCH_DIRS = ["app", "components", "lib", "scripts", "docs"];
const EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".js", ".jsx", ".md", ".css"]);

// Anything generated from, or holding, third-party data. Track titles and
// artist names are theirs, not ours.
const SKIP = new Set(["data", "node_modules", ".next", ".git"]);

const EM_DASH = "\u2014";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = SEARCH_DIRS.filter((d) => fs.existsSync(path.join(ROOT, d))).flatMap(
  (d) => walk(path.join(ROOT, d)),
);

let hits = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (!line.includes(EM_DASH)) return;
    hits++;
    const rel = path.relative(ROOT, file);
    const col = line.indexOf(EM_DASH) + 1;
    console.log(`  ${rel}:${i + 1}:${col}`);
    console.log(`    ${line.trim().slice(0, 140)}`);
  });
}

console.log(
  `\n${files.length} files scanned, ${hits} em-dash${hits === 1 ? "" : "es"} found`,
);

if (hits > 0) {
  console.error("\nFAIL: replace with a comma, a colon or a full stop.");
  process.exit(1);
}
console.log("PASS: no em-dashes.");
