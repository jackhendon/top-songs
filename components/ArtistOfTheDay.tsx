"use client";

import Link from "next/link";
import { Music2 } from "lucide-react";

interface ArtistOfTheDayProps {
  slug: string;
  name: string;
  imageUrl?: string;
  bio: string;
}

export default function ArtistOfTheDay({ slug, name, imageUrl, bio }: ArtistOfTheDayProps) {
  return (
    <div className="mb-6">
      <p className="text-sm text-text-muted mb-3 font-sans font-medium">
        Artist of the Day
      </p>
      <div className="card bg-card-surface p-4">
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-16 h-16 rounded-full object-cover shrink-0"
              style={{ border: "2px solid var(--raw-card-border)" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0"
              style={{ border: "2px solid var(--raw-card-border)" }}
            >
              <Music2 className="w-7 h-7 text-text-faint" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-display text-lg font-bold text-text-primary tracking-[-0.02em]">
              {name}
            </div>
            <p className="text-sm text-text-muted font-sans leading-snug mt-0.5">
              {bio}
            </p>
          </div>

          <Link
            href={`/artist/${slug}`}
            className="btn btn-primary shrink-0 text-sm"
          >
            Play Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
