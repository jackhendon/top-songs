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
        relative overflow-hidden transition-all duration-300
        ${
          isRevealed
            ? "song-slot song-slot--revealed animate-bounce-in"
            : "song-slot"
        }
      `}
    >
      <div className="flex items-center p-3 sm:p-4">
        {/* Rank Badge */}
        <div
          className={`
            rank-badge w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base mr-3
            ${
              isRevealed
                ? "bg-sage-600 border-sage-600 text-white"
                : ""
            }
          `}
        >
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isRevealed ? (
            <>
              <div className="font-semibold text-base text-charcoal-800 truncate">
                {song.title}
              </div>
              <div className="flex items-center gap-1 text-sm text-charcoal-700/60">
                <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
                <span>{song.totalStreams.toLocaleString()} streams</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-charcoal-700/40">
              <Lock className="w-4 h-4" />
              <span className="font-medium text-sm">Not yet guessed</span>
            </div>
          )}
        </div>
      </div>

      {/* Reveal Flash Overlay */}
      {isRevealed && (
        <div className="absolute inset-0 bg-sage-500/30 animate-reveal-flash pointer-events-none" />
      )}
    </div>
  );
}
