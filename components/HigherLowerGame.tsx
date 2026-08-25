"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, RotateCcw, Share2, X } from "lucide-react";
import type { HLTrack } from "@/lib/higherLower";
import { spotifyImage } from "@/lib/format";
import {
  trackHigherLowerEnd,
  trackHigherLowerStart,
  trackShare,
} from "@/lib/analytics";

type Status = "playing" | "revealed" | "over";

interface Props {
  mode: "daily" | "unlimited";
  chain: HLTrack[];
  /** Daily only: the shared puzzle number, which gives the share a referent. */
  puzzleNumber?: number;
  /** Daily only: UTC date key, used to lock the single attempt. */
  dayKey?: string;
}

interface StoredResult {
  streak: number;
  results: boolean[];
}

function formatStreams(streams: number): string {
  if (streams >= 1_000_000_000) {
    return `${(streams / 1_000_000_000).toFixed(2)} billion`;
  }
  return `${Math.round(streams / 1_000_000)} million`;
}

function resultGrid(results: boolean[]): string {
  return results.map((r) => (r ? "🟩" : "🟥")).join("");
}

export default function HigherLowerGame({
  mode,
  chain: initialChain,
  puzzleNumber,
  dayKey,
}: Props) {
  const [chain, setChain] = useState(initialChain);
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [status, setStatus] = useState<Status>("playing");
  const [lastGuessRight, setLastGuessRight] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Daily is one attempt. Anything already played is shown as a result rather
  // than replayed, or the score would mean nothing and the share would be
  // worthless. localStorage only, so it is trivially bypassed; that is fine for
  // a casual game and not worth a database to prevent.
  const storageKey = dayKey ? `topsongs-daily-${dayKey}` : null;
  const [restored, setRestored] = useState<StoredResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setReady(true);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: StoredResult = JSON.parse(raw);
        setRestored(parsed);
        setResults(parsed.results);
        setStreak(parsed.streak);
        setStatus("over");
      }
    } catch {
      // Storage unavailable. Let them play; the lock is a nicety.
    }
    setReady(true);
  }, [storageKey]);

  // Unlimited is handed an empty chain so its page can stay static; fetch the
  // opening run once on mount.
  useEffect(() => {
    if (mode !== "unlimited" || chain.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/higher-lower?length=25");
        if (!res.ok) return;
        const data: { chain: HLTrack[] } = await res.json();
        if (!cancelled) setChain(data.chain);
      } catch {
        // Leave the loading state up; reloading is the recovery.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && !restored) {
      trackHigherLowerStart({ mode, puzzleNumber });
    }
    // Only once, on the first playable render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const known = chain[index];
  const unknown = chain[index + 1];

  const finish = useCallback(
    (finalStreak: number, finalResults: boolean[]) => {
      setStatus("over");
      trackHigherLowerEnd({ mode, streak: finalStreak, puzzleNumber });
      if (storageKey) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ streak: finalStreak, results: finalResults }),
          );
        } catch {
          // Nothing to do; the result simply is not remembered.
        }
      }
    },
    [mode, puzzleNumber, storageKey],
  );

  const guess = (direction: "higher" | "lower") => {
    if (status !== "playing" || !unknown) return;

    const actuallyHigher = unknown.streams >= known.streams;
    const correct = direction === "higher" ? actuallyHigher : !actuallyHigher;

    const nextResults = [...results, correct];
    setResults(nextResults);
    setLastGuessRight(correct);
    setStatus("revealed");

    if (!correct) {
      // Let them see the number that beat them before the game-over card.
      window.setTimeout(() => finish(streak, nextResults), 1400);
      return;
    }

    const nextStreak = streak + 1;
    setStreak(nextStreak);

    window.setTimeout(() => {
      // Daily is a fixed-length run: surviving the whole chain is a win.
      if (mode === "daily" && index + 2 >= chain.length) {
        finish(nextStreak, nextResults);
        return;
      }

      // Top up well before running out. Fetching only at the last track meant a
      // slow request left the next card undefined, which silently stalled the
      // run: the buttons stayed live but did nothing.
      if (mode === "unlimited" && chain.length - (index + 1) <= 8) {
        void extendChain();
      }

      setIndex((i) => i + 1);
      setStatus("playing");
    }, 900);
  };

  const extendChain = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/higher-lower?length=25");
      if (res.ok) {
        const data: { chain: HLTrack[] } = await res.json();
        // Drop the new chain's opening track: the current one continues the run.
        setChain((c) => [...c, ...data.chain.slice(1)]);
      }
    } catch {
      // Out of chain; the run ends where it is.
    } finally {
      setLoadingMore(false);
    }
  };

  const shareText = useMemo(() => {
    const heading =
      mode === "daily"
        ? `Top Songs Daily #${puzzleNumber}`
        : "Top Songs: Higher or Lower";
    return `${heading}\nStreak: ${streak}\n${resultGrid(results)}\n\ntopsongs.io/${mode === "daily" ? "daily" : "higher-lower"}`;
  }, [mode, puzzleNumber, streak, results]);

  const handleShare = async () => {
    if (window.matchMedia("(pointer: coarse)").matches && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        trackShare(mode === "daily" ? "daily" : "higher-lower", "native");
      } catch {
        // Cancelled.
      }
      return;
    }
    await navigator.clipboard.writeText(shareText);
    trackShare(mode === "daily" ? "daily" : "higher-lower", "clipboard");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const playAgain = () => {
    window.location.reload();
  };

  // Covers both the opening fetch and a run that has outpaced its top-up.
  if (!ready || ((!known || !unknown) && status !== "over")) {
    return (
      <div className="card p-8 text-center space-y-2">
        <div className="h-6 w-32 mx-auto bg-bg-tertiary rounded animate-pulse" />
        <p className="text-xs text-text-faint font-sans">Loading tracks...</p>
      </div>
    );
  }

  // --- game over ---
  if (status === "over") {
    return (
      <div className="card p-6 sm:p-8 space-y-5 text-center">
        <div>
          <p className="text-sm text-text-muted font-sans">
            {restored
              ? `You already played Daily #${puzzleNumber}`
              : mode === "daily"
                ? `Daily #${puzzleNumber}`
                : "Run over"}
          </p>
          <p className="font-display text-5xl font-extrabold text-text-primary mt-1">
            {streak}
          </p>
          <p className="text-sm text-text-muted font-sans">
            {streak === 1 ? "correct call" : "correct calls in a row"}
          </p>
        </div>

        {results.length > 0 && (
          <p className="text-2xl tracking-widest break-all">
            {resultGrid(results)}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button onClick={handleShare} className="btn-primary text-sm">
            {copied ? (
              <span className="inline-flex items-center gap-2">
                <Check className="w-4 h-4" /> Copied
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share
              </span>
            )}
          </button>

          {mode === "unlimited" ? (
            <button onClick={playAgain} className="btn-secondary text-sm">
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Play again
              </span>
            </button>
          ) : (
            <Link href="/higher-lower" className="btn-secondary text-sm">
              Keep playing
            </Link>
          )}
        </div>

        {mode === "daily" && (
          <p className="text-xs text-text-faint font-sans">
            A new daily lands at midnight UTC. Until then,{" "}
            <Link
              href="/higher-lower"
              className="underline underline-offset-2 text-mustard dark:text-mint"
            >
              play unlimited
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  // --- playing ---
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs uppercase tracking-wide text-text-muted font-sans font-medium">
          {mode === "daily" ? `Daily #${puzzleNumber}` : "Unlimited"}
        </p>
        <p className="text-sm font-sans font-semibold text-text-primary tabular-nums">
          Streak {streak}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TrackCard track={known} revealed />
        <TrackCard
          track={unknown}
          revealed={status === "revealed"}
          outcome={status === "revealed" ? lastGuessRight : undefined}
        />
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={() => guess("higher")}
          disabled={status !== "playing"}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowUp className="w-4 h-4" />
          Higher
        </button>
        <button
          onClick={() => guess("lower")}
          disabled={status !== "playing"}
          className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowDown className="w-4 h-4" />
          Lower
        </button>
      </div>

      <p className="text-xs text-center text-text-faint font-sans">
        Does <span className="text-text-secondary">{unknown?.title}</span> have
        more or fewer Spotify streams than{" "}
        <span className="text-text-secondary">{known?.title}</span>?
      </p>
    </div>
  );
}

function TrackCard({
  track,
  revealed,
  outcome,
}: {
  track?: HLTrack;
  revealed: boolean;
  outcome?: boolean;
}) {
  if (!track) return <div className="card p-5 h-40" />;

  return (
    <div
      className="card p-5 flex flex-col items-center text-center gap-2 min-h-40"
      style={
        outcome === undefined
          ? undefined
          : {
              borderColor: outcome
                ? "var(--raw-sage-dark)"
                : "var(--raw-error-dark)",
            }
      }
    >
      {track.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={spotifyImage(track.imageUrl)}
          alt={track.artist}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
      )}
      <p className="font-display font-bold text-text-primary leading-tight">
        {track.title}
      </p>
      <p className="text-xs text-text-muted font-sans">{track.artist}</p>

      {revealed ? (
        <p className="mt-auto font-display text-lg font-extrabold text-mustard dark:text-mint tabular-nums">
          {formatStreams(track.streams)}
        </p>
      ) : (
        <p className="mt-auto text-2xl text-text-faint">?</p>
      )}

      {outcome !== undefined && (
        <span
          className={`text-xs font-sans font-semibold ${outcome ? "text-sage-dark" : "text-error-dark"}`}
        >
          {outcome ? (
            <span className="inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Correct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <X className="w-3 h-3" /> Wrong
            </span>
          )}
        </span>
      )}
    </div>
  );
}
