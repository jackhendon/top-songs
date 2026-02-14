"use client";

import { GameHistoryEntry } from "@/lib/historyStore";
import { Music2, Trophy, Flag } from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GameHistoryCard({ entry }: { entry: GameHistoryEntry }) {
  const isWon = entry.outcome === "won";

  return (
    <div className="card">
      <div className="flex items-center p-3 sm:p-4 gap-3">
        {entry.artistImage ? (
          <img
            src={entry.artistImage}
            alt={entry.artistName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ border: '2px solid var(--raw-card-border)' }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0" style={{ border: '2px solid var(--raw-card-border)' }}>
            <Music2 className="w-5 h-5 text-text-faint" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="font-sans font-semibold text-base text-text-primary truncate">
            {entry.artistName}
          </div>
          <div className="text-xs text-text-muted font-sans">
            {formatDate(entry.datePlayed)}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {isWon ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-sage-dark bg-sage/15 px-2 py-0.5 rounded-full font-sans">
              <Trophy className="w-3 h-3" />
              Won
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full font-sans">
              <Flag className="w-3 h-3" />
              Gave Up
            </span>
          )}
          <div className="flex items-center gap-2 text-xs text-text-muted font-sans">
            <span>{entry.slotsRevealed}/10</span>
            <span>&middot;</span>
            <span>{entry.totalGuesses} {entry.totalGuesses === 1 ? "guess" : "guesses"}</span>
            <span>&middot;</span>
            <span>{formatTime(entry.timeSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
