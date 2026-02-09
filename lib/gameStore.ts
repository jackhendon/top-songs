import { create } from "zustand";
import { Song } from "./types";
import { findBestMatch } from "./songMatcher";
import { trackGameStart, trackGuess, trackGameWon, trackGameAbandoned } from "./analytics";

export interface GameState {
  // Artist data
  artistName: string;
  artistId: string;
  artistImage?: string;

  // Song data
  allSongs: Song[]; // All songs from the artist
  topTen: Song[]; // The top 10 songs (the answer key)

  // Game progress
  revealedIndices: Set<number>; // Which top 10 slots have been revealed (0-9)
  overflowSongs: Song[]; // Songs that were guessed correctly but aren't in top 10
  guessedTitles: Set<string>; // All song titles that have been guessed (prevents duplicates)

  // Game status
  totalGuesses: number;
  gameStartedAt: number | null;
  isGameWon: boolean;
  isGaveUp: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  startGame: (
    artistName: string,
    artistId: string,
    artistImage: string | undefined,
    songs: Song[],
    topTen: Song[],
  ) => void;
  makeGuess: (
    guess: string,
  ) => "correct-top10" | "correct-overflow" | "incorrect" | "duplicate";
  giveUp: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  artistName: "",
  artistId: "",
  artistImage: undefined,
  allSongs: [],
  topTen: [],
  revealedIndices: new Set(),
  overflowSongs: [],
  guessedTitles: new Set(),
  totalGuesses: 0,
  gameStartedAt: null,
  isGameWon: false,
  isGaveUp: false,
  isLoading: false,
  error: null,

  // Start a new game
  startGame: (artistName, artistId, artistImage, songs, topTen) => {
    set({
      artistName,
      artistId,
      artistImage,
      allSongs: songs,
      topTen,
      revealedIndices: new Set(),
      overflowSongs: [],
      guessedTitles: new Set(),
      totalGuesses: 0,
      gameStartedAt: Date.now(),
      isGameWon: false,
      isGaveUp: false,
      error: null,
    });
    trackGameStart(artistName, artistId);
  },

  // Process a guess
  makeGuess: (guess: string) => {
    const state = get();

    if (state.isGameWon) {
      return "duplicate"; // Game already won
    }

    // Increment total guesses counter
    set({ totalGuesses: state.totalGuesses + 1 });

    // Find best match among all songs
    const allSongTitles = state.allSongs.map((s) => s.title);
    const match = findBestMatch(guess, allSongTitles, 0.75);

    if (!match) {
      trackGuess({
        artistName: state.artistName,
        guessText: guess,
        correct: false,
        isOverflow: false,
        totalGuesses: state.totalGuesses + 1,
      });
      return "incorrect"; // No match found
    }

    // Check if this song was already guessed
    if (state.guessedTitles.has(match.song)) {
      return "duplicate";
    }

    // Find the matched song in our data
    const matchedSong = state.allSongs.find((s) => s.title === match.song);

    if (!matchedSong) {
      return "incorrect";
    }

    // Check if it's in the top 10
    const topTenIndex = state.topTen.findIndex((s) => s.title === match.song);

    if (topTenIndex !== -1) {
      // It's in the top 10!
      const newRevealed = new Set(state.revealedIndices);
      newRevealed.add(topTenIndex);

      const newGuessed = new Set(state.guessedTitles);
      newGuessed.add(match.song);

      // Check if game is won
      const isWon = newRevealed.size === 10;
      const newTotalGuesses = state.totalGuesses + 1;

      set({
        revealedIndices: newRevealed,
        guessedTitles: newGuessed,
        isGameWon: isWon,
      });

      trackGuess({
        artistName: state.artistName,
        guessText: guess,
        correct: true,
        isOverflow: false,
        position: topTenIndex + 1,
        totalGuesses: newTotalGuesses,
      });

      if (isWon) {
        const timeSeconds = state.gameStartedAt
          ? Math.round((Date.now() - state.gameStartedAt) / 1000)
          : 0;
        trackGameWon({
          artistName: state.artistName,
          artistId: state.artistId,
          totalGuesses: newTotalGuesses,
          timeSeconds,
          overflowCount: state.overflowSongs.length,
        });
      }

      return "correct-top10";
    } else {
      // It's a correct song, but not in top 10 (overflow)
      const newOverflow = [...state.overflowSongs, matchedSong];
      const newGuessed = new Set(state.guessedTitles);
      newGuessed.add(match.song);

      set({
        overflowSongs: newOverflow,
        guessedTitles: newGuessed,
      });

      trackGuess({
        artistName: state.artistName,
        guessText: guess,
        correct: true,
        isOverflow: true,
        totalGuesses: state.totalGuesses + 1,
      });

      return "correct-overflow";
    }
  },

  // Give up - reveal all slots
  giveUp: () => {
    const state = get();
    trackGameAbandoned({
      artistName: state.artistName,
      guessesUsed: state.totalGuesses,
      slotsRevealed: state.revealedIndices.size,
    });
    set({
      revealedIndices: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
      isGaveUp: true,
    });
  },

  // Reset the game
  resetGame: () => {
    set({
      artistName: "",
      artistId: "",
      artistImage: undefined,
      allSongs: [],
      topTen: [],
      revealedIndices: new Set(),
      overflowSongs: [],
      guessedTitles: new Set(),
      totalGuesses: 0,
      gameStartedAt: null,
      isGameWon: false,
      isGaveUp: false,
      isLoading: false,
      error: null,
    });
  },
}));
