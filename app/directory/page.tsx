import Link from "next/link";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AUTOCOMPLETE_ARTISTS } from "@/lib/artistAutocomplete";
import DirectorySearch from "./DirectorySearch";

const PAGE_SIZE = 100;
const TOTAL = AUTOCOMPLETE_ARTISTS.length;

export const metadata: Metadata = {
  title: "Artist Directory – Browse 2,995 Artists | Top Songs",
  description:
    "Browse the complete directory of artists on Top Songs. Play the free Spotify music trivia quiz for Taylor Swift, Drake, Beyoncé, and thousands more.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const { q = "", page: pageStr = "1" } = await searchParams;

  const query = q.trim().toLowerCase();
  const currentPage = Math.max(1, parseInt(pageStr, 10) || 1);

  const filtered = query
    ? AUTOCOMPLETE_ARTISTS.filter((a) =>
        a.name.toLowerCase().includes(query),
      ).sort((a, b) => {
        // Prefix matches float to the top, then alphabetical within each tier
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    : [...AUTOCOMPLETE_ARTISTS].sort((a, b) => a.name.localeCompare(b.name));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageArtists = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/directory${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1">
            Artist Directory
          </h1>
          <p className="text-sm text-text-muted font-sans">
            Browse {TOTAL.toLocaleString()} artists and play the free Top Songs
            music trivia quiz.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <DirectorySearch initialValue={q} totalCount={TOTAL} />
        </div>

        {/* Result count */}
        <p className="text-xs text-text-faint font-sans mb-4">
          {query
            ? `${total.toLocaleString()} result${total !== 1 ? "s" : ""} for "${q}"`
            : `${total.toLocaleString()} artists, A–Z`}
          {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
        </p>

        {/* Artist grid */}
        {pageArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {pageArtists.map((artist) => (
              <Link
                key={artist.slug}
                href={`/${artist.slug}`}
                className="artist-card text-sm"
              >
                {artist.name}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-text-muted font-sans text-sm">
              No artists found for &ldquo;{q}&rdquo;
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-3"
            aria-label="Pagination"
          >
            {page > 1 ? (
              <Link
                href={buildHref(page - 1)}
                className="btn-secondary text-sm px-5 py-2"
              >
                ← Previous
              </Link>
            ) : (
              <span className="btn-secondary text-sm px-5 py-2 opacity-40 cursor-not-allowed select-none">
                ← Previous
              </span>
            )}

            <span className="text-sm text-text-muted font-sans tabular-nums">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={buildHref(page + 1)}
                className="btn-secondary text-sm px-5 py-2"
              >
                Next →
              </Link>
            ) : (
              <span className="btn-secondary text-sm px-5 py-2 opacity-40 cursor-not-allowed select-none">
                Next →
              </span>
            )}
          </nav>
        )}
      </main>

      <Footer />
    </div>
  );
}
