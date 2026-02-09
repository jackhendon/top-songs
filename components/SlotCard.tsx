"use client";

import { Song } from "@/app/api/artist/route";
import { Lock } from "lucide-react";

interface SlotCardProps {
  rank: number;
  song: Song;
  isRevealed: boolean;
}

export default function SlotCard({ rank, song, isRevealed }: SlotCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all duration-500
        ${
          isRevealed
            ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600"
            : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
        }
      `}
    >
      <div className="flex items-center p-4">
        {/* Rank */}
        <div
          className={`
            flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg mr-4
            ${
              isRevealed
                ? "bg-green-500 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
            }
          `}
        >
          #{rank}
        </div>

        {/* Content */}
        <div className="flex-1">
          {isRevealed ? (
            <>
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                {song.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {song.totalStreams.toLocaleString()} streams
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="font-medium">Not yet guessed</span>
            </div>
          )}
        </div>
      </div>

      {/* Reveal Animation */}
      {isRevealed && (
        <div className="absolute inset-0 bg-green-500 animate-reveal-flash pointer-events-none" />
      )}
    </div>
  );
}
