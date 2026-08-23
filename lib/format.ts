export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * "The Beatles's" is wrong; it is "The Beatles'". Roughly one artist name in
 * eight ends in s, so this is not an edge case.
 *
 * This lives in format.ts rather than artistCopy.ts deliberately. artistCopy
 * imports artistBios, which imports slugs, which imports the full 2,995-artist
 * directory JSON. A client component importing one helper from artistCopy
 * therefore pulled 130 KB of artist data into the browser bundle on every
 * artist page. Keep this module free of data imports.
 */
export function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

/**
 * Spotify encodes the rendered size in the first 16 characters of an image id.
 * The API hands back the 640px variant, which is ~62KB, and we display artist
 * avatars at 40px. Swapping the prefix asks the CDN for the 160px file instead,
 * around 7KB, with no other change.
 *
 * Returns the input untouched if the URL is not the shape we expect, so an
 * unfamiliar host or id simply renders as before.
 */
const SPOTIFY_IMAGE_SIZES = {
  160: "ab6761610000f178",
  320: "ab67616100005174",
  640: "ab6761610000e5eb",
} as const;

export function spotifyImage(
  url: string | undefined,
  size: keyof typeof SPOTIFY_IMAGE_SIZES = 160,
): string | undefined {
  if (!url) return url;

  const [base, id] = url.split("/image/");
  if (!id || id.length <= 16 || !/^https:\/\/i\.scdn\.co$/.test(base)) {
    return url;
  }

  return `${base}/image/${SPOTIFY_IMAGE_SIZES[size]}${id.slice(16)}`;
}
