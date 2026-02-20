"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHistoryStore } from "@/lib/historyStore";
import { trackProfileView, trackHistoryCleared } from "@/lib/analytics";
import Header from "@/components/Header";
import GameHistoryCard from "@/components/GameHistoryCard";
import { Play, Music2, Trash2 } from "lucide-react";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { history, clearHistory } = useHistoryStore();
  const [hydrated, setHydrated] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    setHydrated(true);
    trackProfileView({ gamesPlayed: history.length });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    trackHistoryCleared({ gamesCleared: history.length });
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
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {!hydrated ? null : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
              <Music2 className="w-8 h-8 text-text-faint" />
            </div>
            <h2 className="font-display text-xl font-bold text-text-primary mb-2">
              No games played yet
            </h2>
            <p className="text-sm text-text-muted mb-6 font-sans">
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
              <div className="card p-4 text-center">
                <div className="font-display text-2xl font-extrabold text-text-primary">
                  {history.length}
                </div>
                <div className="text-xs text-text-muted mt-0.5 font-sans">Games Played</div>
              </div>
              <div className="card p-4 text-center">
                <div className="font-display text-2xl font-extrabold text-sage-dark">
                  {winRate}%
                </div>
                <div className="text-xs text-text-muted mt-0.5 font-sans">Win Rate</div>
              </div>
              <div className="card p-4 text-center">
                <div className="font-display text-2xl font-extrabold text-text-primary">
                  {avgGuesses}
                </div>
                <div className="text-xs text-text-muted mt-0.5 font-sans">Avg Guesses</div>
              </div>
            </div>

            {/* Game History List */}
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-text-primary px-1">
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
                className="inline-flex items-center gap-1.5 text-xs text-text-faint hover:text-text-muted transition-colors cursor-pointer font-sans"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmingClear ? "Are you sure?" : "Clear History"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
