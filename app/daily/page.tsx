import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HigherLowerGame from "@/components/HigherLowerGame";
import { buildChain, puzzleNumber, todayKey } from "@/lib/higherLower";

// A new puzzle each UTC day. Everyone gets the same chain, which is the whole
// point: a streak is only worth sharing if the person you send it to played the
// identical thing.
//
// Short window because the date is baked in at generation time: an hourly one
// would leave the previous day's puzzle up for up to an hour past midnight UTC.
export const revalidate = 60;

const DAILY_LENGTH = 15;

export const metadata: Metadata = {
  title: "Daily Music Challenge | Top Songs",
  description:
    "One chain, one attempt, same puzzle for everyone. Guess whether each song has more or fewer Spotify streams than the last, and share your streak.",
  alternates: { canonical: "/daily" },
};

export default function DailyPage() {
  const dayKey = todayKey();
  const chain = buildChain(dayKey, DAILY_LENGTH);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist asHeading={false} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1">
            Daily Challenge
          </h1>
          <p className="text-sm text-text-muted font-sans">
            Puzzle #{puzzleNumber(dayKey)}. Same chain for everyone, one attempt.
            Higher or lower on Spotify streams.
          </p>
        </div>

        <HigherLowerGame
          mode="daily"
          chain={chain}
          puzzleNumber={puzzleNumber(dayKey)}
          dayKey={dayKey}
        />

        <p className="mt-6 text-sm text-text-muted font-sans text-center">
          Want more?{" "}
          <Link
            href="/higher-lower"
            className="underline underline-offset-2 text-mustard dark:text-mint"
          >
            Play unlimited
          </Link>{" "}
          or{" "}
          <Link
            href="/directory"
            className="underline underline-offset-2 text-mustard dark:text-mint"
          >
            guess an artist&apos;s top 10
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
