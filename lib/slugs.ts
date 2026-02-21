// Top 50 most-streamed artists - these will be pre-rendered at build time
// All other artists will be generated on-demand via ISR
export const POPULAR_ARTISTS: Record<string, string> = {
  "taylor-swift": "Taylor Swift",
  "the-weeknd": "The Weeknd",
  "bad-bunny": "Bad Bunny",
  drake: "Drake",
  "ed-sheeran": "Ed Sheeran",
  "ariana-grande": "Ariana Grande",
  "post-malone": "Post Malone",
  "billie-eilish": "Billie Eilish",
  "harry-styles": "Harry Styles",
  eminem: "Eminem",
  rihanna: "Rihanna",
  "kanye-west": "Kanye West",
  "bruno-mars": "Bruno Mars",
  "dua-lipa": "Dua Lipa",
  "olivia-rodrigo": "Olivia Rodrigo",
  "doja-cat": "Doja Cat",
  "travis-scott": "Travis Scott",
  sia: "SIA",
  adele: "Adele",
  beyonce: "Beyoncé",
  coldplay: "Coldplay",
  "imagine-dragons": "Imagine Dragons",
  "maroon-5": "Maroon 5",
  "twenty-one-pilots": "Twenty One Pilots",
  "lil-nas-x": "Lil Nas X",
  "shawn-mendes": "Shawn Mendes",
  "selena-gomez": "Selena Gomez",
  "camila-cabello": "Camila Cabello",
  khalid: "Khalid",
  halsey: "Halsey",
  "charlie-puth": "Charlie Puth",
  "sam-smith": "Sam Smith",
  "miley-cyrus": "Miley Cyrus",
  "sabrina-carpenter": "Sabrina Carpenter",
  sza: "SZA",
  "peso-pluma": "Peso Pluma",
  feid: "Feid",
  "karol-g": "Karol G",
  "rauw-alejandro": "Rauw Alejandro",
  "j-balvin": "J Balvin",
  "daddy-yankee": "Daddy Yankee",
  ozuna: "Ozuna",
  bts: "BTS",
  blackpink: "BLACKPINK",
  "one-direction": "One Direction",
  "kendrick-lamar": "Kendrick Lamar",
  "juice-wrld": "Juice WRLD",
  xxxtentacion: "XXXTENTACION",
  "lil-uzi-vert": "Lil Uzi Vert",
};

const nameToSlug = Object.fromEntries(
  Object.entries(POPULAR_ARTISTS).map(([slug, name]) => [name, slug]),
);

export function slugToArtistName(slug: string): string {
  return POPULAR_ARTISTS[slug] ?? slug.replace(/-/g, " ");
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
