import { compareTwoStrings } from "string-similarity";
import { AUTOCOMPLETE_ARTISTS } from "./artistAutocompleteData";
export { AUTOCOMPLETE_ARTISTS };

export interface ArtistAutocompleteItem {
  name: string; // "Taylor Swift"
  slug: string; // "taylor-swift"
}

export function getPopularSuggestions(
  count: number = 8,
): ArtistAutocompleteItem[] {
  return AUTOCOMPLETE_ARTISTS.slice(0, count);
}

/**
 * Search for artists using a three-tier matching strategy:
 * 1. Exact prefix matches (highest priority)
 * 2. Contains matches (medium priority)
 * 3. Fuzzy matches using string-similarity (typo-tolerant, threshold 0.5)
 *
 * @param query - The search query
 * @param maxResults - Maximum number of suggestions to return (default: 8)
 * @returns Array of matching artists sorted by relevance
 */
export function searchArtists(
  query: string,
  maxResults: number = 8,
): ArtistAutocompleteItem[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: Array<{ item: ArtistAutocompleteItem; score: number }> = [];

  for (const artist of AUTOCOMPLETE_ARTISTS) {
    const lowerName = artist.name.toLowerCase();

    // Tier 1: Exact prefix match (score: 100)
    if (lowerName.startsWith(lowerQuery)) {
      results.push({ item: artist, score: 100 });
      continue;
    }

    // Tier 2: Contains match (score: 50)
    if (lowerName.includes(lowerQuery)) {
      results.push({ item: artist, score: 50 });
      continue;
    }

    // Tier 3: Fuzzy match (score: 0-49 based on similarity)
    const similarity = compareTwoStrings(lowerQuery, lowerName);
    if (similarity > 0.5) {
      results.push({ item: artist, score: similarity * 49 });
    }

    // Early exit if we have enough high-quality matches
    if (results.length >= maxResults * 2) {
      break;
    }
  }

  // Sort by score (descending) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((r) => r.item);
}
