"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/gameStore";
import { ArtistData } from "@/lib/types";
import { trackArtistSearch, trackError } from "@/lib/analytics";
import { spotifyImage } from "@/lib/format";
import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";

import Link from "next/link";
import { Music2 } from "lucide-react";
import Footer from "@/components/Footer";

interface ArtistGameProps {
  artistName: string;
  artistId: string;
  artistImage?: string;
  slug: string;
  /**
   * Passed down from the server rather than looked up here: the related-artist
   * map is keyed off the 3MB snapshot, which must never reach the browser.
   * Twelve {slug, name} pairs is all that crosses the boundary.
   */
  relatedArtists?: { slug: string; name: string }[];
  children?: React.ReactNode;
}

export default function ArtistGame({
  artistName,
  artistId,
  artistImage,
  slug,
  relatedArtists,
  children,
}: ArtistGameProps) {
  const router = useRouter();
  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { resetGame } = useGameStore();

  // 40px slot, so ask Spotify for its 160px file rather than the 640px default.
  const artistImageUrl = spotifyImage(artistImage);

  const fetchAndStart = async () => {
    try {
      setLoading(true);
      setError(null);

      // artistId comes from the snapshot, so the game resolves the same artist
      // the page rendered rather than re-running an ambiguous name search.
      const query = artistId
        ? `name=${encodeURIComponent(artistName)}&id=${encodeURIComponent(artistId)}`
        : `name=${encodeURIComponent(artistName)}`;
      const response = await fetch(`/api/artist?${query}`);

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
        <Header logoHref="/" showNewArtist onReset={handleReset} asHeading={false} />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="card p-6 sm:p-8 text-center space-y-4">
            <p className="text-error-dark font-medium font-sans">{error}</p>
            <Link href="/" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
        </main>
        {children}
        <Footer />
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Header logoHref="/" asHeading={false} />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-3">
            {/* Artist header skeleton with real data from server */}
            <div className="flex items-center gap-3 px-1">
              {artistImage ? (
                <img
                  src={artistImageUrl}
                  alt={artistName}
                  width={40}
                  height={40}
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
                <p className="font-display text-lg font-bold text-text-primary truncate">
                  {artistName}
                </p>
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
        {children}
        <Footer />
      </div>
    );
  }

  // Game loaded
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist onReset={handleReset} asHeading={false} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <GameBoard
          onPlayAgain={handlePlayAgain}
          relatedArtists={relatedArtists}
        />
      </main>

      {children}
      <Footer />
    </div>
  );
}
