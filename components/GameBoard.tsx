"use client";

import { useGameStore } from "@/lib/gameStore";
import { Sparkles } from "lucide-react";
import SlotCard from "./SlotCard";

export default function GameBoard() {
  const { topTen, revealedIndices, overflowSongs } = useGameStore();

  return (
    <div className="space-y-4">
      {/* Top 10 Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Top 10 Songs</h3>
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
      {overflowSongs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              Honorable Mentions
            </h3>
            <p className="text-sm text-gray-400">
              Correct, but not in the top 10
            </p>
          </div>
          <div className="space-y-2">
            {overflowSongs.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-overflow-light border border-overflow/20 rounded-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {song.title}
                  </div>
                  <div className="text-sm text-overflow font-medium">
                    Rank #{song.rank}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 ml-3 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-overflow" />
                  {song.totalStreams.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
