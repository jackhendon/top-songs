# Artist matches Spotify search could not verify

These artists are **playable but noindexed**. Spotify's search returned a
different artist and there is no automated way to tell whether the difference is
a genuine mismatch or just a different spelling of the same act, so the pages are
kept out of the index rather than publishing a stream count under the wrong name.

Fix one by adding its real Spotify artist id to `data/artist-overrides.json`,
then re-running:

```
node scripts/build-artist-snapshot.mjs --only <slug>
node scripts/build-related-artists.mjs
```

The record comes back marked verified and the page becomes indexable.

## Wrong artist — needs a pinned id

| Page | Expected | Spotify returned |
|---|---|---|
| `/artist/v` | V | Vybz Kartel (2.6M followers) |
| `/artist/king` | King | Kingfishr (455K) |
| `/artist/lea` | LEA | LEAP (81K) |
| `/artist/bin` | BIN | BINI (5.3M) |
| `/artist/kevin` | Kevin | Kevin Gates (7.4M) |
| `/artist/chris-mc` | Chris MC | Chris McClarney (77K) |

All six are short stage names losing to a more popular near-match. Search
ranking cannot fix this; only a pinned id can.

## Probably correct — same artist, different name form

| Page | Expected | Spotify returned | Note |
|---|---|---|---|
| `/artist/yorushika` | Yorushika | ヨルシカ | Same act, Japanese script |
| `/artist/el-makabelico` | El Makabelico | Jan Glack | Believed to be the same artist under another name |

Worth confirming and pinning, which will make them indexable again without
changing what the page shows.

## No streaming data at all

Kworb has no page for these Spotify ids, so there are no tracks and no stream
counts to render. Noindexed for the same reason.

- `/artist/rin` — RIN
- `/artist/toledo` — Toledo
- `/artist/cruz-cafun` — Cruz Cafuné. Note the only exact name match on Spotify
  has 296 followers, which is likely an impostor or an abandoned profile; the
  real artist may be listed under a different name. Previously this page served
  Cruzzi's song list, which was wrong but looked fine.

## Total

11 of 2,995 pages, or 0.4%. The other 2,984 are indexable.
