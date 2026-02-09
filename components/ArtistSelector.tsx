"use client";

import { useState } from "react";
import { Search, Music2 } from "lucide-react";
import { ArtistData } from "@/app/api/artist/route";

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
      onArtistSelected(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(artistName);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Choose an Artist
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Search for an artist..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-colors text-base"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !artistName.trim()}
            className="px-6 py-3 bg-gradient-brand text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-brand active:scale-95"
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
        <div className="mb-6 p-4 bg-error-light border border-error/20 text-error rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Popular Artists */}
      <div>
        <p className="text-sm text-gray-500 mb-3">Or try a popular artist:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {popularArtists.map((artist) => (
            <button
              key={artist}
              onClick={() => handleSearch(artist)}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-gray-50 hover:bg-brand-purple/5 hover:text-brand-purple border border-gray-100 hover:border-brand-purple/20 text-gray-700 text-sm font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-h-[44px]"
            >
              <Music2 className="w-3.5 h-3.5 opacity-50" />
              {artist}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
