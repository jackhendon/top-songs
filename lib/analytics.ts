import posthog from "posthog-js";

const OPT_OUT_KEY = "analytics-opt-out";

let initialized = false;

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
    debug: (process.env.NODE_ENV as string) === "development",
  });

  initialized = true;
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
    guess_text: props.guessText,
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

export function trackDonationClick() {
  capture("donation_click");
}

export function trackProfileView(props: { gamesPlayed: number }) {
  capture("profile_view", { games_played: props.gamesPlayed });
}

export function trackHistoryCleared(props: { gamesCleared: number }) {
  capture("history_cleared", { games_cleared: props.gamesCleared });
}
