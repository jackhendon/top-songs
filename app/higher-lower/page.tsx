import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HigherLowerGame from "@/components/HigherLowerGame";
// Fully static. The chain is fetched client-side from /api/higher-lower,
// because seeding it here would mean either an impure Date.now() in render or
// a cached page serving every visitor the same "random" run.

export const metadata: Metadata = {
  title: "Higher or Lower: Spotify Streams | Top Songs",
  description:
    "Does this song have more Spotify streams than the last one? Keep guessing to build a streak. Free, unlimited, no sign-up.",
  alternates: { canonical: "/higher-lower" },
};

export default function HigherLowerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
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

        <p className="mt-6 text-sm text-text-muted font-sans text-center">
          Playing for a score?{" "}
          <Link
            href="/daily"
            className="underline underline-offset-2 text-mustard dark:text-mint"
          >
            Try today&apos;s daily challenge
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
