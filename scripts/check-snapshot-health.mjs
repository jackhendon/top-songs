#!/usr/bin/env node
/**
 * Refuses to let a bad crawl reach production.
 *
 * The refresh workflow overwrites data/artist-snapshot.json and then deploys
 * whatever it produced. If Spotify were rate-limiting, Kworb were down, or the
 * page structure had changed, the crawl would still "succeed", it records
 * failures per artist rather than throwing, and we would ship 2,984 pages that
 * lost their stats, get noindexed by hasStats(), and drop out of the index we
 * just spent the effort getting back into.
 *
 * So compare against the committed snapshot before allowing a commit. A refresh
 * should change stream counts, not lose artists.
 *
 * Usage: node scripts/check-snapshot-health.mjs <previous.json> <current.json>
 * Exits non-zero if the new snapshot looks materially worse.
 */

import fs from "node:fs";

// A refresh that loses more than 2% of usable artists is a failed crawl, not a
// real change in the catalogue. Kworb dropping 60 artists in a week would be
// extraordinary; a partial outage doing so is routine.
const MAX_USABLE_LOSS_RATIO = 0.02;

const [, , previousPath, currentPath] = process.argv;

if (!previousPath || !currentPath) {
  console.error(
    "Usage: node scripts/check-snapshot-health.mjs <previous.json> <current.json>",
  );
  process.exit(2);
}

function usableCount(snapshot) {
  return Object.values(snapshot).filter(
    (a) => !a.error && a.exactMatch !== false && a.topTen?.length,
  ).length;
}

if (!fs.existsSync(previousPath)) {
  console.log("No previous snapshot to compare against; skipping health check.");
  process.exit(0);
}

const previous = JSON.parse(fs.readFileSync(previousPath, "utf8"));
const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));

const before = usableCount(previous);
const after = usableCount(current);
const lost = before - after;
const ratio = before === 0 ? 0 : lost / before;

console.log(`  usable artists before: ${before}`);
console.log(`  usable artists after:  ${after}`);
console.log(`  change:                ${lost > 0 ? `-${lost}` : `+${-lost}`}`);

if (ratio > MAX_USABLE_LOSS_RATIO) {
  console.error(
    `\nFAIL: lost ${lost} usable artists (${(ratio * 100).toFixed(1)}%), above the ` +
      `${MAX_USABLE_LOSS_RATIO * 100}% tolerance. This looks like a failed crawl rather ` +
      `than a real catalogue change, so the snapshot will not be committed.`,
  );
  process.exit(1);
}

// A refresh that changes nothing at all means the crawl did not actually run.
const changedStreams = Object.keys(current).filter((slug) => {
  const a = previous[slug]?.topTen?.[0]?.totalStreams;
  const b = current[slug]?.topTen?.[0]?.totalStreams;
  return a !== undefined && b !== undefined && a !== b;
}).length;

console.log(`  artists whose top track moved: ${changedStreams}`);

if (after > 0 && changedStreams === 0) {
  console.error(
    "\nFAIL: not one artist's stream count changed. The crawl almost certainly " +
      "served cached or empty responses rather than fetching.",
  );
  process.exit(1);
}

console.log("\nPASS: snapshot looks healthy.");
