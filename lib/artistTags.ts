export interface ArtistTags {
  genre: string[];
  gender: "female" | "male" | "mixed";
  era: string[];
}

export const ARTIST_TAGS: Record<string, ArtistTags> = {
  "taylor-swift": {
    genre: ["pop", "country-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "the-weeknd": {
    genre: ["r&b", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "bad-bunny": {
    genre: ["latin", "reggaeton", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  drake: {
    genre: ["hip-hop", "r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "ed-sheeran": {
    genre: ["pop", "folk-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "ariana-grande": {
    genre: ["pop", "r&b"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "post-malone": {
    genre: ["hip-hop", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "billie-eilish": {
    genre: ["pop", "alt-pop", "indie-pop"],
    gender: "female",
    era: ["2020s"],
  },
  "justin-bieber": {
    genre: ["pop", "r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  eminem: {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  rihanna: {
    genre: ["pop", "r&b", "dance-pop"],
    gender: "female",
    era: ["2000s", "2010s"],
  },
  "kanye-west": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "bruno-mars": {
    genre: ["pop", "r&b", "funk"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "dua-lipa": {
    genre: ["pop", "dance-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "olivia-rodrigo": {
    genre: ["pop", "alt-pop", "indie-pop"],
    gender: "female",
    era: ["2020s"],
  },
  "doja-cat": {
    genre: ["pop", "hip-hop", "r&b"],
    gender: "female",
    era: ["2020s"],
  },
  "travis-scott": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  sia: {
    genre: ["pop", "dance-pop"],
    gender: "female",
    era: ["2010s"],
  },
  adele: {
    genre: ["pop", "soul", "ballad"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  beyonce: {
    genre: ["pop", "r&b", "dance-pop"],
    gender: "female",
    era: ["2000s", "2010s", "2020s"],
  },
  coldplay: {
    genre: ["alternative", "rock", "pop"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "imagine-dragons": {
    genre: ["alternative", "rock", "pop"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  "maroon-5": {
    genre: ["pop", "rock"],
    gender: "mixed",
    era: ["2000s", "2010s"],
  },
  "twenty-one-pilots": {
    genre: ["alternative", "pop", "rock"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  "shawn-mendes": {
    genre: ["pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "selena-gomez": {
    genre: ["pop", "dance-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "camila-cabello": {
    genre: ["pop", "latin"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  khalid: {
    genre: ["r&b", "alt-r&b", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  halsey: {
    genre: ["pop", "alt-pop", "indie-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "charlie-puth": {
    genre: ["pop", "r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "sam-smith": {
    genre: ["pop", "soul", "ballad"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "miley-cyrus": {
    genre: ["pop", "rock"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "sabrina-carpenter": {
    genre: ["pop", "indie-pop"],
    gender: "female",
    era: ["2020s"],
  },
  sza: {
    genre: ["r&b", "alt-r&b", "hip-hop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "peso-pluma": {
    genre: ["latin", "regional-mexican", "corridos"],
    gender: "male",
    era: ["2020s"],
  },
  feid: {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2020s"],
  },
  "karol-g": {
    genre: ["latin", "reggaeton"],
    gender: "female",
    era: ["2020s"],
  },
  "rauw-alejandro": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2020s"],
  },
  "j-balvin": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "daddy-yankee": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  ozuna: {
    genre: ["latin", "reggaeton", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  bts: {
    genre: ["k-pop", "pop", "hip-hop"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  blackpink: {
    genre: ["k-pop", "pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "one-direction": {
    genre: ["pop"],
    gender: "mixed",
    era: ["2010s"],
  },
  "kendrick-lamar": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "juice-wrld": {
    genre: ["hip-hop", "trap", "emo-rap"],
    gender: "male",
    era: ["2010s"],
  },
  xxxtentacion: {
    genre: ["hip-hop", "trap", "emo-rap"],
    gender: "male",
    era: ["2010s"],
  },
  "lil-uzi-vert": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  future: {
    genre: ["hip-hop", "trap", "r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "chris-brown": {
    genre: ["r&b", "pop", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "nicki-minaj": {
    genre: ["hip-hop", "rap", "pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "david-guetta": {
    genre: ["electronic", "dance-pop", "pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "lana-del-rey": {
    genre: ["pop", "indie-pop", "alt-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "lil-wayne": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "anuel-aa": {
    genre: ["latin", "reggaeton", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "21-savage": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "lady-gaga": {
    genre: ["pop", "dance-pop", "electronic"],
    gender: "female",
    era: ["2000s", "2010s", "2020s"],
  },
  "lil-baby": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "arijit-singh": {
    genre: ["bollywood", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  maluma: {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "calvin-harris": {
    genre: ["electronic", "dance-pop", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "myke-towers": {
    genre: ["latin", "reggaeton", "trap"],
    gender: "male",
    era: ["2020s"],
  },
  "j-cole": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "linkin-park": {
    genre: ["rock", "alternative", "nu-metal"],
    gender: "mixed",
    era: ["2000s", "2010s"],
  },
  "young-thug": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  shakira: {
    genre: ["pop", "latin", "dance-pop"],
    gender: "female",
    era: ["2000s", "2010s", "2020s"],
  },
  "morgan-wallen": {
    genre: ["country"],
    gender: "male",
    era: ["2020s"],
  },
  farruko: {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  queen: {
    genre: ["rock", "classic-rock"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "metro-boomin": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  gunna: {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2020s"],
  },
  "arctic-monkeys": {
    genre: ["rock", "indie-rock", "alternative"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "katy-perry": {
    genre: ["pop", "dance-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  pritam: {
    genre: ["bollywood", "pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "tyler-the-creator": {
    genre: ["hip-hop", "alternative", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "ty-dolla-sign": {
    genre: ["r&b", "hip-hop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "nicky-jam": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "the-beatles": {
    genre: ["rock", "classic-rock", "pop"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "harry-styles": {
    genre: ["pop", "indie-pop"],
    gender: "male",
    era: ["2020s"],
  },
  "wiz-khalifa": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "playboi-carti": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "junior-h": {
    genre: ["latin", "regional-mexican", "corridos"],
    gender: "male",
    era: ["2020s"],
  },
  pitbull: {
    genre: ["pop", "dance-pop", "latin"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "fuerza-regida": {
    genre: ["latin", "regional-mexican", "corridos"],
    gender: "mixed",
    era: ["2020s"],
  },
  "frank-ocean": {
    genre: ["r&b", "alt-r&b", "indie-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "jay-z": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "asap-rocky": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "the-chainsmokers": {
    genre: ["electronic", "pop", "dance-pop"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  marshmello: {
    genre: ["electronic", "dance-pop", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "cardi-b": {
    genre: ["hip-hop", "rap"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "michael-jackson": {
    genre: ["pop", "r&b", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "red-hot-chili-peppers": {
    genre: ["rock", "alternative", "funk-rock"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  arcangel: {
    genre: ["latin", "reggaeton", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  suicideboys: {
    genre: ["hip-hop", "trap", "emo-rap"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  onerepublic: {
    genre: ["pop", "rock", "alternative"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  avicii: {
    genre: ["electronic", "dance-pop", "pop"],
    gender: "male",
    era: ["2010s"],
  },
  "snoop-dogg": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  dababy: {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2020s"],
  },
  kygo: {
    genre: ["electronic", "tropical-house", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "50-cent": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "natanael-cano": {
    genre: ["latin", "regional-mexican", "corridos"],
    gender: "male",
    era: ["2020s"],
  },
  "mac-miller": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s"],
  },
  "romeo-santos": {
    genre: ["latin", "bachata"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  sech: {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2020s"],
  },
  quavo: {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "youngboy-never-broke-again": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "elton-john": {
    genre: ["pop", "rock", "classic-rock"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "trippie-redd": {
    genre: ["hip-hop", "trap", "emo-rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "the-neighbourhood": {
    genre: ["alternative", "indie-pop", "rock"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  "zach-bryan": {
    genre: ["country", "folk"],
    gender: "male",
    era: ["2020s"],
  },
  "lil-peep": {
    genre: ["emo-rap", "rock", "trap"],
    gender: "male",
    era: ["2010s"],
  },
  "manuel-turizo": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2020s"],
  },
  tyga: {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  tiesto: {
    genre: ["electronic", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "luke-combs": {
    genre: ["country"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  metallica: {
    genre: ["metal", "rock", "hard-rock"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "alan-walker": {
    genre: ["electronic", "dance-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  usher: {
    genre: ["r&b", "pop", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "don-toliver": {
    genre: ["hip-hop", "r&b", "trap"],
    gender: "male",
    era: ["2020s"],
  },
  "henrique-juliano": {
    genre: ["sertanejo"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  "jason-derulo": {
    genre: ["pop", "r&b", "dance-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "justin-timberlake": {
    genre: ["pop", "r&b", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "tate-mcrae": {
    genre: ["pop", "alt-pop"],
    gender: "female",
    era: ["2020s"],
  },
  "kodak-black": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "don-omar": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "bebe-rexha": {
    genre: ["pop", "r&b"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "sean-paul": {
    genre: ["dancehall", "reggae", "pop"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "kali-uchis": {
    genre: ["r&b", "alt-r&b", "latin"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  jhayco: {
    genre: ["latin", "reggaeton", "r&b"],
    gender: "male",
    era: ["2020s"],
  },
  "demi-lovato": {
    genre: ["pop", "r&b"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "sebastian-yatra": {
    genre: ["latin", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "a-boogie-wit-da-hoodie": {
    genre: ["hip-hop", "r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "daft-punk": {
    genre: ["electronic", "dance-pop", "funk"],
    gender: "mixed",
    era: ["2000s", "2010s"],
  },
  hozier: {
    genre: ["indie-rock", "folk", "alternative"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "luis-miguel": {
    genre: ["latin", "pop", "ballad"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "pop-smoke": {
    genre: ["hip-hop", "trap", "drill"],
    gender: "male",
    era: ["2020s"],
  },
  acdc: {
    genre: ["rock", "hard-rock", "metal"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "big-sean": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  akon: {
    genre: ["r&b", "pop", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "ellie-goulding": {
    genre: ["pop", "electronic", "dance-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "carin-leon": {
    genre: ["latin", "regional-mexican"],
    gender: "male",
    era: ["2020s"],
  },
  pink: {
    genre: ["pop", "rock"],
    gender: "female",
    era: ["2000s", "2010s", "2020s"],
  },
  "james-arthur": {
    genre: ["pop", "soul", "ballad"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "flo-rida": {
    genre: ["hip-hop", "pop", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "tory-lanez": {
    genre: ["hip-hop", "r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  nirvana: {
    genre: ["rock", "grunge", "alternative"],
    gender: "mixed",
    era: ["2000s"],
  },
  migos: {
    genre: ["hip-hop", "trap"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  "swae-lee": {
    genre: ["hip-hop", "r&b", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "fleetwood-mac": {
    genre: ["rock", "classic-rock", "folk-rock"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "dj-snake": {
    genre: ["electronic", "dance-pop", "latin"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  duki: {
    genre: ["latin", "trap", "hip-hop"],
    gender: "male",
    era: ["2020s"],
  },
  "britney-spears": {
    genre: ["pop", "dance-pop"],
    gender: "female",
    era: ["2000s", "2010s"],
  },
  bizarrap: {
    genre: ["electronic", "latin", "hip-hop"],
    gender: "male",
    era: ["2020s"],
  },
  radiohead: {
    genre: ["rock", "alternative", "indie"],
    gender: "mixed",
    era: ["2000s", "2010s"],
  },
  diplo: {
    genre: ["electronic", "dance-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "pharrell-williams": {
    genre: ["hip-hop", "r&b", "pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "polo-g": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2020s"],
  },
  "marilia-mendonca": {
    genre: ["sertanejo"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  anitta: {
    genre: ["latin", "pop", "dance-pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "lil-durk": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "g-eazy": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "the-kid-laroi": {
    genre: ["pop", "hip-hop"],
    gender: "male",
    era: ["2020s"],
  },
  "black-eyed-peas": {
    genre: ["hip-hop", "pop", "dance-pop"],
    gender: "mixed",
    era: ["2000s", "2010s"],
  },
  "green-day": {
    genre: ["rock", "punk-rock", "alternative"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "justin-quiles": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2020s"],
  },
  "kid-cudi": {
    genre: ["hip-hop", "alternative", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "gucci-mane": {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "bob-marley": {
    genre: ["reggae"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  offset: {
    genre: ["hip-hop", "trap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "daniel-caesar": {
    genre: ["r&b", "alt-r&b"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "fall-out-boy": {
    genre: ["rock", "pop-punk", "alternative"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "shreya-ghoshal": {
    genre: ["bollywood", "pop"],
    gender: "female",
    era: ["2000s", "2010s", "2020s"],
  },
  "panic-at-the-disco": {
    genre: ["rock", "pop-punk", "alternative"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  "ne-yo": {
    genre: ["r&b", "pop", "dance-pop"],
    gender: "male",
    era: ["2000s", "2010s"],
  },
  "2-chainz": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  rosalia: {
    genre: ["latin", "flamenco", "pop"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  joji: {
    genre: ["r&b", "indie-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "stray-kids": {
    genre: ["k-pop", "pop"],
    gender: "mixed",
    era: ["2020s"],
  },
  "jorge-mateus": {
    genre: ["sertanejo"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  "anirudh-ravichander": {
    genre: ["bollywood", "pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "lewis-capaldi": {
    genre: ["pop", "soul", "ballad"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  morat: {
    genre: ["latin", "indie-pop", "pop"],
    gender: "mixed",
    era: ["2010s", "2020s"],
  },
  camilo: {
    genre: ["latin", "pop"],
    gender: "male",
    era: ["2020s"],
  },
  nf: {
    genre: ["hip-hop", "rap", "alternative"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "charli-xcx": {
    genre: ["pop", "hyperpop", "electronic"],
    gender: "female",
    era: ["2010s", "2020s"],
  },
  "roddy-ricch": {
    genre: ["hip-hop", "trap", "r&b"],
    gender: "male",
    era: ["2020s"],
  },
  partynextdoor: {
    genre: ["r&b", "hip-hop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "bryson-tiller": {
    genre: ["r&b", "hip-hop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "2pac": {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2000s"],
  },
  "ar-rahman": {
    genre: ["bollywood", "pop"],
    gender: "male",
    era: ["2000s", "2010s", "2020s"],
  },
  "lenny-tavarez": {
    genre: ["latin", "reggaeton"],
    gender: "male",
    era: ["2020s"],
  },
  "martin-garrix": {
    genre: ["electronic", "dance-pop"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  jul: {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "mariah-carey": {
    genre: ["pop", "r&b", "ballad"],
    gender: "female",
    era: ["2000s", "2010s", "2020s"],
  },
  gorillaz: {
    genre: ["alternative", "pop", "electronic"],
    gender: "mixed",
    era: ["2000s", "2010s", "2020s"],
  },
  logic: {
    genre: ["hip-hop", "rap"],
    gender: "male",
    era: ["2010s", "2020s"],
  },
  "megan-thee-stallion": {
    genre: ["hip-hop", "rap"],
    gender: "female",
    era: ["2020s"],
  },
  "christian-nodal": {
    genre: ["latin", "regional-mexican"],
    gender: "male",
    era: ["2020s"],
  },
};

export function scoreArtistSimilarity(
  a: ArtistTags,
  b: ArtistTags,
): number {
  let score = 0;
  // Genre overlap is the strongest signal
  for (const g of a.genre) {
    if (b.genre.includes(g)) score += 2;
  }
  // Same gender adds a point
  if (a.gender === b.gender) score += 1;
  // Era overlap adds a point per shared era
  for (const e of a.era) {
    if (b.era.includes(e)) score += 1;
  }
  return score;
}
