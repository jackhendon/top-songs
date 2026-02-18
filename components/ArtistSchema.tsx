interface ArtistSchemaProps {
  artistName: string;
  artistSlug: string;
  artistImage?: string | null;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";

export default function ArtistSchema({
  artistName,
  artistSlug,
  artistImage,
}: ArtistSchemaProps) {
  const pageUrl = `${baseUrl}/artist/${artistSlug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I play the ${artistName} Top Songs game?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Type the names of songs you think are in the top 10. Your goal is to reveal the full list in as few guesses as possible. Correct guesses reveal the song's rank and streaming count.",
        },
      },
      {
        "@type": "Question",
        name: `Are the streaming stats for ${artistName} accurate?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Streaming data is based on available data from Kworb.net, an aggregator site that estimates Spotify streams.",
        },
      },
      {
        "@type": "Question",
        name: `Is this ${artistName} quiz free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, TopSongs.io is completely free to play in your browser.",
        },
      },
    ],
  };

  const appSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${artistName} Top Songs Quiz`,
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    description: `Test your knowledge of ${artistName}'s discography. Guess the top 10 hits based on Spotify popularity.`,
    url: pageUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  if (artistImage) {
    appSchema.image = artistImage;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
    </>
  );
}
