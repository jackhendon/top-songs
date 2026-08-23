import type { ArtistSnapshot, SnapshotTrack } from "./types";
import { ARTIST_BIOS } from "./artistBios";

/**
 * Generates the prose on an artist page.
 *
 * The risk with 2,995 generated pages is that they read as one page repeated,
 * which is what Google treats as a doorway set. Two things guard against that
 * here. First, the sentences are built from figures that genuinely differ per
 * artist — stream totals, catalogue depth, how far the biggest hit sits ahead
 * of the tenth. Second, which sentence gets used is chosen by branching on the
 * shape of that data, so an artist with one runaway hit is described
 * differently from one with ten even ones, and a 500-track catalogue
 * differently from a 40-track one. Template rotation by slug hash is only the
 * tie-breaker, not the main source of variety.
 *
 * Everything here is derived from data we already hold. Nothing is invented.
 */

// --- formatting ---

export function formatStreams(streams: number): string {
  if (streams >= 1_000_000_000) {
    const bn = streams / 1_000_000_000;
    return `${bn >= 10 ? bn.toFixed(1) : bn.toFixed(2)} billion`;
  }
  if (streams >= 1_000_000) {
    return `${Math.round(streams / 1_000_000)} million`;
  }
  return streams.toLocaleString("en-GB");
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  return count.toLocaleString("en-GB");
}

/** Stable per-slug number so template choices are deterministic across builds. */
function hash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(options: T[], slug: string, salt = 0): T {
  return options[(hash(slug) + salt) % options.length];
}

