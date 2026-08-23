#!/usr/bin/env node
/**
 * Builds data/artist-snapshot.json: one record per artist holding everything
 * the artist page needs to render server-side.
 *
 * Artist pages used to fetch this per request — a Spotify search on every
 * render and, if the top 10 were to be server-rendered, a Kworb scrape too.
 * At ~2s per artist that is unusable at build time for 2,995 pages, and it
 * would mean pointing 3,000 scrapes at a hobbyist site with no API every time
 * the cache expired. So we crawl it once, slowly and politely, and commit the
 * result.
 *
 * The live /api/artist route is untouched: gameplay still needs the full song
 * list, and that stays fresh per request.
 *
 * Usage:
 *   node scripts/build-artist-snapshot.mjs                 # resume, skip done
 *   node scripts/build-artist-snapshot.mjs --limit 25      # smoke test
 *   node scripts/build-artist-snapshot.mjs --force         # re-fetch everything
 *   node scripts/build-artist-snapshot.mjs --only kygo,sza # named slugs
 *
 * Progress is flushed to disk continuously, so an interrupted run resumes
 * where it stopped rather than starting over.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

// import.meta.dirname needs Node 20.11+; this form works everywhere.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARTISTS_PATH = path.join(ROOT, "data", "artists.json");
const SNAPSHOT_PATH = path.join(ROOT, "data", "artist-snapshot.json");
const OVERRIDES_PATH = path.join(ROOT, "data", "artist-overrides.json");

// Deliberately gentle. Kworb has no API and no published rate limit, so treat
// it the way we would want to be treated: a couple of requests in flight and a
// pause between each one. A full run takes roughly half an hour; it is a
// once-in-a-while job, not a hot path.
const CONCURRENCY = Number(process.env.SNAPSHOT_CONCURRENCY || 3);
const DELAY_MS = Number(process.env.SNAPSHOT_DELAY_MS || 350);
const MAX_RETRIES = 4;
const FLUSH_EVERY = 25;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const FORCE = flag("--force");
const LIMIT = value("--limit") ? Number(value("--limit")) : undefined;
const ONLY = value("--only")?.split(",").map((s) => s.trim());

// --- env ---

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq < 1 || line.trimStart().startsWith("#")) continue;
    const key = line.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = line.slice(eq + 1).trim();
  }
}

// --- helpers ---

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function foldName(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Retries on 429 and 5xx, honouring Retry-After. Everything else surfaces. */
async function fetchWithRetry(url, options = {}, label = url) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(30_000, 1000 * 2 ** attempt);
        if (attempt === MAX_RETRIES) return res;
        console.warn(
          `  ${res.status} on ${label}; waiting ${Math.round(wait / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await sleep(wait);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt === MAX_RETRIES) throw err;
      await sleep(Math.min(30_000, 1000 * 2 ** attempt));
    }
  }
  throw lastError;
}

// --- Spotify ---

let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiresAt) return token;

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set (.env.local)",
    );
  }

  const res = await fetchWithRetry(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    },
    "spotify token",
  );
  if (!res.ok) throw new Error(`Spotify token failed: ${res.status}`);

  const data = await res.json();
  token = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return token;
}

/**
 * Mirrors searchSpotifyArtist in lib/getArtistData.ts: ask for 10 and prefer an
 * exact name match, because Spotify's ranking hands short names to bigger
 * artists ("Jão" returns João Gilberto otherwise).
 */
async function resolveArtist(name) {
  const accessToken = await getToken();
  const res = await fetchWithRetry(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    `spotify search ${name}`,
  );
  if (!res.ok) throw new Error(`Spotify search ${res.status}`);

  const items = (await res.json()).artists?.items ?? [];
  if (!items.length) return null;

  const target = foldName(name);
  const exact = items
    .filter((a) => foldName(a.name) === target)
    .sort((a, b) => (b.followers?.total ?? 0) - (a.followers?.total ?? 0));

  const artist = exact[0] ?? items[0];
  return {
    spotifyId: artist.id,
    spotifyName: artist.name,
    exactMatch: Boolean(exact.length),
    imageUrl: artist.images?.[0]?.url ?? null,
    genres: artist.genres ?? [],
    followers: artist.followers?.total ?? null,
  };
}

/** Fetches a specific artist by Spotify id, for hand-pinned overrides. */
async function resolveById(spotifyId) {
  const accessToken = await getToken();
  const res = await fetchWithRetry(
    `https://api.spotify.com/v1/artists/${spotifyId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    `spotify artist ${spotifyId}`,
  );
  if (!res.ok) throw new Error(`Spotify artist lookup ${res.status}`);
  const artist = await res.json();
  return {
    spotifyId: artist.id,
    spotifyName: artist.name,
    // Pinned by hand, so treat it as verified regardless of name spelling.
    exactMatch: true,
    imageUrl: artist.images?.[0]?.url ?? null,
    genres: artist.genres ?? [],
    followers: artist.followers?.total ?? null,
  };
}

