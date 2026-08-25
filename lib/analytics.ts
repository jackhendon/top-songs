import posthog from "posthog-js";

const OPT_OUT_KEY = "analytics-opt-out";
const VISITOR_KEY = "top-songs-visitor";
const VISIT_COUNTED_KEY = "top-songs-visit-counted";

let initialized = false;

interface VisitorRecord {
  /** ISO date, day granularity. Not a timestamp: no need to know the minute. */
  first: string;
  last: string;
  visits: number;
}

/**
 * Counts returning visitors without identifying anyone.
 *
 * Analytics runs cookieless with sessionStorage persistence, so PostHog treats
 * every visit as a brand new person and cannot answer "does anyone come back".
 * That is the single most important thing we do not know about this site.
 *
 * Rather than reinstate a persistent identifier (which would drag the consent
 * question back with it), keep a local tally and send it as event properties.
 * The result is aggregate: we learn that 40% of sessions are from someone who
 * has been before, without being able to follow any individual across visits.
 * There is deliberately no generated id here, only two dates and a counter.
 *
 * This does mean no true cohort retention, since day-1/day-7 curves by
 * acquisition date need a stable identity. Aggregate first; escalate only if
 * the numbers say returners are worth chasing.
 */
function recordVisit(): VisitorRecord | null {
  if (typeof window === "undefined") return null;

  const today = new Date().toISOString().slice(0, 10);

  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    const existing: VisitorRecord | null = raw ? JSON.parse(raw) : null;

    // Count one visit per tab, not per page load, or client-side navigation
    // would inflate it.
    const alreadyCounted =
      sessionStorage.getItem(VISIT_COUNTED_KEY) === "true";

    const record: VisitorRecord = existing
      ? {
          first: existing.first ?? today,
          last: today,
          visits: existing.visits + (alreadyCounted ? 0 : 1),
        }
      : { first: today, last: today, visits: 1 };

    localStorage.setItem(VISITOR_KEY, JSON.stringify(record));
    sessionStorage.setItem(VISIT_COUNTED_KEY, "true");
    return record;
  } catch {
    // Private mode, blocked storage, or corrupt JSON. Returning-visitor data
    // is a nice-to-have; never let it break analytics or the page.
    return null;
  }
}

function daysBetween(from: string, to: string): number {
  const ms = Date.parse(to) - Date.parse(from);
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86_400_000)) : 0;
}

/**
 * Analytics runs by default and stores nothing that outlives the browser tab.
 * Anyone who would rather not be counted can opt out from the privacy page,
 * and that single preference is the only thing we persist.
 */
export function hasOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "true";
  } catch {
    return false;
  }
}

export function setOptedOut(optedOut: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (optedOut) {
      localStorage.setItem(OPT_OUT_KEY, "true");
    } else {
      localStorage.removeItem(OPT_OUT_KEY);
    }
  } catch {
    // Storage unavailable (private mode, blocked). Fall through to the
    // in-memory switch below so the choice still applies to this page.
  }

  if (!initialized) {
    if (!optedOut) initPostHog();
    return;
  }

  if (optedOut) {
    posthog.opt_out_capturing();
  } else {
    posthog.opt_in_capturing();
  }
}

export function initPostHog() {
  if (typeof window === "undefined" || initialized) return;
  if (process.env.NODE_ENV === "development") return;
  if (hasOptedOut()) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!key) return;

  posthog.init(key, {
    // First-party path, rewritten to PostHog in next.config.ts. Requests to a
    // third-party analytics domain are on every standard blocklist; requests
    // to our own origin are not.
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,

    // The app navigates client-side, so pageviews have to follow history
    // changes. Plain `true` only fires once, on init, which made page views
    // indistinguishable from sessions.
    capture_pageview: "history_change",
    capture_pageleave: true,

    // Per-tab, cleared when the tab closes. No cookies and nothing that
    // outlives the visit, but stable enough within a visit that page views per
    // session and entry pages are real numbers rather than restating pageloads.
    persistence: "sessionStorage",

    autocapture: false,

    // Replay is otherwise switchable on from the PostHog dashboard with no
    // code change and no deploy. It would capture DOM interaction and typed
    // input, far beyond what the privacy policy describes, so the guarantee
    // lives here in the repo rather than in a project setting.
    disable_session_recording: true,

    debug: (process.env.NODE_ENV as string) === "development",
  });

  initialized = true;

  // Attach to every event in this session so any insight can split on it.
  const visitor = recordVisit();
  if (visitor) {
    posthog.register({
      is_returning: visitor.visits > 1,
      visit_count: visitor.visits,
      days_since_first_visit: daysBetween(visitor.first, visitor.last),
    });
  }
}

