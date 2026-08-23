#!/usr/bin/env node
/**
 * Asserts the game's answers are never visible on page load.
 *
 * Rule: track titles may be in the HTML source, they have to be, that is what
 * makes the page rankable, but must not be readable without the visitor
 * opening something. This checks the actual rendered HTML of a running server
 * rather than trusting the components, because the leak that prompted this was
 * exactly the kind a code read misses: the stats prose and the FAQ answers both
 * named tracks in plain sight while the <details> block sat correctly collapsed
 * right next to them.
 *
 * Method: strip every <details> element (and script/style/head) from the page,
 * then look for track titles in what is left. Anything found is visible on load.
 *
 * Usage: node scripts/check-no-spoilers.mjs [baseUrl] [--sample N]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshot = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "artist-snapshot.json"), "utf8"),
);

const args = process.argv.slice(2);
const baseUrl = args.find((a) => a.startsWith("http")) ?? "http://localhost:3000";
const sampleIdx = args.indexOf("--sample");
const SAMPLE = sampleIdx >= 0 ? Number(args[sampleIdx + 1]) : 40;

function decode(html) {
  return html
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Text a visitor can read without opening anything. */
function visibleText(html) {
  let s = html;
  s = s.replace(/<head[\s\S]*?<\/head>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Remove details blocks entirely, innermost first so nesting is handled.
  let before;
  do {
    before = s;
    s = s.replace(/<details\b[^>]*>(?:(?!<details\b)[\s\S])*?<\/details>/gi, " ");
  } while (s !== before);
  s = s.replace(/<[^>]+>/g, " ");
  return decode(s).replace(/\s+/g, " ");
}

const candidates = Object.values(snapshot).filter(
  (r) => !r.error && r.exactMatch !== false && r.topTen?.length,
);

// Spread the sample across the whole catalogue rather than just the head.
const step = Math.max(1, Math.floor(candidates.length / SAMPLE));
const sample = candidates.filter((_, i) => i % step === 0).slice(0, SAMPLE);

console.log(`Checking ${sample.length} artist pages at ${baseUrl}\n`);

let leaks = 0;
let checked = 0;

for (const record of sample) {
  const url = `${baseUrl}/artist/${record.slug}`;
  let html;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ! ${url} -> HTTP ${res.status}`);
      continue;
    }
    html = await res.text();
  } catch (err) {
    console.warn(`  ! ${url} -> ${err.message}`);
    continue;
  }

  checked++;
  const source = decode(html);

  // The artist's own name has to appear on the page, and sometimes a track
  // title is a substring of it: "The Greatest Showman Ensemble" contains the
  // track "The Greatest Show". Removing the name first means a title found
  // afterwards is genuinely exposed rather than incidental.
  const names = [record.name, record.spotifyName].filter(Boolean);
  let visible = visibleText(html);
  for (const name of names) visible = visible.split(name).join(" ");

  const exposed = record.topTen.filter((t) => {
    // Ignore very short titles, a one-word title like "Whatever" can appear in
    // ordinary prose by coincidence, and flagging that is noise, not a leak.
    if (t.title.length < 8) return false;
    return visible.includes(t.title);
  });

  const missingFromSource = record.topTen.filter(
    (t) => !source.includes(t.title),
  );

  if (exposed.length) {
    leaks++;
    console.log(`  SPOILER  /artist/${record.slug}`);
    for (const t of exposed) console.log(`             visible: "${t.title}"`);
  }

  if (missingFromSource.length) {
    console.log(
      `  THIN     /artist/${record.slug}: ${missingFromSource.length} title(s) absent from source entirely`,
    );
  }
}

console.log(
  `\n${checked} pages checked, ${leaks} leaking answers on load`,
);

if (leaks > 0) {
  console.error(
    "\nFAIL: track titles are readable without opening a <details>.",
  );
  process.exit(1);
}
console.log("PASS: answers present in source, none visible on load.");