function listGenres(genres: string[], limit = 3): string {
  const items = genres.slice(0, limit);
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// --- derived facts ---

export interface ArtistFacts {
  name: string;
  slug: string;
  topTen: SnapshotTrack[];
  biggest: SnapshotTrack;
  smallest: SnapshotTrack;
  totalTopTen: number;
  catalogueSize: number;
  followers: number | null;
  genres: string[];
  /** How many times the biggest hit outstreams the tenth. */
  dominance: number;
  /** Share of the top-10 total held by the biggest hit. */
  leadShare: number;
  billionPlayCount: number;
}

export function deriveFacts(record: ArtistSnapshot): ArtistFacts | null {
  const topTen = record.topTen ?? [];
  if (!topTen.length) return null;

  const biggest = topTen[0];
  const smallest = topTen[topTen.length - 1];
  const totalTopTen =
    record.totalStreamsTopTen ??
    topTen.reduce((sum, t) => sum + t.totalStreams, 0);

  return {
    name: record.spotifyName || record.name,
    slug: record.slug,
    topTen,
    biggest,
    smallest,
    totalTopTen,
    catalogueSize: record.catalogueSize ?? topTen.length,
    followers: record.followers ?? null,
    genres: record.genres ?? [],
    dominance: smallest.totalStreams
      ? biggest.totalStreams / smallest.totalStreams
      : 1,
    leadShare: totalTopTen ? biggest.totalStreams / totalTopTen : 0,
    billionPlayCount: topTen.filter((t) => t.totalStreams >= 1_000_000_000)
      .length,
  };
}

// --- "About" ---

export function aboutParagraph(facts: ArtistFacts): string {
  const { name, slug, genres, followers, catalogueSize } = facts;
  const hand = ARTIST_BIOS[slug];

  // A hand-written line exists for ~180 artists and beats anything generated,
  // so use it and let the generated sentences carry the rest.
  if (hand) return hand;

  const genreText = listGenres(genres);
  const sentences: string[] = [];

  if (genreText) {
    sentences.push(
      pick(
        [
          `${name} records ${genreText}, and the Spotify numbers below show which of those tracks listeners keep coming back to.`,
          `Filed by Spotify under ${genreText}, ${name} has built a streaming catalogue deep enough to make the top ten a genuine question.`,
          `${name} works in ${genreText}. The ten most-streamed tracks are not always the ten you would name from memory.`,
        ],
        slug,
      ),
    );
  } else {
    sentences.push(
      pick(
        [
          `${name} has a streaming catalogue big enough that naming the ten most-played tracks is harder than it sounds.`,
          `Spotify lists no genre tags for ${name}, so the streaming figures are the clearest guide to what actually landed.`,
          `The ten biggest ${name} tracks on Spotify are decided by play count alone, which is not the same as the ten best known.`,
        ],
        slug,
      ),
    );
  }

  if (catalogueSize >= 200) {
    sentences.push(
      `With ${catalogueSize.toLocaleString("en-GB")} tracks tracked on Spotify, there is a lot of catalogue to sort through before the top ten falls out.`,
    );
  } else if (catalogueSize >= 40) {
    sentences.push(
      `${catalogueSize} tracks are tracked in total, so the top ten represents a meaningful slice of everything released.`,
    );
  } else {
    sentences.push(
      `Only ${catalogueSize} tracks are tracked on Spotify, which makes the top ten a large share of the whole catalogue.`,
    );
  }

  if (followers) {
    sentences.push(
      `${formatFollowers(followers)} people follow ${name} on Spotify.`,
    );
  }

  return sentences.join(" ");
}

// --- "on Spotify" stats prose ---

/**
 * Stats prose for the visible part of the page.
 *
 * Deliberately names no tracks. This is the game's answer key, so every title
 * belongs behind the collapsed <details> block — the numbers, ratios and shape
 * of the distribution are what make the paragraph unique per artist, and they
 * give plenty away about how hard the round will be without giving away a
 * single answer.
 */
export function statsParagraph(facts: ArtistFacts): string {
  const {
    name,
    slug,
    biggest,
    smallest,
    totalTopTen,
    dominance,
    leadShare,
    billionPlayCount,
    catalogueSize,
  } = facts;

  const sentences: string[] = [];

  sentences.push(
    pick(
      [
        `${name}'s ten most-streamed tracks have been played ${formatStreams(totalTopTen)} times between them on Spotify.`,
        `Together, the ten biggest ${name} tracks account for ${formatStreams(totalTopTen)} Spotify streams.`,
        `Add up ${name}'s top ten and you get ${formatStreams(totalTopTen)} plays on Spotify.`,
        `${formatStreams(totalTopTen)} Spotify streams sit across ${name}'s ten biggest tracks.`,
      ],
      slug,
    ),
  );

  sentences.push(
    pick(
      [
        `The biggest single track among them has ${formatStreams(biggest.totalStreams)} streams on its own.`,
        `Number one alone accounts for ${formatStreams(biggest.totalStreams)} of those plays.`,
        `The leading track has passed ${formatStreams(biggest.totalStreams)} streams.`,
      ],
      slug,
      1,
    ),
  );

  // Thresholds come from the real distribution across the catalogue rather than
  // being picked by eye: the median artist's biggest track outstreams their
  // tenth by about 5x, so a single ">= 5" branch would have described half of
  // all pages in identical words.
  const gapPhrasings: string[] =
    dominance >= 20
      ? [
          `The gap at the top is enormous — around ${Math.round(dominance)} times between first and tenth — and the leading track takes ${Math.round(leadShare * 100)}% of the top ten by itself. Expect one obvious answer and nine much harder ones.`,
          `This is a catalogue with a single runaway track, outstreaming tenth place by roughly ${Math.round(dominance)} to one.`,
          `One track dominates completely, taking ${Math.round(leadShare * 100)}% of the top ten's plays on its own.`,
        ]
      : dominance >= 10
        ? [
            `The drop-off is steep: about ${Math.round(dominance)}x separates first from tenth.`,
            `Streams thin out fast below the top few, with tenth place on roughly a ${Math.round(dominance)}th of the leader's total.`,
            `First place sits well clear, on about ${Math.round(dominance)} times the plays of tenth.`,
          ]
        : dominance >= 5
          ? [
              `There is a real gap between first and tenth here — roughly ${Math.round(dominance)}x.`,
              `The leader takes ${Math.round(leadShare * 100)}% of the top ten's streams, so the top of the list is easier to call than the bottom.`,
              `First outstreams tenth by about ${Math.round(dominance)} to one.`,
            ]
          : dominance >= 2.5
            ? [
                `First to tenth spans only about ${dominance.toFixed(1)}x, so the back half of the list is genuinely competitive.`,
                `The leader is ahead but not runaway, on around ${dominance.toFixed(1)} times the plays of tenth.`,
                `A ${dominance.toFixed(1)}x spread from first to tenth makes the ordering harder than the names.`,
              ]
            : [
                `The top ten is unusually flat — just ${dominance.toFixed(1)}x separates first from tenth, so there is no obvious track to guess first.`,
                `These ten are tightly packed, with only ${dominance.toFixed(1)}x between the biggest and the tenth.`,
                `Nothing dominates: the spread across the ten is only ${dominance.toFixed(1)}x, so any of them could be the one you miss.`,
              ];

  sentences.push(pick(gapPhrasings, slug, 2));

  // Nearly half of all artists have no billion-stream track, so that case gets
  // its own phrasings keyed to actual scale rather than one flat sentence.
  if (billionPlayCount >= 5) {
    sentences.push(
      pick(
        [
          `${billionPlayCount} of the ten have passed a billion streams each.`,
          `A billion streams is the norm rather than the exception here — ${billionPlayCount} of the ten have cleared it.`,
        ],
        slug,
        3,
      ),
    );
  } else if (billionPlayCount > 0) {
    sentences.push(
      billionPlayCount === 1
        ? `One track has passed a billion streams; the other nine sit below it.`
        : `${billionPlayCount} of the ten have passed a billion streams.`,
    );
  } else if (biggest.totalStreams >= 500_000_000) {
    sentences.push(
      pick(
        [
          `None has reached a billion streams yet, though the leader is well on the way.`,
          `The billion mark is still ahead of ${name}, but not by much.`,
        ],
        slug,
        3,
      ),
    );
  } else if (biggest.totalStreams >= 50_000_000) {
    sentences.push(
      `These are solid rather than stadium-scale numbers, which tends to make the ordering harder to guess.`,
    );
  } else {
    sentences.push(
      `The numbers here are modest by Spotify's standards, so the ranking is closer than it looks.`,
    );
  }

  sentences.push(
    `Tenth place comes in at ${formatStreams(smallest.totalStreams)} streams, out of ${catalogueSize.toLocaleString("en-GB")} ${catalogueSize === 1 ? "track" : "tracks"} tracked in total — that is the line you need to find to complete the list.`,
  );

  return sentences.join(" ");
}

// --- FAQ ---

export interface FaqEntry {
  question: string;
  answer: string;
  /**
   * True when the answer names a track, which makes it an answer to the quiz.
   * The page keeps these behind a collapsed <details> so they are in the markup
   * and indexable but never visible on load.
   */
  spoiler?: boolean;
}

export function buildFaq(facts: ArtistFacts): FaqEntry[] {
  const { name, biggest, topTen, totalTopTen, catalogueSize, followers } =
    facts;

  const entries: FaqEntry[] = [
    {
      question: `What is ${name}'s most streamed song on Spotify?`,
      answer: `"${biggest.title}" is ${name}'s most-streamed song on Spotify, with ${formatStreams(biggest.totalStreams)} streams.`,
      spoiler: true,
    },
    {
      question: `What are ${name}'s top 10 songs on Spotify?`,
      answer: `Ranked by total Spotify streams, they are ${topTen
        .map((t, i) => `${i + 1}. ${t.title}`)
        .join(", ")}.`,
      spoiler: true,
    },
    {
      question: `How many streams does ${name} have on Spotify?`,
      answer: `${name}'s ten most-streamed tracks have ${formatStreams(totalTopTen)} plays between them. Spotify tracks ${catalogueSize.toLocaleString("en-GB")} ${catalogueSize === 1 ? "song" : "songs"} in total, so the full career figure is higher.`,
    },
  ];

  if (followers) {
    entries.push({
      question: `How many followers does ${name} have on Spotify?`,
      answer: `${name} has ${followers.toLocaleString("en-GB")} followers on Spotify.`,
    });
  }

  entries.push({
    question: `Where does this ${name} streaming data come from?`,
    answer: `Stream counts come from Kworb.net, which aggregates public Spotify chart data. Artist details and follower counts come from the Spotify API. Figures are refreshed periodically, so they lag live Spotify counts slightly.`,
  });

  return entries;
}
