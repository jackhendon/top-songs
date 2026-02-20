import { create } from "zustand";
import { Song } from "./types";
import { matchesSong } from "./songMatcher";
import { trackGameStart, trackGuess, trackGameWon, trackGameAbandoned, trackHintReveal } from "./analytics";
import { useHistoryStore } from "./historyStore";

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
  guessedIndices: Set<number>; // Which top 10 slots were guessed by the player (subset of revealedIndices)
  hintLevels: Map<number, number>; // Maps slot index → hint level (1=first letter, 2=full reveal)
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
  ) => { result: "correct-top10" | "correct-overflow" | "incorrect" | "duplicate"; rank?: number };
  revealHint: (index: number) => void;
  giveUp: () => void;
  resetGame: () => void;
}

export function getHintsUsed(hintLevels: Map<number, number>): number {
  let total = 0;
  hintLevels.forEach((level) => { total += level; });
  return total;
}

function getElapsedSeconds(startedAt: number | null): number {
  return startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
}

function saveToHistory(
  state: Pick<GameState, "artistName" | "artistId" | "artistImage" | "gameStartedAt" | "overflowSongs">,
  opts: { totalGuesses: number; slotsRevealed: number; outcome: "won" | "gave_up" },
) {
  const timeSeconds = getElapsedSeconds(state.gameStartedAt);
  useHistoryStore.getState().addGame({
    id: crypto.randomUUID(),
    artistName: state.artistName,
    artistId: state.artistId,
    artistImage: state.artistImage,
    datePlayed: Date.now(),
    totalGuesses: opts.totalGuesses,
    slotsRevealed: opts.slotsRevealed,
    overflowCount: state.overflowSongs.length,
    outcome: opts.outcome,
    timeSeconds,
  });
  return timeSeconds;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  artistName: "",
  artistId: "",
  artistImage: undefined,
  allSongs: [],
  topTen: [],
  revealedIndices: new Set(),
  guessedIndices: new Set(),
  hintLevels: new Map(),
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
      guessedIndices: new Set(),
      hintLevels: new Map(),
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
      return { result: "duplicate" }; // Game already won
    }

    // Increment total guesses counter
    set({ totalGuesses: state.totalGuesses + 1 });

    // Find all songs that match the guess (handles multiple versions/remasters of the same song)
    const matchingSongs = state.allSongs.filter((song) =>
      matchesSong(guess, song.title, 0.75),
    );

    if (matchingSongs.length === 0) {
      trackGuess({
        artistName: state.artistName,
        guessText: guess,
        correct: false,
        isOverflow: false,
        totalGuesses: state.totalGuesses + 1,
      });
      return { result: "incorrect" };
    }

    // Check if any version of this song was already guessed
    if (matchingSongs.some((song) => state.guessedTitles.has(song.title))) {
      return { result: "duplicate" };
    }

    // Mark ALL matching versions as guessed so variants don't count as separate guesses
    const newGuessed = new Set(state.guessedTitles);
    matchingSongs.forEach((song) => newGuessed.add(song.title));

    // Among all matching versions, pick the best-ranked one (lowest rank number)
    const bestSong = matchingSongs.reduce((best, song) =>
      song.rank < best.rank ? song : best,
    );

    // Check if the best-ranked version is in the top 10
    const topTenIndex = state.topTen.findIndex((s) => s.title === bestSong.title);

    if (topTenIndex !== -1) {
      // It's in the top 10!
      const newRevealed = new Set(state.revealedIndices);
      newRevealed.add(topTenIndex);

      const newGuessedIndices = new Set(state.guessedIndices);
      newGuessedIndices.add(topTenIndex);

      // Check if game is won
      const isWon = newRevealed.size === 10;
      const newTotalGuesses = state.totalGuesses + 1;

      set({
        revealedIndices: newRevealed,
        guessedIndices: newGuessedIndices,
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
        const timeSeconds = saveToHistory(state, {
          totalGuesses: newTotalGuesses,
          slotsRevealed: 10,
          outcome: "won",
        });
        trackGameWon({
          artistName: state.artistName,
          artistId: state.artistId,
          totalGuesses: newTotalGuesses,
          timeSeconds,
          overflowCount: state.overflowSongs.length,
        });
      }

      return { result: "correct-top10", rank: topTenIndex + 1 };
    } else {
      // It's a correct song, but not in top 10 (overflow)
      const newOverflow = [...state.overflowSongs, bestSong];

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

      return { result: "correct-overflow", rank: bestSong.rank };
    }
  },

  // Reveal a hint for a slot
  revealHint: (index: number) => {
    const state = get();
    if (state.revealedIndices.has(index)) return;

    const currentLevel = state.hintLevels.get(index) ?? 0;
    if (currentLevel >= 2) return;

    const newHintLevels = new Map(state.hintLevels);
    newHintLevels.set(index, currentLevel + 1);

    const hintsUsed = getHintsUsed(newHintLevels);

    trackHintReveal({
      artistName: state.artistName,
      slotIndex: index + 1,
      hintLevel: (currentLevel + 1) as 1 | 2,
      hintsUsed,
      guessesUsed: state.totalGuesses,
    });

    if (currentLevel === 1) {
      // Going from first letter → full reveal: add to revealedIndices (but not guessedIndices)
      const newRevealed = new Set(state.revealedIndices);
      newRevealed.add(index);
      const isWon = newRevealed.size === 10;
      set({
        hintLevels: newHintLevels,
        revealedIndices: newRevealed,
        ...(isWon && { isGameWon: true }),
      });
    } else {
      set({ hintLevels: newHintLevels });
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
    saveToHistory(state, {
      totalGuesses: state.totalGuesses,
      slotsRevealed: state.guessedIndices.size,
      outcome: "gave_up",
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
      guessedIndices: new Set(),
      hintLevels: new Map(),
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
