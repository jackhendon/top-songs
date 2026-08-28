/**
 * Serialises JSON-LD for injection into a <script> element.
 *
 * JSON.stringify does not escape "</script", "<!--", or the line separators
 * U+2028 and U+2029, so a value containing any of them closes the element early
 * and everything after it is parsed as markup. That was a live XSS on the
 * artist pages, where track titles come from scraping and three real ones
 * already contain a raw "<".
 *
 * Escaping to \\u00XX leaves the JSON semantically identical while making it
 * impossible to break out of the element.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage markup. Google requires the answers to be visible on the page, so
 * only pass questions that are actually rendered: the artist pages once shipped
 * markup describing three questions that appeared nowhere in the document.
 */
export function faqPageSchema(faq: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
