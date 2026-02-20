import posthog from "posthog-js";

const CONSENT_KEY = "analytics-consent";

let initialized = false;

export function getConsent(): "yes" | "no" | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "yes" || value === "no") return value;
  return null;
}

export function hasConsented(): boolean {
  return getConsent() === "yes";
}

export function setConsent(value: "yes" | "no") {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
}

export function initPostHog() {
  if (typeof window === "undefined" || initialized) return;
  if (process.env.NODE_ENV === "development") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    persistence: "memory",
    debug: process.env.NODE_ENV === "development",
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
