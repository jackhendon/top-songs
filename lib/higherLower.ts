import { getArtistSnapshot, INDEXABLE_SLUGS } from "./artistSnapshot";

/**
 * Higher/lower: given a track's Spotify stream count, is the next track higher
 * or lower?
 *
 * The point of this mode is a low floor. The artist quiz asks you to recall a
 * specific artist's top ten, which measured bimodal: 49% of players score 10/10
 * and 12% score zero, with almost nobody in between. You either know the artist
 * or you get nowhere. Comparison needs no recall, so everyone can reason and
 * everyone ends with a streak rather than a zero.
 *
 * Two things had to be true for the format to work, both checked against the
 * real data before this was written:
 *
 * 1. Pairs must be decidable but not obvious. Across all 29,814 tracks only 55%
 *    of random pairs land in a useful ratio band; restricted to tracks above
 *    300M streams it is 74%, because the tail is full of near-ties between
 *    tracks nobody could rank.
 * 2. Tracks must be recognisable, or "reasoning" degrades into a coin flip.
 *    The same 300M floor does that job: it is the difference between comparing
 *    two songs you have heard of and two you have not.
 */

const MIN_STREAMS = 300_000_000;

/** Ratio band that makes a pair a real question rather than a gimme or a toss-up. */
const MIN_RATIO = 1.2;
const MAX_RATIO = 3;

export interface HLTrack {
  title: string;
  artist: string;
  artistSlug: string;
  streams: number;
  imageUrl?: string;
}

let pool: HLTrack[] | null = null;

/** Every track above the recognisability floor. Built once per process. */
export function getPool(): HLTrack[] {
  if (pool) return pool;

  const built: HLTrack[] = [];
  for (const slug of INDEXABLE_SLUGS) {
    const record = getArtistSnapshot(slug);
    if (!record?.topTen) continue;

    for (const track of record.topTen) {
      if (track.totalStreams < MIN_STREAMS) continue;
      built.push({
        title: track.title,
        artist: record.spotifyName || record.name,
        artistSlug: slug,
        streams: track.totalStreams,
        imageUrl: record.imageUrl ?? undefined,
      });
    }
  }

  // Sorted so candidate lookup for a ratio band is a slice rather than a scan.
  built.sort((a, b) => a.streams - b.streams);
  pool = built;
  return pool;
}

/**
 * mulberry32. Deterministic so a given seed always yields the same chain, which
 * is what lets everyone play the same daily regardless of timezone or cache.
 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Index of the first track with at least `streams`, via binary search. */
function lowerBound(sorted: HLTrack[], streams: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid].streams < streams) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Builds a chain where every consecutive pair sits in the ratio band.
 *
 * The same artist is never used twice in a row: two tracks by one artist is a
 * different, easier question (you are ranking within a discography you may
 * already know) and it makes the chain feel repetitive.
 */
export function buildChain(seed: string, length: number): HLTrack[] {
  const all = getPool();
  if (all.length < length + 1) return [];

  const random = rng(hashSeed(seed));
  const chain: HLTrack[] = [];
  const used = new Set<string>();

  const key = (t: HLTrack) => `${t.artistSlug}::${t.title}`;

  let current = all[Math.floor(random() * all.length)];
  chain.push(current);
  used.add(key(current));

  while (chain.length < length + 1) {
    // Candidates are those within the band either side of the current track.
    const lowFloor = lowerBound(all, Math.ceil(current.streams / MAX_RATIO));
    const lowCeil = lowerBound(all, Math.ceil(current.streams / MIN_RATIO));
    const highFloor = lowerBound(all, Math.ceil(current.streams * MIN_RATIO));
    const highCeil = lowerBound(all, Math.ceil(current.streams * MAX_RATIO));

    const candidates: HLTrack[] = [];
    for (let i = lowFloor; i < lowCeil; i++) candidates.push(all[i]);
    for (let i = highFloor; i < highCeil; i++) candidates.push(all[i]);

    const usable = candidates.filter(
      (t) => !used.has(key(t)) && t.artistSlug !== current.artistSlug,
    );

    // No partner in band. Rather than widen the band and ship a bad question,
    // jump to a fresh unused track and carry on.
    const next =
      usable.length > 0
        ? usable[Math.floor(random() * usable.length)]
        : all.filter((t) => !used.has(key(t)))[
            Math.floor(random() * (all.length - used.size))
          ];

    if (!next) break;

    chain.push(next);
    used.add(key(next));
    current = next;
  }

  return chain;
}

/** UTC so everyone gets the same puzzle whatever their timezone. */
export function todayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Puzzle number, counted from launch so the share text has a referent. */
const EPOCH = Date.UTC(2026, 7, 25); // 25 Aug 2026

export function puzzleNumber(dayKey: string): number {
  return Math.floor((Date.parse(dayKey) - EPOCH) / 86_400_000) + 1;
}
