import { faqPageSchema, toJsonLd, type FaqEntry } from "@/lib/jsonLd";

interface GameSchemaProps {
  name: string;
  description: string;
  path: string;
  faq: FaqEntry[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";

export default function GameSchema({
  name,
  description,
  path,
  faq,
}: GameSchemaProps) {
  const url = `${baseUrl}${path}`;

  const game = {
    "@context": "https://schema.org",
    "@type": "Game",
    name,
    url,
    description,
    genre: "Music trivia",
    gamePlatform: "Web browser",
    numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
    isAccessibleForFree: true,
  };

  const faqPage = faqPageSchema(faq);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(game) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(faqPage) }}
      />
    </>
  );
}
