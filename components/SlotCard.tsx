"use client";

import { Song } from "@/app/api/artist/route";
import { Lock, Sparkles } from "lucide-react";

interface SlotCardProps {
  rank: number;
  song: Song;
  isRevealed: boolean;
}

export default function SlotCard({ rank, song, isRevealed }: SlotCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        ${
          isRevealed
            ? "bg-correct-light border-correct animate-bounce-in"
            : "bg-gray-50 border-locked"
        }
      `}
    >
      <div className="flex items-center p-3 sm:p-4">
        {/* Rank Badge */}
        <div
          className={`
            flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base mr-3
            ${
              isRevealed
                ? "bg-correct text-white"
                : "bg-locked text-gray-400"
            }
          `}
        >
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isRevealed ? (
            <>
              <div className="font-bold text-base text-gray-900 truncate">
                {song.title}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                <span>{song.totalStreams.toLocaleString()} streams</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="font-medium text-sm">Not yet guessed</span>
            </div>
          )}
        </div>
      </div>

      {/* Reveal Flash Overlay */}
      {isRevealed && (
        <div className="absolute inset-0 bg-correct/30 animate-reveal-flash pointer-events-none" />
      )}
    </div>
  );
}
