"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { ArtistData } from "./api/artist/route";
import ArtistSelector from "@/components/ArtistSelector";
import GameBoard from "@/components/GameBoard";
import GuessInput from "@/components/GuessInput";

export default function HomePage() {
  const { artistName, isGameWon, resetGame } = useGameStore();
  const [isStarted, setIsStarted] = useState(false);

  const handleArtistSelected = async (artistData: ArtistData) => {
    const { startGame } = useGameStore.getState();

    startGame(
      artistData.artistName,
      artistData.artistId,
      artistData.imageUrl,
      artistData.songs,
      artistData.topTen,
    );

    setIsStarted(true);
  };

  const handleReset = () => {
    resetGame();
    setIsStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            🎵 Top Songs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Guess the top 10 most-streamed songs on Spotify
          </p>
        </header>

        {/* Artist Selection or Game */}
        {!isStarted ? (
          <ArtistSelector onArtistSelected={handleArtistSelected} />
        ) : (
          <div className="space-y-6">
            {/* Current Artist Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {artistName}
                </h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Change Artist
                </button>
              </div>
            </div>

            {/* Guess Input */}
            {!isGameWon && <GuessInput />}

            {/* Game Board */}
            <GameBoard />

            {/* Win Message */}
            {isGameWon && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                  🎉 You Win! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  You guessed all top 10 songs for {artistName}!
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
