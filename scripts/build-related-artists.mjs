#!/usr/bin/env node
/**
 * Builds data/related-artists.json: slug -> 12 related slugs.
 *
 * Why precompute: scoring one artist against the other ~2,900 is cheap, but
 * doing it inside the page render means ~8.7M comparisons per build across the
 * whole catalogue. Once, offline, into a lookup table instead.
 *
 * Why it matters: every artist page previously drew its "more artists" links
 * from a hand-curated pool of 198, so all 2,995 pages pointed into the same
 * small set and the other ~2,800 were reachable only through the directory.
 * Search Console has 285 URLs sitting at "Discovered - currently not indexed",
 * which is what that looks like from Google's side.
 *
 * Signals, in order of weight:
 *   1. Shared Spotify genres (Jaccard). Only ~65% of artists have any genre
 *      tags at all, so this cannot be the only signal.
 *   2. Popularity proximity on a log scale, which keeps Taylor Swift away from
 *      artists with 300 followers even when the genre tags line up.
 *   3. Catalogue-depth proximity, a weak tiebreaker that tends to group
 *      career-artists with career-artists.
 *
 * Links are then made reciprocal where possible, so pages link back to each
 * other rather than forming one-way chains a crawler drops out of.
 *
 * Usage: node scripts/build-related-artists.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_PATH = path.join(ROOT, "data", "artist-snapshot.json");
const TAGS_PATH = path.join(ROOT, "data", "artist-tags.json");
const OUT_PATH = path.join(ROOT, "data", "related-artists.json");

const LINKS_PER_ARTIST = 12;

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));

// Hand-curated genres for ~200 artists. Worth merging rather than dropping:
// Spotify returns no genres at all for 71 of them, and they are among the
// biggest pages on the site, Taylor Swift, The Weeknd, Coldplay, Billie
// Eilish. Without this they would be matched on follower count alone.
const curatedTags = fs.existsSync(TAGS_PATH)
  ? JSON.parse(fs.readFileSync(TAGS_PATH, "utf8"))
  : {};

// Only artists we would actually link to: they need a page worth visiting.
// Must match hasStats() in lib/artistSnapshot.ts. Linking to a page we have
// noindexed sends crawl budget at something we told Google to ignore, and an
// unverified artist may not even be the artist the label claims.
const artists = Object.values(snapshot)
  .filter((a) => !a.error && a.exactMatch !== false && a.topTen?.length && a.slug)
  .map((a) => {
    const curated = curatedTags[a.slug];
    return {
      slug: a.slug,
      name: a.spotifyName || a.name,
      genres: new Set([...(a.genres ?? []), ...(curated?.genre ?? [])]),
      eras: new Set(curated?.era ?? []),
      followers: a.followers ?? 0,
      catalogueSize: a.catalogueSize ?? 0,
      logFollowers: Math.log10(Math.max(a.followers ?? 0, 1)),
      logCatalogue: Math.log10(Math.max(a.catalogueSize ?? 0, 1)),
    };
  });

console.log(`Scoring ${artists.length} artists`);

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const g of a) if (b.has(g)) shared++;
  return shared / (a.size + b.size - shared);
}

function score(a, b) {
  const genre = jaccard(a.genres, b.genres);
  const era = jaccard(a.eras, b.eras);

  // Both on a log scale: one order of magnitude apart scores ~0.
  const popularity = Math.max(
    0,
    1 - Math.abs(a.logFollowers - b.logFollowers),
  );
  const depth = Math.max(0, 1 - Math.abs(a.logCatalogue - b.logCatalogue));

  // Genre dominates when present. When neither artist has tags, popularity
  // and depth carry the whole score rather than falling back to something
  // arbitrary like alphabetical adjacency.
  return genre * 10 + era * 2 + popularity * 3 + depth;
}

const related = {};
let noGenreCount = 0;
let rescued = 0;

for (const a of artists) {
  if (!a.genres.size) noGenreCount++;
  if (!(snapshot[a.slug].genres ?? []).length && a.genres.size) rescued++;

  const ranked = [];
  for (const b of artists) {
    if (b.slug === a.slug) continue;
    ranked.push({ slug: b.slug, s: score(a, b) });
  }
  ranked.sort((x, y) => y.s - x.s || (x.slug < y.slug ? -1 : 1));
  related[a.slug] = ranked.slice(0, LINKS_PER_ARTIST).map((r) => r.slug);
}

// Give every artist at least one inbound link.
//
// The previous version appended back-links past index 12, but the page renders
// only the first 12, so all 7,939 of them were discarded and the stated goal
// was never met. Lists are now capped at exactly LINKS_PER_ARTIST, and an
// orphan is placed by displacing its best match's weakest link, so what is
// stored is what is rendered.
const inboundCount = new Map(artists.map((a) => [a.slug, 0]));
for (const targets of Object.values(related)) {
  for (const t of targets) inboundCount.set(t, (inboundCount.get(t) ?? 0) + 1);
}

let placed = 0;
for (const a of artists) {
  if ((inboundCount.get(a.slug) ?? 0) > 0) continue;

  // Walk this artist's own ranked matches and displace the weakest link of the
  // first one that can spare it without becoming an orphan itself.
  for (const partner of related[a.slug]) {
    const list = related[partner];
    if (!list?.length) continue;
    const dropped = list[list.length - 1];
    if ((inboundCount.get(dropped) ?? 0) <= 1) continue;

    list[list.length - 1] = a.slug;
    inboundCount.set(dropped, inboundCount.get(dropped) - 1);
    inboundCount.set(a.slug, (inboundCount.get(a.slug) ?? 0) + 1);
    placed++;
    break;
  }
}

fs.writeFileSync(OUT_PATH, JSON.stringify(related, null, 0) + "\n");

// How many artists are reachable at all? Anything unlinked depends entirely on
// the directory, which is the situation we are trying to get out of.
const inbound = new Set();
for (const targets of Object.values(related)) {
  for (const t of targets.slice(0, LINKS_PER_ARTIST)) inbound.add(t);
}

const overLength = Object.values(related).filter(
  (l) => l.length > LINKS_PER_ARTIST,
).length;
if (overLength) {
  throw new Error(
    `${overLength} lists exceed ${LINKS_PER_ARTIST} entries; the page renders only the first ${LINKS_PER_ARTIST}, so the rest would be silently dropped.`,
  );
}

console.log(`  artists with no genre tags: ${noGenreCount} (scored on popularity and depth)`);
console.log(`  rescued by curated tags:    ${rescued}`);
console.log(`  orphans given an inbound link: ${placed}`);
console.log(`  artists with inbound links: ${inbound.size} / ${artists.length}`);
console.log(`  orphans (directory only):   ${artists.length - inbound.size}`);
console.log(`  file size:                  ${(fs.statSync(OUT_PATH).size / 1e6).toFixed(2)} MB`);
