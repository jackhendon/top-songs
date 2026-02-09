"use client";

import { useGameStore } from "@/lib/gameStore";
import { Music2, Trophy } from "lucide-react";
import SlotCard from "./SlotCard";
import OverflowList from "./OverflowList";

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
    <div className="space-y-4">
      {/* Now Playing Header */}
      <div className="song-slot p-4 sm:p-6">
        <div className="text-center pb-6 border-b-2 border-charcoal-700/15">
          {artistImage && (
            <img
              src={artistImage}
              alt={artistName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-charcoal-700/15 mx-auto mb-3"
            />
          )}
          <div className="inline-flex items-center gap-2 mb-2">
            <Music2 className="w-5 h-5 text-burnt-orange" />
            <span className="text-sm uppercase tracking-wide text-charcoal-700/60 font-medium">
              Now Playing
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800">
            {artistName}
          </h2>
          <p className="text-charcoal-700/70 mt-2">
            Guess the top 10 most-streamed songs
          </p>
        </div>

        {/* Progress Section */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-mustard-500" />
              <span className="font-medium text-charcoal-800">
                {revealedIndices.size} / 10 found
              </span>
            </div>
            <span className="text-sm text-charcoal-700/60">
              {totalGuesses} {totalGuesses === 1 ? "guess" : "guesses"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-cream-200 rounded-full overflow-hidden border-2 border-charcoal-700/10">
            <div
              className="h-full bg-sage-500 transition-all duration-500 ease-out"
              style={{ width: `${(revealedIndices.size / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 10 Grid */}
      <div className="song-slot p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold text-charcoal-800 mb-3">
          Top 10 Songs
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {topTen.map((song, index) => (
            <SlotCard
              key={index}
              rank={index + 1}
              song={song}
              isRevealed={revealedIndices.has(index)}
            />
          ))}
        </div>
      </div>

      {/* Overflow/Honorable Mentions */}
      <OverflowList songs={overflowSongs} />
    </div>
  );
}
