import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HigherLowerGame from "@/components/HigherLowerGame";
import GameSchema from "@/components/GameSchema";
import { getPool } from "@/lib/higherLower";

// Fully static. The chain is fetched client-side from /api/higher-lower,
// because seeding it here would mean either an impure Date.now() in render or
// a cached page serving every visitor the same "random" run.

export const metadata: Metadata = {
  title: "Higher or Lower: Spotify Streams | Top Songs",
  description:
    "Does this song have more Spotify streams than the last? Build a streak across 949 of the most-played tracks ever. Free, unlimited, no sign-up.",
  alternates: { canonical: "/higher-lower" },
};

const FAQ = [
  {
    question: "How are the stream counts worked out?",
    answer:
      "Every figure is a track's total all-time play count on Spotify, taken from Kworb.net, which aggregates public Spotify chart data. Nothing is estimated or rounded for difficulty: if a track shows 1.2 billion plays, that is the number Kworb reports.",
  },
  {
    question: "How often do the numbers change?",
    answer:
      "The catalogue is re-crawled weekly. Streams only ever go up, so a pair that was close last week may not be close this week, and the same two tracks can swap places over time.",
  },
  {
    question: "Which songs can come up?",
    answer:
      "Tracks with at least 500 million plays, by artists with at least 20 million Spotify followers. That is 949 tracks from 110 artists. The floor exists because comparing two songs you have never heard of is a coin flip rather than a question.",
  },
  {
    question: "What counts as a good streak?",
    answer:
      "Pairs are chosen so the two tracks are always between 1.2 and 3 times apart, which rules out both obvious blowouts and near-ties. Guessing at random gets you about one in two, so a streak of 10 means beating chance roughly a thousand times over.",
  },
];

export default function HigherLowerPage() {
  const poolSize = getPool().length;

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <GameSchema
        name="Higher or Lower: Spotify Streams"
        description="Guess whether each song has more or fewer Spotify streams than the last, and build a streak."
        path="/higher-lower"
        faq={FAQ}
      />
      <Header logoHref="/" showNewArtist asHeading={false} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1">
            Higher or Lower
          </h1>
          <p className="text-sm text-text-muted font-sans">
            Does the next song have more or fewer Spotify streams? Keep going
            until you call one wrong.
          </p>
        </div>

        <HigherLowerGame mode="unlimited" chain={[]} />

        <section className="mt-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              No song titles to remember
            </h2>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              The artist quiz asks you to recall a specific artist&apos;s ten
              biggest tracks, which you either can or cannot do. This asks
              something easier and stranger: not what a song is called, but how
              many people have played it. You are not being tested on memory,
              you are being asked to guess at scale, and almost nobody has good
              intuition for the difference between 600 million plays and 1.4
              billion.
            </p>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              The surprises are the point. A song that defined a summer can sit
              below an album track nobody talks about, because playlists and
              streaming habits do not care what was culturally significant.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              How the pairs are chosen
            </h2>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              The pool is {poolSize.toLocaleString("en-GB")} tracks, every one
              with at least 500 million Spotify plays, drawn from artists with
              20 million or more followers. Between them they have been played
              over 1.4 trillion times.
            </p>
            <p className="text-sm text-text-secondary font-sans leading-relaxed">
              Consecutive tracks are always between 1.2 and 3 times apart. Wider
              than that and the answer is obvious; closer and it is a toss-up
              rather than a judgement. The same artist never appears twice in a
              row either, since ranking two songs within one discography is a
              different and easier question.
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
            Playing for a score?{" "}
            <Link
              href="/daily"
              className="underline underline-offset-2 text-mustard dark:text-mint"
            >
              Try today&apos;s daily challenge
            </Link>
            , where everyone gets the same chain and one attempt. Or{" "}
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
