"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/gameStore";
import { ArtistData } from "@/lib/types";
import { trackArtistSearch, trackError } from "@/lib/analytics";
import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";
import VictoryScreen from "@/components/VictoryScreen";
import Link from "next/link";
import { Music2 } from "lucide-react";
import Footer from "@/components/Footer";

interface ArtistGameProps {
  artistName: string;
  artistId: string;
  artistImage?: string;
  slug: string;
  children?: React.ReactNode;
}

export default function ArtistGame({
  artistName,
  artistId,
  artistImage,
  slug,
  children,
}: ArtistGameProps) {
  const router = useRouter();
  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    artistName: gameArtist,
    revealedIndices,
    overflowSongs,
    totalGuesses,
    isGameWon,
    isGaveUp,
    resetGame,
  } = useGameStore();

  const isGameActive = gameArtist === artistName && totalGuesses >= 0 && !loading;

  const fetchAndStart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/artist?name=${encodeURIComponent(artistName)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch artist data");
      }

      const data: ArtistData = await response.json();
      const { startGame } = useGameStore.getState();

      startGame(
        data.artistName,
        data.artistId,
        data.imageUrl,
        data.songs,
        data.topTen,
      );

      trackArtistSearch(artistName, "seo-page");
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      trackError("seo_page_fetch", message, { artist_name: artistName });
      setError(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAndStart();
  }, [artistName]);

  const handleReset = () => {
    resetGame();
    router.push("/");
  };

  const handlePlayAgain = () => {
    fetchAndStart();
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Header logoHref="/" showNewArtist onReset={handleReset} />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="card p-6 sm:p-8 text-center space-y-4">
            <p className="text-error-dark font-medium font-sans">{error}</p>
            <Link href="/" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Header logoHref="/" />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-3">
            {/* Artist header skeleton with real data from server */}
            <div className="flex items-center gap-3 px-1">
              {artistImage ? (
                <img
                  src={artistImage}
                  alt={artistName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  style={{ border: '2px solid var(--raw-card-border)' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-bg-tertiary animate-pulse shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5 text-mustard dark:text-mint shrink-0" />
                  <span className="text-xs uppercase tracking-wide text-text-muted font-sans font-medium">
                    Now Playing
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-text-primary truncate">
                  {artistName}
                </h2>
              </div>
              <div className="text-right shrink-0">
                <div className="h-5 w-12 bg-bg-tertiary rounded animate-pulse" />
                <div className="h-3 w-16 bg-bg-tertiary rounded animate-pulse mt-1" />
              </div>
            </div>

            {/* Progress bar skeleton */}
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden" style={{ border: '1px solid var(--raw-card-border)' }} />

            {/* Guess input skeleton */}
            <div className="h-12 bg-bg-tertiary rounded-card animate-pulse" />

            {/* 10 slot card skeletons in 2-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="song-slot h-16 animate-pulse bg-bg-secondary"
                />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Game loaded
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist onReset={handleReset} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {isGameWon && !isGaveUp ? (
          <VictoryScreen
            artistName={gameArtist}
            totalGuesses={totalGuesses}
            overflowCount={overflowSongs.length}
            onPlayAgain={handlePlayAgain}
          />
        ) : (
          <GameBoard onReset={handleReset} onPlayAgain={handlePlayAgain} />
        )}
      </main>

      {children}
      <Footer />
    </div>
  );
}
