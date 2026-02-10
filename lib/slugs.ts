export const POPULAR_ARTISTS: Record<string, string> = {
  "taylor-swift": "Taylor Swift",
  drake: "Drake",
  "the-weeknd": "The Weeknd",
  "bad-bunny": "Bad Bunny",
  "ed-sheeran": "Ed Sheeran",
  "ariana-grande": "Ariana Grande",
  "post-malone": "Post Malone",
  "billie-eilish": "Billie Eilish",
};

const slugToName = POPULAR_ARTISTS;
const nameToSlug = Object.fromEntries(
  Object.entries(POPULAR_ARTISTS).map(([slug, name]) => [name, slug]),
);

export function slugToArtistName(slug: string): string {
  return slugToName[slug] ?? slug.replace(/-/g, " ");
}

export function artistNameToSlug(name: string): string {
  return (
    nameToSlug[name] ??
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  );
}
