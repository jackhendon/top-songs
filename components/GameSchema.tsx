interface FaqEntry {
  question: string;
  answer: string;
}

interface GameSchemaProps {
  name: string;
  description: string;
  path: string;
  faq: FaqEntry[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";

/**
 * Escapes for injection into a <script> element. JSON.stringify does not escape
 * "</script", so a value containing it would close the element early. Nothing
 * here is user-supplied today, but the artist pages had exactly this bug with
 * scraped track titles and it is not worth having two different standards.
 */
function toJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

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

  // Only the questions actually rendered on the page. Google requires FAQPage
  // answers to be visible, and the artist pages previously shipped markup for
  // questions that appeared nowhere.
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };

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
