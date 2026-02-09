"use client";

import { useGameStore } from "@/lib/gameStore";
import { Music2, Trophy } from "lucide-react";
import SlotCard from "./SlotCard";
import OverflowList from "./OverflowList";
import GuessInput from "./GuessInput";

export default function GameBoard() {
  const {
    artistName,
    artistImage,
    topTen,
    revealedIndices,
    overflowSongs,
    totalGuesses,
  } = useGameStore();

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

      {/* Guess Input */}
      <GuessInput />

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
