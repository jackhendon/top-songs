"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Music2 } from "lucide-react";
import { ArtistData } from "@/lib/types";
import { POPULAR_ARTISTS, artistNameToSlug } from "@/lib/slugs";
import { trackArtistSearch, trackError } from "@/lib/analytics";

interface ArtistSelectorProps {
  onArtistSelected: (artistData: ArtistData) => void;
}

export default function ArtistSelector({
  onArtistSelected,
}: ArtistSelectorProps) {
  const router = useRouter();
  const [artistName, setArtistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularArtists = Object.values(POPULAR_ARTISTS).slice(0, 8);

  const handleSearch = async (name: string) => {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/artist?name=${encodeURIComponent(name)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch artist");
      }

      const data: ArtistData = await response.json();
      trackArtistSearch(data.artistName, "search");

      // Navigate to the artist's page instead of loading inline
      const slug = artistNameToSlug(data.artistName);
      router.push(`/${slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      trackError("artist_search", message, { artist_name: name });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(artistName);
  };

  return (
    <div className="card bg-card-surface p-6 sm:p-8 fade-in">
      <h2 className="font-display text-2xl font-extrabold text-text-primary mb-6 text-center tracking-[-0.04em]">
        Choose an Artist
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Search for an artist..."
              className="input-field w-full pl-10 sm:pl-11 text-sm sm:text-base"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !artistName.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
                Loading
              </span>
            ) : (
              "Play"
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border-2 border-error text-error-dark rounded-card text-sm font-medium font-sans">
          {error}
        </div>
      )}

      {/* Popular Artists */}
      <div>
        <p className="text-sm text-text-muted mb-3 font-sans font-medium">
          Or try a popular artist:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {popularArtists.map((artist) => (
            <Link
              key={artist}
              href={`/${artistNameToSlug(artist)}`}
              className="artist-card text-sm"
            >
              <Music2 className="w-3.5 h-3.5 text-mustard dark:text-mint opacity-60" />
              {artist}
            </Link>
          ))}
        </div>
      </div>

      {/* How to Play */}
      <div
        className="mt-12 overflow-area fade-in"
        style={{ animationDelay: "300ms" }}
      >
        <h3 className="font-display text-lg font-bold text-text-primary mb-3">
          How to Play
        </h3>
        <ul className="space-y-2 text-text-muted font-sans">
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">1.</span>
            <span>Select an artist to begin</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">2.</span>
            <span>Type song titles to guess their top 10 tracks</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">3.</span>
            <span>Correct guesses reveal their ranking position</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">4.</span>
            <span>
              Songs outside the top 10 appear in &ldquo;Honorable
              Mentions&rdquo;
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
