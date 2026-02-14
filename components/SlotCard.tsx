"use client";

import { Song } from "@/lib/types";
import { Lock, CheckCircle2 } from "lucide-react";

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
                ? "bg-sage-dark text-white border-sage-dark"
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
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-semibold text-base text-text-primary truncate">
                  {song.title}
                </span>
                <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-sm text-text-muted font-sans">
                <span>{song.totalStreams.toLocaleString()} streams</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-text-faint">
              <Lock className="w-4 h-4" />
              <span className="font-sans font-medium text-sm">Not yet guessed</span>
            </div>
          )}
        </div>
      </div>

      {/* Reveal Flash Overlay */}
      {isRevealed && (
        <div className="absolute inset-0 bg-sage/30 animate-reveal-flash pointer-events-none" />
      )}
    </div>
  );
}