// --- Kworb ---

function parseStreamCount(text) {
  if (!text || !text.trim()) return 0;
  const cleaned = text.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return 0;
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : Math.floor(n);
}

async function fetchSongs(spotifyId) {
  const res = await fetchWithRetry(
    `https://kworb.net/spotify/artist/${spotifyId}_songs.html`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; TopSongsGame/1.0)" } },
    `kworb ${spotifyId}`,
  );
  if (res.status === 404) return { notFound: true, songs: [] };
  if (!res.ok) throw new Error(`Kworb ${res.status}`);

  const $ = cheerio.load(await res.text());
  const table = $("table.addpos.sortable");
  if (!table.length) throw new Error("no song table on Kworb page");

  const songs = [];
  table.find("tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    let title = "";
    const streams = [];
    cells.each((__, cell) => {
      const $cell = $(cell);
      const link = $cell.find("a");
      if (link.length && !title) title = link.text().trim();
      const parsed = parseStreamCount($cell.text().trim());
      if (parsed > 0) streams.push(parsed);
    });

    if (title && streams.length) {
      const sorted = [...streams].sort((a, b) => b - a);
      songs.push({ title, totalStreams: sorted[0] ?? 0 });
    }
  });

  songs.sort((a, b) => b.totalStreams - a.totalStreams);
  return { notFound: false, songs };
}

// --- snapshot record ---

async function buildRecord(artist, overrides) {
  // A hand-pinned Spotify id wins over search. Search cannot disambiguate a
  // one-letter stage name — "V" ranks Vybz Kartel first — and there is no
  // heuristic that fixes that, only a human decision recorded once.
  const pinned = overrides[artist.slug];
  const resolved = pinned
    ? await resolveById(pinned)
    : await resolveArtist(artist.name);
  if (!resolved) {
    return { slug: artist.slug, name: artist.name, error: "not-on-spotify" };
  }

  const { notFound, songs } = await fetchSongs(resolved.spotifyId);
  if (notFound || !songs.length) {
    return {
      slug: artist.slug,
      name: artist.name,
      spotifyId: resolved.spotifyId,
      spotifyName: resolved.spotifyName,
      exactMatch: resolved.exactMatch,
      imageUrl: resolved.imageUrl,
      genres: resolved.genres,
      followers: resolved.followers,
      error: notFound ? "no-kworb-page" : "no-songs-parsed",
    };
  }

  return {
    slug: artist.slug,
    name: artist.name,
    spotifyId: resolved.spotifyId,
    spotifyName: resolved.spotifyName,
    exactMatch: resolved.exactMatch,
    imageUrl: resolved.imageUrl,
    genres: resolved.genres,
    followers: resolved.followers,
    // Only the top 10 is committed. The game needs the full list and gets it
    // live from /api/artist; duplicating hundreds of songs per artist here
    // would bloat the repo for content nothing renders.
    topTen: songs.slice(0, 10).map((s, i) => ({
      rank: i + 1,
      title: s.title,
      totalStreams: s.totalStreams,
    })),
    catalogueSize: songs.length,
    totalStreamsTopTen: songs
      .slice(0, 10)
      .reduce((sum, s) => sum + s.totalStreams, 0),
    fetchedAt: new Date().toISOString(),
  };
}

