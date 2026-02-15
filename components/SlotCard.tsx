"use client";

import { Song } from "@/lib/types";
import { Lock, CheckCircle2, Eye } from "lucide-react";

interface SlotCardProps {
  rank: number;
  song: Song;
  isRevealed: boolean;
  isGuessed: boolean;
}

export default function SlotCard({ rank, song, isRevealed, isGuessed }: SlotCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden transition-all duration-300
        ${
          isRevealed
            ? isGuessed
              ? "song-slot song-slot--revealed animate-bounce-in"
              : "song-slot song-slot--missed animate-bounce-in"
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
                ? isGuessed
                  ? "bg-sage-dark text-white border-sage-dark"
                  : "bg-text-faint text-white border-text-faint"
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
                <span className={`font-sans font-semibold text-base truncate ${isGuessed ? "text-text-primary" : "text-text-muted"}`}>
                  {song.title}
                </span>
                {isGuessed ? (
                  <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-text-faint shrink-0" />
                )}
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
      {isRevealed && isGuessed && (
        <div className="absolute inset-0 bg-sage/30 animate-reveal-flash pointer-events-none" />
      )}
    </div>
  );
}
