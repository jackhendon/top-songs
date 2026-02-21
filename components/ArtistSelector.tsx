"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music2 } from "lucide-react";
import {
  POPULAR_ARTISTS,
  artistNameToSlug,
  slugToArtistName,
} from "@/lib/slugs";
import { trackArtistSearch, trackError } from "@/lib/analytics";
import ArtistAutocomplete from "./ArtistAutocomplete";
import ArtistOfTheDay from "./ArtistOfTheDay";

interface DailyArtist {
  slug: string;
  name: string;
  imageUrl?: string;
  bio: string;
}

export default function ArtistSelector({ dailyArtist }: { dailyArtist: DailyArtist }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularArtists = Object.entries(POPULAR_ARTISTS)
    .filter(([slug]) => slug !== dailyArtist.slug)
    .slice(0, 8)
    .map(([, name]) => name);

  const handleArtistSelect = (slug: string) => {
    setLoading(true);
    setError(null);
    const artistName = slugToArtistName(slug);
    trackArtistSearch(artistName, "autocomplete");
    router.push(`/artist/${slug}`);
  };

  const handleFreeformSearch = async (name: string) => {
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

      const data = await response.json();
      trackArtistSearch(data.artistName, "search");

      const slug = artistNameToSlug(data.artistName);
      router.push(`/artist/${slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      trackError("artist_search", message, { artist_name: name });
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="card bg-card-surface p-6 sm:p-8 fade-in">
      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-6 text-center tracking-[-0.04em]">
        Choose a musician or group
      </h2>

      {/* Artist Autocomplete */}
      <div className="mb-6">
        <ArtistAutocomplete
          onSelect={handleArtistSelect}
          onSubmit={handleFreeformSearch}
          disabled={loading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border-2 border-error text-error-dark rounded-card text-sm font-medium font-sans">
          {error}
        </div>
      )}

      {/* How to Play */}
      <div
        className="mt-6 overflow-area fade-in"
        style={{ animationDelay: "300ms" }}
      >
        <h3 className="font-display text-lg font-bold text-text-primary mb-3">
          How to play
        </h3>
        <ul className="space-y-2 text-text-muted font-sans">
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">1.</span>
            <span>Pick an artist, then guess their top 10 most-streamed songs.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">2.</span>
            <span>Each correct guess reveals its chart position and stream count.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-mustard dark:text-mint font-bold">3.</span>
            <span>Songs outside the top 10 land in Honorable Mentions.</span>
          </li>
        </ul>
      </div>

      {/* Artist of the Day */}
      <div className="mt-6">
        <ArtistOfTheDay {...dailyArtist} />
      </div>

      {/* Popular Artists */}
      <div className="mt-2">
        <p className="text-sm text-text-muted mb-3 font-sans font-medium">
          Popular Artists
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {popularArtists.map((artist) => (
            <Link
              key={artist}
              href={`/artist/${artistNameToSlug(artist)}`}
              className="artist-card text-sm"
            >
              <Music2 className="w-3.5 h-3.5 text-mustard dark:text-mint opacity-60" />
              {artist}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