// --- main ---

async function main() {
  loadEnv();

  const artists = JSON.parse(fs.readFileSync(ARTISTS_PATH, "utf8"));
  const overrides = fs.existsSync(OVERRIDES_PATH)
    ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))
    : {};
  if (Object.keys(overrides).length) {
    console.log(`${Object.keys(overrides).length} hand-pinned Spotify ids in use`);
  }

  /** @type {Record<string, object>} */
  let snapshot = {};
  if (fs.existsSync(SNAPSHOT_PATH) && !FORCE) {
    snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
    console.log(`Resuming: ${Object.keys(snapshot).length} artists already held`);
  }

  let queue = artists.filter((a) => a.slug);
  if (ONLY) queue = queue.filter((a) => ONLY.includes(a.slug));
  // Retry previous failures on a re-run; they are usually transient.
  if (!FORCE) queue = queue.filter((a) => !snapshot[a.slug] || snapshot[a.slug].error);
  if (LIMIT) queue = queue.slice(0, LIMIT);

  console.log(
    `Fetching ${queue.length} artists at concurrency ${CONCURRENCY}, ${DELAY_MS}ms apart\n`,
  );

  const started = Date.now();
  let done = 0;
  let failed = 0;
  let cursor = 0;

  const flush = () => {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 0) + "\n");
  };

  async function worker(id) {
    // Stagger workers so they do not all hit the same host in lockstep.
    await sleep(id * DELAY_MS);

    while (cursor < queue.length) {
      const artist = queue[cursor++];
      try {
        const record = await buildRecord(artist, overrides);
        snapshot[artist.slug] = record;
        if (record.error) {
          failed++;
          console.log(`  [${++done}/${queue.length}] ${artist.name} — ${record.error}`);
        } else {
          done++;
          if (done % 50 === 0 || queue.length <= 25) {
            const rate = done / ((Date.now() - started) / 1000);
            const left = Math.round((queue.length - done) / Math.max(rate, 0.01));
            console.log(
              `  [${done}/${queue.length}] ${artist.name} — ${record.topTen.length} tracks, ${record.catalogueSize} in catalogue (~${Math.round(left / 60)}m left)`,
            );
          }
        }
      } catch (err) {
        failed++;
        done++;
        snapshot[artist.slug] = {
          slug: artist.slug,
          name: artist.name,
          error: String(err.message || err),
        };
        console.warn(`  [${done}/${queue.length}] ${artist.name} — FAILED: ${err.message}`);
      }

      if (done % FLUSH_EVERY === 0) flush();
      await sleep(DELAY_MS);
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => worker(i)),
  );
  flush();

  const records = Object.values(snapshot);
  const errors = records.filter((r) => r.error);
  const byReason = {};
  for (const r of errors) byReason[r.error] = (byReason[r.error] ?? 0) + 1;

  console.log(`\nDone in ${Math.round((Date.now() - started) / 1000)}s`);
  console.log(`  snapshot holds:  ${records.length} artists`);
  console.log(`  usable:          ${records.length - errors.length}`);
  console.log(`  unusable:        ${errors.length} (${failed} this run)`);
  for (const [reason, count] of Object.entries(byReason)) {
    console.log(`    ${reason}: ${count}`);
  }
  console.log(`  inexact matches: ${records.filter((r) => r.exactMatch === false).length}`);
  console.log(`  file size:       ${(fs.statSync(SNAPSHOT_PATH).size / 1e6).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
