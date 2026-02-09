"use client";

import { useGameStore } from "@/lib/gameStore";
import SlotCard from "./SlotCard";

export default function GameBoard() {
  const { topTen, revealedIndices, overflowSongs } = useGameStore();

  return (
    <div className="space-y-6">
      {/* Top 10 Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Top 10 Songs
        </h3>
        <div className="grid grid-cols-1 gap-3">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Honorable Mentions
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              (Correct, but not in top 10)
            </span>
          </h3>
          <div className="space-y-2">
            {overflowSongs.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {song.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Rank #{song.rank}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                  {song.totalStreams.toLocaleString()} streams
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
