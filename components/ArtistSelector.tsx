"use client";

import { useState } from "react";
import { Search, Music2 } from "lucide-react";
import { ArtistData } from "@/lib/types";
import { trackArtistSearch, trackError } from "@/lib/analytics";

interface ArtistSelectorProps {
  onArtistSelected: (artistData: ArtistData) => void;
}

export default function ArtistSelector({
  onArtistSelected,
}: ArtistSelectorProps) {
  const [artistName, setArtistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularArtists = [
    "Taylor Swift",
    "Drake",
    "The Weeknd",
    "Bad Bunny",
    "Ed Sheeran",
    "Ariana Grande",
    "Post Malone",
    "Billie Eilish",
  ];

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
      onArtistSelected(data);
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
    <div className="song-slot p-6 sm:p-8 fade-in">
      <h2 className="font-display text-2xl font-bold text-charcoal-800 mb-6 text-center">
        Choose an Artist
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-700/40 w-5 h-5" />
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Search for an artist..."
              className="input-field w-full pl-10 text-base"
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
        <div className="mb-6 p-4 bg-burnt-orange/10 border-2 border-burnt-orange text-burnt-sienna rounded-card text-sm font-medium">
          {error}
        </div>
      )}

      {/* Popular Artists */}
      <div>
        <p className="text-sm text-charcoal-700/60 mb-3">
          Or try a popular artist:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {popularArtists.map((artist) => (
            <button
              key={artist}
              onClick={() => handleSearch(artist)}
              disabled={loading}
              className="song-slot flex items-center justify-center gap-1.5 px-4 py-3 hover:bg-cream-100 text-charcoal-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 min-h-[44px] cursor-pointer"
            >
              <Music2 className="w-3.5 h-3.5 text-burnt-orange opacity-60" />
              {artist}
            </button>
          ))}
        </div>
      </div>

      {/* How to Play */}
      <div
        className="mt-12 overflow-area fade-in"
        style={{ animationDelay: "300ms" }}
      >
        <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-3">
          How to Play
        </h3>
        <ul className="space-y-2 text-charcoal-700/80">
          <li className="flex gap-2">
            <span className="text-mustard-500 font-bold">1.</span>
            <span>Select an artist to begin</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard-500 font-bold">2.</span>
            <span>Type song titles to guess their top 10 tracks</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard-500 font-bold">3.</span>
            <span>Correct guesses reveal their ranking position</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard-500 font-bold">4.</span>
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
