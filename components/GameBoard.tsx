"use client";

import { useState, useEffect } from "react";
import { useGameStore, getHintsUsed } from "@/lib/gameStore";
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
  Lightbulb,
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
    hintLevels,
    giveUp,
    revealHint,
  } = useGameStore();

  const score = guessedIndices.size;
  const hintsUsed = getHintsUsed(hintLevels);
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
    const row1 = Array.from({ length: 5 }, (_, i) => guessedIndices.has(i) ? "🟩" : "🟥").join("");
    const row2 = Array.from({ length: 5 }, (_, i) => guessedIndices.has(i + 5) ? "🟩" : "🟥").join("");
    const text = `TopSongs.io - ${artistName}\n${row1}\n${row2}\n🎉 Score: ${score}/10\n\nCan you beat me?\ntopsongs.io`;

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
        {hintsUsed > 0 && (
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-text-muted" />
            <span className="font-sans text-sm text-text-muted">
              {hintsUsed} {hintsUsed === 1 ? "hint" : "hints"}
            </span>
          </div>
        )}
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

      {/* Guess Input / Victory / Give Up state */}
      {gameOver ? (
        <div className="space-y-3">
          <div className="card p-5 text-center space-y-3 fade-in">
            <div className="flex justify-center">
              <div
                className={`w-14 h-14 rounded-full border-3 flex items-center justify-center ${
                  isGameWon && !isGaveUp
                    ? "bg-mustard/20 dark:bg-mint/20 border-mustard dark:border-mint"
                    : "bg-bg-tertiary border-card-border"
                }`}
              >
                {isGameWon && !isGaveUp ? (
                  <Trophy className="w-7 h-7 text-mustard dark:text-mint" />
                ) : (
                  <Flag className="w-7 h-7 text-text-muted" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold text-text-primary tracking-[-0.04em]">
                {isGameWon && !isGaveUp ? "Congratulations!" : "Nice try!"}
              </h3>
              <p className="text-sm text-text-muted font-sans mt-1">
                {isGameWon && !isGaveUp ? (
                  <>
                    You guessed all of{" "}
                    <span className="font-semibold text-mustard dark:text-mint">
                      {artistName}&apos;s
                    </span>{" "}
                    top 10 songs in {totalGuesses}{" "}
                    {totalGuesses === 1 ? "try" : "tries"}
                    {hintsUsed > 0 && (
                      <>
                        {" "}
                        with {hintsUsed} {hintsUsed === 1 ? "hint" : "hints"}
                      </>
                    )}
                    {elapsed > 0 && <> in {formatTime(elapsed)}</>}!
                  </>
                ) : (
                  <>
                    You got {score} of{" "}
                    <span className="font-semibold text-mustard dark:text-mint">
                      {artistName}&apos;s
                    </span>{" "}
                    top 10 songs in {totalGuesses}{" "}
                    {totalGuesses === 1 ? "guess" : "guesses"}
                    {hintsUsed > 0 && (
                      <>
                        {" "}
                        using {hintsUsed} {hintsUsed === 1 ? "hint" : "hints"}
                      </>
                    )}
                    {elapsed > 0 && <> in {formatTime(elapsed)}</>}.
                  </>
                )}
              </p>
            </div>

            {/* Results grid */}
            <div className="flex flex-col gap-1.5 pt-1">
              {[0, 5].map((offset) => (
                <div key={offset} className="flex gap-1.5 justify-center">
                  {Array.from({ length: 5 }, (_, i) => {
                    const idx = offset + i;
                    const guessed = guessedIndices.has(idx);
                    return (
                      <div
                        key={idx}
                        title={`#${idx + 1}`}
                        className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold font-sans transition-colors ${
                          guessed
                            ? "bg-sage-dark text-white"
                            : "bg-bg-tertiary text-text-faint border border-card-border"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={onPlayAgain}
                className="btn-primary inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer text-sm sm:text-base !px-4 !py-2 sm:!px-6 sm:!py-3 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer text-sm sm:text-base !px-4 !py-2 sm:!px-6 sm:!py-3 whitespace-nowrap"
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
            <p className="text-xs text-center text-text-muted font-sans">
              Think you&apos;re the biggest {artistName} fan of your friends?
              Share your results and find out!
            </p>
          </div>
        </div>
      ) : (
        <GuessInput />
      )}

      {/* Top 10 Grid - 2 columns on desktop, column-first ordering */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-5 md:[grid-auto-flow:column] gap-2">
        {topTen.map((song, index) => (
          <SlotCard
            key={index}
            rank={index + 1}
            song={song}
            isRevealed={revealedIndices.has(index)}
            isGuessed={guessedIndices.has(index)}
            hintLevel={hintLevels.get(index) ?? 0}
            onRevealHint={() => revealHint(index)}
            gameOver={gameOver}
          />
        ))}
      </div>

      {/* Overflow/Honorable Mentions */}
      <OverflowList songs={overflowSongs} />

      {/* Kworb stats link */}
      {gameOver && (
        <div className="flex justify-center">
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
      )}
    </div>
  );
}
