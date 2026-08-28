import { toJsonLd } from "@/lib/jsonLd";
import { possessive, type FaqEntry } from "@/lib/artistCopy";

interface ArtistSchemaProps {
  artistName: string;
  artistSlug: string;
  artistImage?: string | null;
  genres?: string[];
  /**
   * The same FAQ entries rendered on the page. Google requires FAQPage answers
   * to be visible to the visitor, the previous version described questions
   * that appeared nowhere in the markup, which makes the markup ineligible at
   * best and a manual-action risk at worst.
   */
  faq: FaqEntry[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";


export default function ArtistSchema({
  artistName,
  artistSlug,
  artistImage,
  genres,
  faq,
}: ArtistSchemaProps) {
  const pageUrl = `${baseUrl}/artist/${artistSlug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };

  const musicGroupSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artistName,
    url: pageUrl,
  };
  if (artistImage) musicGroupSchema.image = artistImage;
  if (genres?.length) musicGroupSchema.genre = genres;

  const gameSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: `${artistName} Top Songs Quiz`,
    url: pageUrl,
    genre: "Music trivia",
    gamePlatform: "Web browser",
    numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
    description: `Guess ${possessive(artistName)} ten most-streamed songs on Spotify, ranked by total play count.`,
    isAccessibleForFree: true,
  };
  if (artistImage) gameSchema.image = artistImage;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(musicGroupSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(gameSchema) }}
      />
    </>
  );
}
