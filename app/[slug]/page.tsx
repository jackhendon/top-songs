import { notFound } from "next/navigation";
import { Metadata } from "next";
import { POPULAR_ARTISTS, slugToArtistName, artistNameToSlug } from "@/lib/slugs";
import { getArtistMetadata } from "@/lib/getArtistMetadata";
import ArtistGame from "@/components/ArtistGame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(POPULAR_ARTISTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artistName = slugToArtistName(slug);
  const metadata = await getArtistMetadata(artistName);

  if (!metadata) {
    return { title: "Artist Not Found" };
  }

  const title = `${metadata.artistName}'s Top Songs - Can You Guess the Top 10?`;
  const description = `Can you guess ${metadata.artistName}'s top 10 most-streamed songs on Spotify?`;

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

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const artistName = slugToArtistName(slug);
  const metadata = await getArtistMetadata(artistName);

  if (!metadata) {
    notFound();
  }

  return (
    <ArtistGame
      artistName={metadata.artistName}
      artistId={metadata.artistId}
      artistImage={metadata.imageUrl}
      slug={slug}
    />
  );
}
