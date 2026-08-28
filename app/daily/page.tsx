import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HigherLowerGame from "@/components/HigherLowerGame";
import GameSchema from "@/components/GameSchema";
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
    "One chain, one attempt, the same puzzle for everyone. Guess whether each song has more Spotify streams than the last, then share your streak.",
  alternates: { canonical: "/daily" },
};

const FAQ = [
  {
    question: "When does the daily challenge reset?",
    answer:
      "At midnight UTC. The puzzle number goes up by one and a new chain is generated from that date, so the change happens at the same moment everywhere rather than at your local midnight.",
  },
  {
    question: "Does everyone get the same puzzle?",
    answer:
      "Yes. The chain is generated from the date itself, so every player on a given day sees the same songs in the same order. That is what makes a shared streak worth comparing.",
  },
  {
    question: "Can I play more than once a day?",
    answer:
      "Not the daily. One attempt is what makes the score mean anything, so your result is saved in your browser and shown instead of the game if you come back. If you want to keep playing, the unlimited mode runs as long as you can.",
  },
  {
    question: "How long does it take?",
    answer:
      "Fifteen calls, usually under a minute. A perfect run is a streak of 15, though most people are wrong well before that.",
  },
];

export default function DailyPage() {
  const dayKey = todayKey();
  const chain = buildChain(dayKey, DAILY_LENGTH);
  const number = puzzleNumber(dayKey);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <GameSchema
        name="Top Songs Daily Challenge"
        description="A daily music challenge: guess whether each song has more Spotify streams than the last. Same puzzle for everyone, one attempt."
        path="/daily"
        faq={FAQ}
      />
      <Header logoHref="/" showNewArtist asHeading={false} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1">
            Daily Challenge
          </h1>
          <p className="text-sm text-text-muted font-sans">
            Puzzle #{number}. Same chain for everyone, one attempt. Higher or
            lower on Spotify streams.
          </p>
        </div>

        <HigherLowerGame
          mode="daily"
          chain={chain}
          puzzleNumber={number}
          dayKey={dayKey}
        />

        <section className="mt-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              One chain, one attempt
            </h2>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              Fifteen songs, each one either more or less played than the one
              before it. Call each correctly and your streak grows; get one
              wrong and the run ends there. Everyone playing today gets exactly
              the same fifteen songs in the same order, and nobody gets a second
              go, which is what makes comparing streaks worth doing at all.
            </p>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              It is harder than it looks. The songs are all enormous, so you are
              never choosing between a hit and an obscurity. You are choosing
              between two tracks you know, and being asked which of them the
              world played more, which is not the one that felt bigger at the
              time nearly as often as you would expect.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Where the numbers come from
            </h2>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              Stream figures come from Kworb.net and are refreshed weekly.
              Nothing is adjusted here to make a round closer or fairer. When a
              pair feels wrong, it is usually because streaming does not reward
              the songs you would expect: chart position, radio play and
              cultural memory all pull in different directions.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Frequently asked questions
            </h2>
            <dl className="space-y-4">
              {FAQ.map((entry) => (
                <div key={entry.question} className="space-y-1">
                  <dt className="text-sm font-sans font-semibold text-text-primary">
                    {entry.question}
                  </dt>
                  <dd className="text-sm text-text-secondary font-sans leading-relaxed">
                    {entry.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-sm text-text-muted font-sans">
            Already played today?{" "}
            <Link
              href="/higher-lower"
              className="underline underline-offset-2 text-mustard dark:text-mint"
            >
              Play unlimited
            </Link>{" "}
            with no cap on the streak, or{" "}
            <Link
              href="/directory"
              className="underline underline-offset-2 text-mustard dark:text-mint"
            >
              guess an artist&apos;s top 10
            </Link>{" "}
            from nearly 3,000 artists.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
