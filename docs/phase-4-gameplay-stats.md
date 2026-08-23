# Phase 4, per-artist gameplay stats

**Status: proposal only. Nothing built.**

The plan says to build this if gameplay results are already stored, and to write
a proposal and stop if they are not. They are not, but the situation is better
than "not stored", and worse than it looks. Both are worth spelling out before
anyone writes a migration.

## What exists today

No server-side storage of any kind. `lib/historyStore.ts` is a Zustand `persist`
store writing to `localStorage` under `top-songs-history`, capped at 100 games.
It never leaves the device, so it cannot be aggregated.

**But PostHog already receives everything Phase 4 asks for.** `lib/analytics.ts`
sends, per guess:

```
guess  { artist_name, guess_text, correct, is_overflow, position, total_guesses }
```

plus `game_start`, `game_won` (`total_guesses`, `time_seconds`, `overflow_count`),
`game_abandoned` and `hint_reveal`. Every metric the plan lists is derivable:

| Plan asks for | Derivation |
|---|---|
| Average score out of 10 | mean slots revealed per `game_won` / `game_abandoned` |
| % of players who guessed each track | `guess` where `correct` and `position = n`, over `game_start`, grouped by `artist_name` |
| Most-missed track | the lowest such percentage |
| Number of games played | count of `game_start` by `artist_name` |

So the mechanism needs no new storage. It needs a build-time fetch against the
PostHog query API, cached into `data/gameplay-stats.json` the same way the artist
snapshot works, and a new `POSTHOG_PERSONAL_API_KEY` environment variable 
flagged rather than added, per the plan's rule 6.

## Why it should not be built yet

The blocker is volume, not plumbing.

PostHog reports **3,446 events in 7 days**, roughly 490/day. A single completed
game emits one `game_start`, 10–25 `guess` events, and a `game_won` or
`game_abandoned`, so call it ~20 events per game. That implies on the order of
**20–30 games per day across the whole site**.

Spread across 2,995 artists, that is not a per-artist dataset. It is not even a
per-artist datapoint. Most artists would have zero games ever; the busiest might
have a handful a week. "Only 14% of players got 'Firestone'" needs a denominator
in the hundreds before it means anything, and publishing it off a denominator of
six is worse than publishing nothing, it is a wrong number on a page we are
asking Google to treat as authoritative.

Two further caveats on the existing event stream:

- Until today's analytics change, events only fired for visitors who accepted
  the consent banner, so historical volume is a subset of actual play.
- `game_abandoned` only fires on an explicit give-up. A player who closes the
  tab emits nothing, so completion rate is `game_won / game_start` and the
  denominator includes silent drop-off.

## Recommended sequencing

1. **Do nothing now.** Revisit when indexation recovers. The gating number is
   games per artist, not games per day.
2. **Set a publication threshold.** Render gameplay stats only for artists above
   a floor, 50 completed games is a reasonable starting point, and render
   nothing at all below it. This is the important design decision: it must be a
   hard gate in code, not a judgement call, or thin stats will leak onto the
   long tail exactly where they are least reliable.
3. **When the threshold is worth crossing**, add
   `scripts/build-gameplay-stats.mjs` mirroring the artist-snapshot script:
   query PostHog, write `data/gameplay-stats.json`, let the page read it. No
   database, no request-time queries, no new runtime dependency.

## If dedicated storage is preferred instead

PostHog is a reasonable store for this and avoids new infrastructure, so the bar
for a database should be high. If one is wanted anyway, the minimal shape is one
row per completed game:

```sql
CREATE TABLE game_result (
  id           bigserial PRIMARY KEY,
  artist_slug  text        NOT NULL,
  finished_at  timestamptz NOT NULL DEFAULT now(),
  outcome      text        NOT NULL,  -- 'won' | 'gave_up'
  guesses      smallint    NOT NULL,
  hints_used   smallint    NOT NULL,
  seconds      integer     NOT NULL,
  -- Which of the ten were guessed, as a 10-bit mask. Gives per-track hit rates
  -- without storing a row per guess or any free text.
  revealed     smallint    NOT NULL
);

CREATE INDEX ON game_result (artist_slug, finished_at DESC);
```

At 30 games/day that is ~11k rows/year, comfortably inside the free tier of
Vercel Postgres, Neon or Supabase. Cost is effectively zero; the cost is the
write path, the abuse surface of an unauthenticated write endpoint, and the
migration discipline, which is the real argument for staying on PostHog.

One thing to avoid either way: **do not store `guess_text` raw.** It is
free-text keyboard input, so it is an open channel for whatever a player types,
and it is not needed. Match each guess to a known track index at capture time
and store the index. The `revealed` bitmask above does this by construction.
