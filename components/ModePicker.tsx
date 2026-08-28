import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { puzzleNumber, todayKey } from "@/lib/higherLower";

/**
 * The other two games, offered on the homepage.
 *
 * Deliberately below the artist search rather than above it. The search is what
 * people arrive for and what ranks; a first-time visitor from Google does not
 * want a daily yet. Returning visitors reach the daily from the header link,
 * which is on every page.
 */
export default function ModePicker() {
  const today = todayKey();

  return (
    <section className="mt-8">
      <h2 className="font-display text-base font-bold text-text-secondary mb-3 px-2 tracking-[-0.02em]">
        More ways to play
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/daily"
          className="card p-5 flex items-start gap-3 hover:border-mustard dark:hover:border-mint transition-colors"
        >
          <span className="w-10 h-10 rounded-card bg-mustard/15 dark:bg-mint/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-mustard dark:text-mint" />
          </span>
          <span className="min-w-0">
            <span className="block font-display font-bold text-text-primary">
              Daily Challenge
            </span>
            <span className="block text-sm text-text-muted font-sans mt-0.5">
              Puzzle #{puzzleNumber(today)}. Same chain for everyone, one
              attempt. Higher or lower on Spotify streams.
            </span>
          </span>
        </Link>

        <Link
          href="/higher-lower"
          className="card p-5 flex items-start gap-3 hover:border-mustard dark:hover:border-mint transition-colors"
        >
          <span className="w-10 h-10 rounded-card bg-sage/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-sage-dark" />
          </span>
          <span className="min-w-0">
            <span className="block font-display font-bold text-text-primary">
              Higher or Lower
            </span>
            <span className="block text-sm text-text-muted font-sans mt-0.5">
              Does the next song have more streams? Keep going until you call
              one wrong. Unlimited.
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
