// Source of truth is data/artists.json, so the same list is readable by the
// app and by scripts/build-artist-snapshot.mjs without either having to parse
// the other's format.
//
// Regenerate with scripts/fetch-kworb-artists.mjs.
// Source: https://kworb.net/spotify/artists.html
import artists from "@/data/artists.json";
import type { ArtistAutocompleteItem } from "./artistAutocomplete";

export const AUTOCOMPLETE_ARTISTS: ArtistAutocompleteItem[] = artists;
