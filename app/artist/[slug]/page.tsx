import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { slugToArtistName } from "@/lib/slugs";
import {
  INDEXABLE_SLUGS,
  getArtistSnapshot,
  hasStats,
  isKnownArtistSlug,
} from "@/lib/artistSnapshot";
import { getRelatedArtists } from "@/lib/relatedArtists";
import { getArtistMetadata } from "@/lib/getArtistMetadata";
import {
  aboutParagraph,
  buildFaq,
  deriveFacts,
  formatStreams,
  possessive,
  statsParagraph,
} from "@/lib/artistCopy";
import ArtistGame from "@/components/ArtistGame";
import ArtistSchema from "@/components/ArtistSchema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Everything we hold data for is generated at build time. This is free now that
// the page reads data/artist-snapshot.json instead of calling Spotify and Kworb
// per render, the whole catalogue builds without a single network request.
export function generateStaticParams() {
  return INDEXABLE_SLUGS.map((slug) => ({ slug }));
}

// Slugs outside the snapshot still resolve, falling back to a live lookup.
export const dynamicParams = true;

// The page is a pure function of data/artist-snapshot.json, so regenerating it
// reproduces byte-identical output. With a 24h window, crawlers walking the
// sitemap were triggering a full-catalogue regeneration every day: 74k ISR
// writes and ~59k function invocations a month, for no change in content.
// Refreshing the data means re-running the snapshot and deploying, which is
// already how it works.
export const revalidate = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isKnownArtistSlug(slug)) return { title: "Artist Not Found" };

  const record = getArtistSnapshot(slug);

  if (hasStats(record)) {
    const name = record.spotifyName || record.name;
    const biggest = record.topTen[0];

    return {
      title: `${name} Top Songs Quiz: Guess the 10 Most Streamed Hits`,
      // Carries a real per-artist fact so the snippet differs page to page,
      // but names no track: a title here would spoil the game in the search
      // result, before anyone even clicks through.
      description: `Can you name ${possessive(name)} 10 most-streamed songs on Spotify? The biggest has ${formatStreams(biggest.totalStreams)} plays. Full ranked list and stats, plus the free Top Songs quiz.`,
      alternates: { canonical: `/artist/${slug}` },
      openGraph: {
        title: `${name} Top Songs Quiz`,
        description: `Can you name ${possessive(name)} 10 most-streamed songs on Spotify?`,
        images: record.imageUrl ? [{ url: record.imageUrl }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} Top Songs Quiz`,
        description: `Can you name ${possessive(name)} 10 most-streamed songs on Spotify?`,
        images: record.imageUrl ? [record.imageUrl] : [],
      },
    };
  }

  const artistName = slugToArtistName(slug);
  const metadata = await getArtistMetadata(artistName);
  if (!metadata) return { title: "Artist Not Found" };

  const title = `${metadata.artistName} Top Songs Quiz: Guess the 10 Most Streamed Hits`;
  return {
    title,
    description: `Play the ${metadata.artistName} trivia game. Guess their top 10 Spotify songs at topsongs.io.`,
    alternates: { canonical: `/artist/${slug}` },
    // We hold no streaming data for this artist, so there is nothing here
    // worth indexing. Serving it as a thin page is what produced the soft
    // 404s already sitting in Search Console.
    robots: { index: false, follow: true },
    openGraph: {
      title,
      images: metadata.imageUrl ? [{ url: metadata.imageUrl }] : [],
    },
  };
}

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params;

  // Anything outside the snapshot is not an artist we know about. Answering
  // before touching the network keeps crawler noise off the Spotify quota and
  // out of the permanent ISR cache.
  if (!isKnownArtistSlug(slug)) notFound();

  const record = getArtistSnapshot(slug);

  // --- artists we have no streaming data for: game only, noindexed above ---
  if (!hasStats(record)) {
    const artistName = slugToArtistName(slug);
    const metadata = await getArtistMetadata(artistName);
    if (!metadata) notFound();

    return (
      <ArtistGame
        artistName={metadata.artistName}
        artistId={metadata.artistId}
        artistImage={metadata.imageUrl}
        slug={slug}
      >
        <section className="max-w-2xl mx-auto px-4 pb-10 space-y-4">
          <h1 className="text-xl font-display font-extrabold text-text-primary tracking-[-0.02em]">
            {metadata.artistName} Top Songs Quiz
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Guess {possessive(metadata.artistName)} ten most-streamed songs on
            Spotify. Streaming figures for this artist are still being compiled,
            so the notes and stats shown on other artist pages are not available
            here yet.
          </p>
          <Link
            href="/directory"
            className="text-sm text-mustard dark:text-mint underline underline-offset-2"
          >
            Browse all artists
          </Link>
        </section>
      </ArtistGame>
    );
  }

  // hasStats already guarantees a non-empty topTen, which is the only case in
  // which deriveFacts returns null.
  const facts = deriveFacts(record)!;

  const name = facts.name;
  const about = aboutParagraph(facts);
  const stats = statsParagraph(facts);
  const faq = buildFaq(facts);
  const related = getRelatedArtists(slug);

  return (
    <>
      <ArtistSchema
        artistName={name}
        artistSlug={slug}
        artistImage={record.imageUrl ?? undefined}
        genres={facts.genres}
        faq={faq}
      />
      <ArtistGame
        artistName={name}
        artistId={record.spotifyId ?? ""}
        artistImage={record.imageUrl ?? undefined}
        slug={slug}
        relatedArtists={related}
      >
        <section className="max-w-2xl mx-auto px-4 pb-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-xl font-display font-extrabold text-text-primary tracking-[-0.02em]">
              {name} Top Songs Quiz
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Guess {possessive(name)} ten most-streamed songs on Spotify in as few
              guesses as you can. Every answer is ranked by estimated Spotify
              streams, not by opinion.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              About {name}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {about}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              {name} on Spotify
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {stats}
            </p>

            {/* Native <details>, collapsed on load. Google indexes the content
                inside it, and nothing is hidden with CSS. The answers are
                already in the /api/artist response that the game fetches, so
                putting them in the markup adds no new way to cheat. */}
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-sans font-semibold text-text-primary">
                Show the full top 10 (spoilers)
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <caption className="sr-only">
                    {possessive(name)} ten most-streamed songs on Spotify, by total
                    play count
                  </caption>
                  <thead>
                    <tr className="text-text-muted font-sans">
                      <th scope="col" className="py-1 pr-3 font-medium">
                        #
                      </th>
                      <th scope="col" className="py-1 pr-3 font-medium">
                        Song
                      </th>
                      <th scope="col" className="py-1 font-medium text-right">
                        Streams
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {facts.topTen.map((track) => (
                      <tr
                        key={track.rank}
                        className="border-t border-border-primary"
                      >
                        <td className="py-1.5 pr-3 text-text-muted tabular-nums">
                          {track.rank}
                        </td>
                        <td className="py-1.5 pr-3 text-text-primary">
                          {track.title}
                        </td>
                        <td className="py-1.5 text-text-secondary text-right tabular-nums">
                          {track.totalStreams.toLocaleString("en-GB")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-text-faint font-sans">
                  Figures are Kworb.net estimates derived from Spotify chart
                  performance, not official play counts, and are refreshed
                  weekly.
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Frequently asked questions
            </h2>
            <dl className="space-y-4">
              {faq.map((entry) => (
                <div key={entry.question} className="space-y-1">
                  <dt className="text-sm font-sans font-semibold text-text-primary">
                    {entry.question}
                  </dt>
                  <dd className="text-sm text-text-secondary leading-relaxed">
                    {entry.spoiler ? (
                      // Answer names tracks, so it stays collapsed. In the
                      // markup and indexable, not visible on load.
                      <details>
                        <summary className="cursor-pointer text-mustard dark:text-mint">
                          Show answer (spoiler)
                        </summary>
                        <p className="mt-1">{entry.answer}</p>
                      </details>
                    ) : (
                      entry.answer
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Similar artists
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {related.map(({ slug: s, name: n }) => (
                <Link
                  key={s}
                  href={`/artist/${s}`}
                  className="artist-card text-sm"
                >
                  {n}
                </Link>
              ))}
            </div>
            <p className="text-xs text-text-faint font-sans">
              Or{" "}
              <Link
                href="/directory"
                className="underline underline-offset-2 text-mustard dark:text-mint"
              >
                browse the full artist directory
              </Link>
              .
            </p>
          </div>
        </section>
      </ArtistGame>
    </>
  );
}
