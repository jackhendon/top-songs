import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { POPULAR_ARTISTS, slugToArtistName } from "@/lib/slugs";
import { getArtistMetadata } from "@/lib/getArtistMetadata";
import ArtistGame from "@/components/ArtistGame";
import ArtistSchema from "@/components/ArtistSchema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static pages for popular artists at build time
export function generateStaticParams() {
  return Object.keys(POPULAR_ARTISTS).map((slug) => ({ slug }));
}

// Allow dynamic params for artists not in POPULAR_ARTISTS
export const dynamicParams = true;

// Enable ISR: cache pages for 24 hours, regenerate in background
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artistName = slugToArtistName(slug);
  const metadata = await getArtistMetadata(artistName);

  if (!metadata) {
    return { title: "Artist Not Found" };
  }

  const title = `${metadata.artistName} Top Songs Quiz: Guess the 10 Most Streamed Hits`;
  const description = `Play the ultimate ${metadata.artistName} trivia game. Prove you're a real fan by guessing their top 10 Spotify songs. Play free at topsongs.io.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: metadata.imageUrl ? [{ url: metadata.imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: metadata.imageUrl ? [metadata.imageUrl] : [],
    },
  };
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(0)}K`;
  }
  return count.toLocaleString();
}

function getRelatedArtists(
  currentSlug: string,
  count: number = 6,
): { slug: string; name: string }[] {
  const slugs = Object.keys(POPULAR_ARTISTS).filter((s) => s !== currentSlug);
  // Deterministic shuffle based on the current slug so it's stable per page
  const seed = currentSlug
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = slugs
    .map((s, i) => ({ s, sort: Math.sin(seed + i) }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.s);
  return shuffled
    .slice(0, count)
    .map((s) => ({ slug: s, name: POPULAR_ARTISTS[s] }));
}

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const artistName = slugToArtistName(slug);
  const metadata = await getArtistMetadata(artistName);

  if (!metadata) {
    notFound();
  }

  const followers = metadata.followers;
  const relatedArtists = getRelatedArtists(slug);

  return (
    <>
    <ArtistSchema
      artistName={metadata.artistName}
      artistSlug={slug}
      artistImage={metadata.imageUrl}
    />
    <ArtistGame
      artistName={metadata.artistName}
      artistId={metadata.artistId}
      artistImage={metadata.imageUrl}
      slug={slug}
    >
      <section className="max-w-2xl mx-auto px-4 pb-10 space-y-8">
        {/* About section */}
        <div className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Play the {metadata.artistName} Top Songs Quiz
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Welcome to the ultimate <strong>music trivia game</strong> for{" "}
            {metadata.artistName} fans. Your challenge is to guess their{" "}
            <strong>top 10 most-streamed songs on Spotify</strong> in as few
            guesses as possible.
            {followers
              ? ` Join millions of listeners - ${metadata.artistName} currently has ${formatFollowers(followers)} Spotify followers.`
              : ""}{" "}
            From their biggest radio hits to deep cuts, test your knowledge of
            their discography in this interactive <strong>guessing game</strong>
            .
          </p>
        </div>

        {/* Related artists */}
        <div className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-text-primary">
            More artists to guess
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relatedArtists.map(({ slug: s, name }) => (
              <Link key={s} href={`/artist/${s}`} className="artist-card text-sm">
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </ArtistGame>
    </>
  );
}
