import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Beer } from "lucide-react";
import { faqPageSchema, toJsonLd } from "@/lib/jsonLd";

export const metadata = {
  title: "FAQ & About - Top Songs",
  description:
    "How the three Top Songs games work, where the Spotify streaming figures come from, and who built it.",
  alternates: { canonical: "/faq" },
};

// Only the questions rendered below, since FAQPage requires visible answers.
const FAQ_SCHEMA = [
  {
    question: "What games are there on Top Songs?",
    answer:
      "Three, all built on the same Spotify streaming figures. Guess the top 10 asks you to name an artist's ten most-streamed songs from a directory of nearly 3,000 artists. Higher or Lower shows you two songs and asks which has more plays. The Daily Challenge is fifteen songs, one attempt, and the same chain for everyone that day, resetting at midnight UTC.",
  },
  {
    question: "Where do the streaming numbers come from?",
    answer:
      "All streaming figures are sourced from Kworb.net, which aggregates publicly available Spotify data. Spotify does not make exact counts easily available, so these are a close approximation rather than guaranteed exact, and they are updated regularly rather than in real time.",
  },
  {
    question: "Is Top Songs affiliated with Spotify?",
    answer:
      "No. Top Songs is an independent fan project. All artist names, images and trademarks belong to their respective owners.",
  },
  {
    question: "Is my data stored anywhere?",
    answer:
      "Your game history and preferences are saved in your browser's localStorage and never leave your device. Analytics are privacy-friendly and cookieless.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLd(faqPageSchema(FAQ_SCHEMA)),
        }}
      />
      <Header logoHref="/" showNewArtist asHeading={false} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-6">
          FAQ &amp; About
        </h1>

        <div className="space-y-8 text-sm text-text-secondary font-sans leading-relaxed">
          {/* How to Play */}
          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              What games are there on Top Songs?
            </h2>
            <p>
              Three, all built on the same Spotify streaming figures.
            </p>
            <p className="mt-3">
              <strong className="text-text-primary">Guess the top 10.</strong>{" "}
              Pick any artist and try to name their 10 most-streamed songs on
              Spotify. Type a song title into the search box and, if it&apos;s
              in the top 10, it slots into the correct rank. There&apos;s no
              limit on guesses, but the game tracks how many you use, so the
              fewer it takes, the better your score. There are nearly 3,000
              artists in the{" "}
              <Link
                href="/directory"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                directory
              </Link>
              .
            </p>
            <p className="mt-3">
              <strong className="text-text-primary">
                <Link
                  href="/higher-lower"
                  className="text-mustard dark:text-mint underline underline-offset-2"
                >
                  Higher or Lower
                </Link>
                .
              </strong>{" "}
              You&apos;re shown two songs and asked which has more Spotify
              plays. Get it right and it keeps going. This one needs no recall
              at all, so it&apos;s the one to try if an artist comes up whose
              back catalogue you don&apos;t know.
            </p>
            <p className="mt-3">
              <strong className="text-text-primary">
                <Link
                  href="/daily"
                  className="text-mustard dark:text-mint underline underline-offset-2"
                >
                  The Daily Challenge
                </Link>
                .
              </strong>{" "}
              The same idea, but fifteen songs, one attempt, and everybody
              playing that day gets the identical chain. It resets at midnight
              UTC. Your streak is shareable precisely because whoever you send
              it to played exactly the same puzzle.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Where do the streaming numbers come from?
            </h2>
            <p>
              All streaming figures are sourced from{" "}
              <a
                href="https://kworb.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                Kworb.net
              </a>
              , which aggregates publicly available Spotify data. You can read
              more about how these figures are calculated in{" "}
              <a
                href="https://kworb.net/faq.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                Kworb&apos;s FAQ
              </a>
              .
            </p>
            <p className="mt-2">
              Spotify does not make exact streaming counts easily publicly
              available, so while these figures are a close approximation, there
              is no guarantee of exact accuracy. Numbers are updated regularly
              but may not reflect the very latest counts in real time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Is Top Songs affiliated with Spotify?
            </h2>
            <p>
              No. Top Songs is an independent fan project. All artist names,
              images, and trademarks belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Is my data stored anywhere?
            </h2>
            <p>
              Your game history and preferences are saved in your browser&apos;s
              localStorage and never leave your device. We use privacy-friendly,
              cookieless analytics. See the{" "}
              <Link
                href="/privacy"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                privacy policy
              </Link>{" "}
              for full details.
            </p>
          </section>

          {/* About */}
          <div
            className="my-2"
            style={{ borderTop: "1px solid var(--raw-card-border)" }}
          />

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Who made this?
            </h2>
            <p>
              Hi! I&apos;m a developer based in London. The idea for Top Songs
              started organically. My friends and I would sit in pubs
              arguing over which tracks had the most streams, checking our
              answers on{" "}
              <a
                href="https://kworb.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                Kworb.net
              </a>
              . It was always a good time, so I decided to build it into a
              proper game.
            </p>
            <p className="mt-2">
              This is a passion project, not a commercial product. I built it
              because I genuinely enjoy playing it, and I hope you do too.
            </p>
          </section>

          {/* Support */}
          <section className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-mustard/15 dark:bg-mint/15 flex items-center justify-center shrink-0 mt-0.5">
                <Beer className="w-5 h-5 text-mustard dark:text-mint" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary mb-1">
                  Support the dev
                </h2>
                <p>
                  Top Songs is free and always will be. There&apos;s absolutely
                  no obligation to pay anything. I built this for fun, not profit.
                </p>
                <p className="mt-2">
                  That said, if you enjoy the game and feel like buying me a
                  coffee or helping to keep the servers turned on, I certainly
                  won&apos;t say no!
                </p>
                <a
                  href="https://buymeacoffee.com/topsongs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 mt-3"
                >
                  <Beer className="w-4 h-4" />
                  Buy me a coffee
                </a>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Get in touch
            </h2>
            <p>
              Got feedback, found a bug, or just want to say hi? Drop me a line
              at{" "}
              <a
                href="mailto:dev@topsongs.io"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                dev@topsongs.io
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
