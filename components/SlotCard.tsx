"use client";

import { useState } from "react";
import { Song } from "@/lib/types";
import { Lock, CheckCircle2, Eye, Lightbulb } from "lucide-react";

interface SlotCardProps {
  rank: number;
  song: Song;
  isRevealed: boolean;
  isGuessed: boolean;
  hintLevel: number;
  onRevealHint: () => void;
  gameOver: boolean;
}

function formatHintText(title: string): string {
  const firstChar = title.charAt(0);
  const rest = title.slice(1).replace(/[^\s]/g, "_");
  return firstChar + rest;
}

export default function SlotCard({
  rank,
  song,
  isRevealed,
  isGuessed,
  hintLevel,
  onRevealHint,
  gameOver,
}: SlotCardProps) {
  const [confirming, setConfirming] = useState(false);

  const handleHintClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onRevealHint();
    setConfirming(false);
  };

  const showHintButton = !gameOver && !isRevealed && hintLevel < 2;

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
          ) : hintLevel === 1 ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-base text-mustard dark:text-mint tracking-wide">
                {formatHintText(song.title)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-faint">
              <Lock className="w-4 h-4" />
              <span className="font-sans font-medium text-sm">Not yet guessed</span>
            </div>
          )}
        </div>

        {/* Hint Button */}
        {showHintButton && (
          <button
            onClick={handleHintClick}
            onBlur={() => setConfirming(false)}
            className="ml-2 inline-flex items-center gap-1 text-xs text-mustard dark:text-mint hover:text-mustard/80 dark:hover:text-mint/80 transition-colors cursor-pointer font-sans shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {confirming
              ? "Are you sure?"
              : hintLevel === 0
                ? "Reveal letter"
                : "Reveal title"}
          </button>
        )}
      </div>

      {/* Reveal Flash Overlay */}
      {isRevealed && isGuessed && (
        <div className="absolute inset-0 bg-sage/30 animate-reveal-flash pointer-events-none" />
      )}
    </div>
  );
}
