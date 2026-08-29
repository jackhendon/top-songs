#!/usr/bin/env node
/**
 * Guards data/artist-scenes.json against the way an exact-match map fails: silently.
 *
 * The first version of that file spelled the French genre tags without their
 * accents ("variete francaise"), so not one of them ever matched, the french
 * scene was dead, and Jul and Ninho sat in the anglo pool where nobody would
 * think to look for them. Nothing errored. The map just did nothing.
 *
 * Three checks:
 *   1. every mapped genre tag really occurs in the snapshot
 *   2. every artist override really names an artist in the snapshot
 *   3. no artist in the anglo pool carries a tag that reads as non-anglophone
 *      and is unmapped, unless it is listed in _allowUnmapped with a reason
 *
 * Check 3 is the one that catches new leaks when the catalogue is re-crawled.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const scenes = read("data/artist-scenes.json");
const snapshot = read("data/artist-snapshot.json");

const MIN_STREAMS = 300_000_000;
const MIN_FOLLOWERS = 10_000_000;

/** Markers that a tag names a language or regional scene rather than a style. */
const NON_ANGLO = /franc|français|deutsch|german|schlager|italian|latin|reggaeton|corrido|cumbia|banda|sertanejo|funk carioca|mpb|pagode|forró|samba|piseiro|arrocha|k-pop|k-rap|k-ball|korean|j-pop|japan|anime|mandopop|cantopop|c-pop|indones|malay|pinoy|opm|p-pop|harana|kundiman|thai|viet|hindi|tamil|telugu|punjabi|bollywood|bhangra|desi|bangla|malayalam|kannada|turk|arabesk|arab|egypt|khaleeji|raï|afrobeat|amapiano|naija|nigeri|ghana|greek|hebrew|persian|polish|czech|dutch|nederpop|nordic|swed|norw|finn|portug|fado|romania|serb|croat|balkan|albanian|bulgar|hungar|russ|ukrain|batak|indorock/i;

const allowUnmapped = new Set(Object.keys(scenes._allowUnmapped ?? {}));
const errors = [];

// --- every tag in the snapshot, and every artist that carries it ---
const tagOwners = new Map();
for (const record of Object.values(snapshot)) {
  for (const tag of record.genres ?? []) {
    if (!tagOwners.has(tag)) tagOwners.set(tag, []);
    tagOwners.get(tag).push(record.spotifyName || record.name);
  }
}

// 1. dead genre keys
for (const key of Object.keys(scenes.genreScenes)) {
  if (!tagOwners.has(key)) {
    errors.push(`genreScenes key "${key}" matches no tag in the snapshot (typo, or the tag is gone)`);
  }
}

// 2. overrides naming an artist that is not there
for (const slug of Object.keys(scenes.artistScenes)) {
  if (!snapshot[slug]) {
    errors.push(`artistScenes has "${slug}", which is not a slug in the snapshot`);
  }
}

// 3. non-anglophone tags leaking into the anglo pool
const sceneOf = (slug, genres) => {
  if (scenes.artistScenes[slug]) return scenes.artistScenes[slug];
  for (const g of genres) if (scenes.genreScenes[g]) return scenes.genreScenes[g];
  return "anglo";
};

const leaks = new Map();
for (const record of Object.values(snapshot)) {
  if (record.error || record.exactMatch === false || !record.topTen) continue;
  if ((record.followers ?? 0) < MIN_FOLLOWERS) continue;
  if (!record.topTen.some((t) => t.totalStreams >= MIN_STREAMS)) continue;

  const genres = record.genres ?? [];
  if (sceneOf(record.slug, genres) !== "anglo") continue;

  for (const tag of genres) {
    if (scenes.genreScenes[tag] || allowUnmapped.has(tag)) continue;
    if (!NON_ANGLO.test(tag)) continue;
    if (!leaks.has(tag)) leaks.set(tag, []);
    leaks.get(tag).push(record.spotifyName || record.name);
  }
}

for (const [tag, who] of leaks) {
  errors.push(
    `unmapped tag "${tag}" reads as a non-anglophone scene but its artists are in the anglo pool: ${who.join(", ")}\n` +
      `    Map it in genreScenes, override the artists, or add it to _allowUnmapped with a reason.`,
  );
}

if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) in data/artist-scenes.json\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const bySceneCount = {};
for (const record of Object.values(snapshot)) {
  if (record.error || record.exactMatch === false || !record.topTen) continue;
  if ((record.followers ?? 0) < MIN_FOLLOWERS) continue;
  const n = record.topTen.filter((t) => t.totalStreams >= MIN_STREAMS).length;
  if (!n) continue;
  const s = sceneOf(record.slug, record.genres ?? []);
  bySceneCount[s] = (bySceneCount[s] ?? 0) + n;
}
const summary = Object.entries(bySceneCount)
  .sort((a, b) => b[1] - a[1])
  .map(([s, n]) => `${s} ${n}`)
  .join(", ");
console.log(`PASS: scene map is consistent with the snapshot. Tracks per scene: ${summary}`);
