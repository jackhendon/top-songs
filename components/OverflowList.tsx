import { Star } from "lucide-react";
import { Song } from "@/lib/types";
import { pluralize } from "@/lib/format";

interface OverflowListProps {
  songs: Song[];
}

export default function OverflowList({ songs }: OverflowListProps) {
  if (songs.length === 0) return null;

  return (
    <div className="overflow-area space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-mustard dark:text-mint-secondary" />
        <h3 className="font-display text-xl font-bold text-text-primary">
          Honorable Mentions
        </h3>
        <span className="text-sm text-text-muted font-sans">
          ({songs.length} {pluralize(songs.length, "song")})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {songs.map((song, index) => (
          <div
            key={index}
            className="bg-bg-primary rounded-card p-3 transition-colors"
            style={{ border: "1px solid var(--raw-card-border)" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-mustard/20 dark:bg-mint-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold font-sans">{song.rank}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-sans font-medium text-text-primary text-sm truncate">
                  {song.title}
                </h4>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  {song.totalStreams.toLocaleString()} streams
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
