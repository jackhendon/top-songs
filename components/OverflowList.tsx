import { Star } from "lucide-react";
import { Song } from "@/lib/types";

interface OverflowListProps {
  songs: Song[];
}

export default function OverflowList({ songs }: OverflowListProps) {
  if (songs.length === 0) return null;

  return (
    <div className="overflow-area space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-mustard-500" />
        <h3 className="font-display text-xl font-semibold text-charcoal-800">
          Honorable Mentions
        </h3>
        <span className="text-sm text-charcoal-700/60">
          ({songs.length} {songs.length === 1 ? "song" : "songs"})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {songs.map((song, index) => (
          <div
            key={index}
            className="bg-white border-2 border-mustard-500/20 rounded-card p-3 hover:border-mustard-500/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-mustard-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-mustard-600">
                  {song.rank}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-charcoal-800 text-sm truncate">
                  {song.title}
                </h4>
                <p className="text-xs text-charcoal-700/60 mt-0.5">
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
