import { AUTOCOMPLETE_ARTISTS } from "./artistAutocompleteData";
import type { ArtistAutocompleteItem } from "./artistAutocomplete";

/**
 * Slugs in the generated artist list were produced by naively folding the
 * artist name, which drops accents and collapses ampersands. Most of the
 * results are ugly but perfectly routable ("bob-marley--the-wailers"); one is
 * not routable at all, because the name folded away to nothing ("¥$" -> "").
 *
 * This module splits the list on that distinction. Anything unroutable is kept
 * out of the sitemap and the directory so we never publish a link that cannot
 * resolve. Anything merely misspelt still ships, renaming those URLs means
 * redirecting pages Google has already indexed, which is a deliberate job
 * rather than a side effect.
 */

/** A slug that Next can actually route to. */
export function isUsableArtistSlug(slug: string): boolean {
  return slug.length > 0 && /^[a-z0-9-]+$/.test(slug) && !slug.startsWith("-");
}

/** The slug this artist's name should have folded to. */
export function expectedArtistSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Every artist safe to link to. Use this rather than AUTOCOMPLETE_ARTISTS
 * anywhere a URL gets built.
 */
export const DIRECTORY_ARTISTS: ArtistAutocompleteItem[] =
  AUTOCOMPLETE_ARTISTS.filter((a) => isUsableArtistSlug(a.slug));

/** Artists with no routable slug. Needs a hand-assigned slug to come back. */
export const UNROUTABLE_ARTISTS: ArtistAutocompleteItem[] =
  AUTOCOMPLETE_ARTISTS.filter((a) => !isUsableArtistSlug(a.slug));

/**
 * Fails the build if any artist would produce a URL that cannot resolve.
 *
 * This is cheap to enforce now and expensive to notice otherwise: the "¥$"
 * entry folded to an empty slug, which put https://www.topsongs.io/artist/ in
 * the sitemap and a link to nowhere in the directory, and nothing complained.
 */
export function assertAllSlugsRoutable(): void {
  if (UNROUTABLE_ARTISTS.length === 0) return;

  const names = UNROUTABLE_ARTISTS.map(
    (a) => `${JSON.stringify(a.name)} -> ${JSON.stringify(a.slug)}`,
  ).join(", ");

  throw new Error(
    `${UNROUTABLE_ARTISTS.length} artist(s) in data/artists.json have no routable slug: ${names}. ` +
      `Assign a slug by hand: folding the name produced nothing usable.`,
  );
}

/**
 * Artists whose slug is routable but wrong, accents dropped, ampersands
 * collapsed to a double hyphen, trailing hyphens. These are the rename
 * candidates, each of which needs a 301 from the old URL.
 */
export function getMisspeltSlugArtists(): Array<
  ArtistAutocompleteItem & { expected: string }
> {
  // A function rather than a module-scope constant: this is a diagnostic for
  // the eventual slug migration, and computing it eagerly cost ~1.6ms of NFD
  // normalisation over 2,995 names on every cold start of every route that
  // imports this module, including the sitemap and the directory.
  return DIRECTORY_ARTISTS.filter(
    (a) => a.slug !== expectedArtistSlug(a.name),
  ).map((a) => ({ ...a, expected: expectedArtistSlug(a.name) }));
}
