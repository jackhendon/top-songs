import { compareTwoStrings } from "string-similarity";

/**
 * Normalize a song title for matching
 * - Lowercase
 * - Remove punctuation
 * - Remove text in parentheses
 * - Remove common filler words (feat., ft., with, etc.)
 */
export function normalizeSongTitle(title: string): string {
  let normalized = title.toLowerCase();

  // Remove version/remaster suffixes after " - "
  // e.g., "Here Comes The Sun - Remastered 2009" → "here comes the sun"
  normalized = normalized.replace(
    /\s*-\s*(?:remaster(?:ed)?|live(?:\s+.+)?|acoustic|demo|instrumental|mono|stereo|radio\s+edit|single(?:\s+version)?|album\s+version|extended(?:\s+mix)?|original(?:\s+mix)?|deluxe(?:\s+edition)?|anniversary(?:\s+edition)?|platinum(?:\s+edition)?)(?:\s+\d{4})?\s*$/,
    "",
  );
  // Remove standalone year suffix after " - " (e.g., "- 2009 Remaster", "- 2023")
  normalized = normalized.replace(/\s*-\s*\d{4}(?:\s+\w+)?\s*$/, "");

  // Remove content in parentheses (including the parentheses)
  normalized = normalized.replace(/\([^)]*\)/g, "");

  // Remove content in square brackets
  normalized = normalized.replace(/\[[^\]]*\]/g, "");

  // Remove common featuring indicators
  normalized = normalized.replace(/\b(feat\.?|ft\.?|featuring|with)\b.*/gi, "");

  // Normalize '&' to 'and'
  normalized = normalized.replace(/&/g, "and");

  // Remove punctuation and special characters
  normalized = normalized.replace(/[^\w\s]/g, "");

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Check if a guess matches a song title
 * Returns true if the similarity is above the threshold
 */
export function matchesSong(
  guess: string,
  songTitle: string,
  threshold: number = 0.75,
): boolean {
  const normalizedGuess = normalizeSongTitle(guess);
  const normalizedSong = normalizeSongTitle(songTitle);

  // Exact match after normalization
  if (normalizedGuess === normalizedSong) {
    return true;
  }

  // Fuzzy match using string similarity
  const similarity = compareTwoStrings(normalizedGuess, normalizedSong);

  return similarity >= threshold;
}

/**
 * Find the best matching song from a list
 * Returns the song and the match score, or null if no good match
 */
export function findBestMatch(
  guess: string,
  songTitles: string[],
  threshold: number = 0.75,
): { song: string; score: number } | null {
  const normalizedGuess = normalizeSongTitle(guess);

  let bestMatch: { song: string; score: number } | null = null;

  for (const song of songTitles) {
    const normalizedSong = normalizeSongTitle(song);

    // Check for exact match first
    if (normalizedGuess === normalizedSong) {
      return { song, score: 1.0 };
    }

    // Check similarity
    const score = compareTwoStrings(normalizedGuess, normalizedSong);

    if (score >= threshold) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { song, score };
      }
    }
  }

  return bestMatch;
}

/**
 * Test cases for the matcher
 */
export function testMatcher() {
  const testCases = [
    {
      guess: "cruel summer",
      song: "Cruel Summer",
      expected: true,
    },
    {
      guess: "i dont wanna live forever",
      song: "I Don't Wanna Live Forever (Fifty Shades Darker)",
      expected: true,
    },
    {
      guess: "id want to live forever",
      song: "I Don't Wanna Live Forever (Fifty Shades Darker)",
      expected: true, // Should match with fuzzy logic
    },
    {
      guess: "blank space",
      song: "Blank Space",
      expected: true,
    },
    {
      guess: "shake it off",
      song: "Shake It Off",
      expected: true,
    },
    {
      guess: "random song",
      song: "Cruel Summer",
      expected: false,
    },
  ];

  console.log("🧪 Testing Song Matcher:");

  for (const test of testCases) {
    const result = matchesSong(test.guess, test.song);
    const status = result === test.expected ? "✅" : "❌";
    console.log(`${status} "${test.guess}" vs "${test.song}" → ${result}`);
  }
}
