"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/gameStore";
import { trackGameAbandoned, trackShare } from "@/lib/analytics";
import {
  Music2,
  Trophy,
  Flag,
  RotateCcw,
  ExternalLink,
  Share2,
  Check,
  Clock,
  Hash,
} from "lucide-react";
import SlotCard from "./SlotCard";
import OverflowList from "./OverflowList";
import GuessInput from "./GuessInput";

interface GameBoardProps {
  onReset: () => void;
  onPlayAgain: () => void;
}

export default function GameBoard({ onReset, onPlayAgain }: GameBoardProps) {
  const {
    artistName,
    artistId,
    artistImage,
    topTen,
    revealedIndices,
    guessedIndices,
    overflowSongs,
    totalGuesses,
    gameStartedAt,
    isGameWon,
    isGaveUp,
    giveUp,
  } = useGameStore();

  const score = guessedIndices.size;
  const gameOver = isGameWon || isGaveUp;

  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!gameStartedAt || gameOver) return;
    setElapsed(Math.floor((Date.now() - gameStartedAt) / 1000));
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - gameStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [gameStartedAt, gameOver]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      const state = useGameStore.getState();
      if (!state.isGameWon && !state.isGaveUp && state.totalGuesses > 0) {
        trackGameAbandoned({
          artistName: state.artistName,
          guessesUsed: state.totalGuesses,
          slotsRevealed: state.revealedIndices.size,
        });
      }
    };
  }, []);

  const handleGiveUp = () => {
    if (!confirmingGiveUp) {
      setConfirmingGiveUp(true);
      return;
    }
    giveUp();
    setConfirmingGiveUp(false);
  };

  const handleShare = async () => {
    const text = `I guessed ${score} of ${artistName}'s top 10 songs in ${totalGuesses} tries! 🎵\n\nThink you can beat me?\n\nPlay Top Songs at topsongs.io`;

    if (window.matchMedia("(pointer: coarse)").matches && navigator.share) {
      try {
        await navigator.share({ text });
        trackShare(artistName, "native");
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      trackShare(artistName, "clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const kworbUrl = `https://kworb.net/spotify/artist/${artistId}_songs.html`;

  return (
    <div className="space-y-3">
      {/* Now Playing Header - compact */}
      <div className="flex items-center gap-3 px-1">
        {artistImage && (
          <img
            src={artistImage}
            alt={artistName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ border: "2px solid var(--raw-card-border)" }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5 text-mustard dark:text-mint shrink-0" />
            <span className="text-xs uppercase tracking-wide text-text-muted font-sans font-medium">
              Now Playing
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-text-primary truncate">
            {artistName}
          </h2>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-mustard dark:text-mint" />
          <span className="font-sans font-semibold text-sm text-text-primary">
            {score}/10
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-text-muted" />
          <span className="font-sans text-sm text-text-muted">
            {totalGuesses} {totalGuesses === 1 ? "guess" : "guesses"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span className="font-sans text-sm text-text-muted tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>
        {!gameOver && (
          <button
            onClick={handleGiveUp}
            onBlur={() => setConfirmingGiveUp(false)}
            className="ml-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer font-sans"
          >
            <Flag className="w-3 h-3" />
            {confirmingGiveUp ? "Are you sure?" : "Give up"}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden border border-card-border">
        <div
          className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>

      {/* Guess Input or Give Up state */}
      {isGaveUp ? (
        <div className="space-y-2 px-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onPlayAgain}
              className="btn-primary inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Result
                </>
              )}
            </button>
          </div>
          <a
            href={kworbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-text-faint hover:text-text-muted transition-colors font-sans"
          >
            View full stats on Kworb
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <GuessInput />
      )}

      {/* Top 10 Grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {topTen.map((song, index) => (
          <SlotCard
            key={index}
            rank={index + 1}
            song={song}
            isRevealed={revealedIndices.has(index)}
            isGuessed={guessedIndices.has(index)}
          />
        ))}
      </div>

      {/* Overflow/Honorable Mentions */}
      <OverflowList songs={overflowSongs} />
    </div>
  );
}