function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined" || !initialized) return;
  posthog.capture(event, properties);
}

export function trackArtistSearch(
  artistName: string,
  method: "search" | "seo-page" | "url-direct" | "autocomplete",
) {
  capture("artist_search", { artist_name: artistName, method });
}

export function trackGameStart(artistName: string, artistId: string) {
  capture("game_start", { artist_name: artistName, artist_id: artistId });
}

export function trackGuess(props: {
  artistName: string;
  guessText: string;
  correct: boolean;
  isOverflow: boolean;
  position?: number;
  totalGuesses: number;
}) {
  capture("guess", {
    artist_name: props.artistName,
    // The raw text is deliberately not sent. This event only fires with a
    // guessText when the guess matched no song, so the only values it could
    // carry are arbitrary keyboard input, never a track title. That is
    // unbounded user-typed content going to a third-party processor for no
    // analytical gain: the length distribution answers the same questions.
    guess_length: props.guessText.length,
    correct: props.correct,
    is_overflow: props.isOverflow,
    position: props.position,
    total_guesses: props.totalGuesses,
  });
}

export function trackGameWon(props: {
  artistName: string;
  artistId: string;
  totalGuesses: number;
  timeSeconds: number;
  overflowCount: number;
}) {
  capture("game_won", {
    artist_name: props.artistName,
    artist_id: props.artistId,
    total_guesses: props.totalGuesses,
    time_seconds: props.timeSeconds,
    overflow_count: props.overflowCount,
  });
}

export function trackGameAbandoned(props: {
  artistName: string;
  guessesUsed: number;
  slotsRevealed: number;
}) {
  capture("game_abandoned", {
    artist_name: props.artistName,
    guesses_used: props.guessesUsed,
    slots_revealed: props.slotsRevealed,
  });
}

export function trackShare(
  artistName: string,
  platform: "clipboard" | "twitter" | "native",
) {
  capture("share", { artist_name: artistName, platform });
}

export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, unknown>,
) {
  capture("error", {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
}

export function trackHintReveal(props: {
  artistName: string;
  slotIndex: number; // 1-based rank position
  hintLevel: 1 | 2; // 1 = first letter, 2 = full answer
  hintsUsed: number; // cumulative hints used in this game
  guessesUsed: number;
}) {
  capture("hint_reveal", {
    artist_name: props.artistName,
    slot_index: props.slotIndex,
    hint_level: props.hintLevel,
    hint_type: props.hintLevel === 1 ? "first_letter" : "full_answer",
    hints_used: props.hintsUsed,
    guesses_used: props.guessesUsed,
  });
}

/**
 * A click from the end-of-game screen through to another artist.
 *
 * This is the whole point of that block: 83% of players who finish one round
 * leave, but anyone who reaches a second artist almost always keeps going.
 * Without this event there is no way to tell whether the block moved that.
 */
export function trackNextArtist(props: {
  fromArtist: string;
  toSlug: string;
  outcome: "won" | "gave_up";
}) {
  capture("next_artist_click", {
    from_artist: props.fromArtist,
    to_slug: props.toSlug,
    outcome: props.outcome,
  });
}

export function trackDonationClick() {
  capture("donation_click");
}

export function trackProfileView(props: { gamesPlayed: number }) {
  capture("profile_view", { games_played: props.gamesPlayed });
}

export function trackHistoryCleared(props: { gamesCleared: number }) {
  capture("history_cleared", { games_cleared: props.gamesCleared });
}
