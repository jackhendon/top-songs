"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHistoryStore } from "@/lib/historyStore";
import Header from "@/components/Header";
import GameHistoryCard from "@/components/GameHistoryCard";
import { Play, Music2, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { history, clearHistory } = useHistoryStore();
  const [hydrated, setHydrated] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearHistory();
    setConfirmingClear(false);
  };

  const wins = history.filter((g) => g.outcome === "won");
  const winRate = history.length > 0 ? Math.round((wins.length / history.length) * 100) : 0;
  const avgGuesses =
    wins.length > 0
      ? Math.round(wins.reduce((sum, g) => sum + g.totalGuesses, 0) / wins.length)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header
        logoHref="/"
        rightContent={
          <Link href="/" className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Play className="w-4 h-4" />
            Play
          </Link>
        }
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {!hydrated ? null : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
              <Music2 className="w-8 h-8 text-charcoal-700/30" />
            </div>
            <h2 className="font-display text-xl font-bold text-charcoal-800 mb-2">
              No games played yet
            </h2>
            <p className="text-sm text-charcoal-700/60 mb-6">
              Play a game to see your history here.
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Playing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Aggregate Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="song-slot p-4 text-center">
                <div className="font-display text-2xl font-bold text-charcoal-800">
                  {history.length}
                </div>
                <div className="text-xs text-charcoal-700/50 mt-0.5">Games Played</div>
              </div>
              <div className="song-slot p-4 text-center">
                <div className="font-display text-2xl font-bold text-sage-700">
                  {winRate}%
                </div>
                <div className="text-xs text-charcoal-700/50 mt-0.5">Win Rate</div>
              </div>
              <div className="song-slot p-4 text-center">
                <div className="font-display text-2xl font-bold text-charcoal-800">
                  {avgGuesses}
                </div>
                <div className="text-xs text-charcoal-700/50 mt-0.5">Avg Guesses</div>
              </div>
            </div>

            {/* Game History List */}
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-charcoal-800 px-1">
                Game History
              </h2>
              {history.map((entry) => (
                <GameHistoryCard key={entry.id} entry={entry} />
              ))}
            </div>

            {/* Clear History */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleClear}
                onBlur={() => setConfirmingClear(false)}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-700/40 hover:text-charcoal-700/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmingClear ? "Are you sure?" : "Clear History"}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 border-t-2 border-charcoal-700/10">
        <div className="container mx-auto px-4 text-center text-sm text-charcoal-700/60">
          <p>Data sourced from Kworb.net &middot; Made with &#9835; for music lovers</p>
        </div>
      </footer>
    </div>
  );
}
