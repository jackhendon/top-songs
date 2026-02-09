"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/gameStore";
import { trackGameAbandoned } from "@/lib/analytics";
import { Music2, Trophy, Flag, RotateCcw, ExternalLink } from "lucide-react";
import SlotCard from "./SlotCard";
import OverflowList from "./OverflowList";
import GuessInput from "./GuessInput";

interface GameBoardProps {
  onReset: () => void;
}

export default function GameBoard({ onReset }: GameBoardProps) {
  const {
    artistName,
    artistId,
    artistImage,
    topTen,
    revealedIndices,
    overflowSongs,
    totalGuesses,
    isGaveUp,
    giveUp,
  } = useGameStore();

  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

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

  const kworbUrl = `https://kworb.net/spotify/artist/${artistId}_songs.html`;

  return (
    <div className="space-y-3">
      {/* Now Playing Header - compact */}
      <div className="flex items-center gap-3 px-1">
        {artistImage && (
          <img
            src={artistImage}
            alt={artistName}
            className="w-10 h-10 rounded-full object-cover border-2 border-charcoal-700/15 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5 text-burnt-orange shrink-0" />
            <span className="text-xs uppercase tracking-wide text-charcoal-700/50 font-medium">
              Now Playing
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-charcoal-800 truncate">
            {artistName}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-mustard-500" />
            <span className="font-semibold text-sm text-charcoal-800">
              {revealedIndices.size}/10
            </span>
          </div>
          <span className="text-xs text-charcoal-700/50">
            {totalGuesses} {totalGuesses === 1 ? "guess" : "guesses"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden border border-charcoal-700/10">
        <div
          className="h-full bg-sage-500 transition-all duration-500 ease-out"
          style={{ width: `${(revealedIndices.size / 10) * 100}%` }}
        />
      </div>

      {/* Guess Input or Give Up state */}
      {isGaveUp ? (
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            onClick={onReset}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <a
            href={kworbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-charcoal-700/40 hover:text-charcoal-700/60 transition-colors"
          >
            View full stats on Kworb
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          <GuessInput />
          <div className="flex justify-end px-1">
            <button
              onClick={handleGiveUp}
              onBlur={() => setConfirmingGiveUp(false)}
              className="inline-flex items-center gap-1 text-xs text-charcoal-700/40 hover:text-charcoal-700/60 transition-colors cursor-pointer"
            >
              <Flag className="w-3 h-3" />
              {confirmingGiveUp ? "Are you sure?" : "Give up"}
            </button>
          </div>
        </div>
      )}

      {/* Top 10 Grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {topTen.map((song, index) => (
          <SlotCard
            key={index}
            rank={index + 1}
            song={song}
            isRevealed={revealedIndices.has(index)}
          />
        ))}
      </div>

      {/* Overflow/Honorable Mentions */}
      <OverflowList songs={overflowSongs} />
    </div>
  );
}
