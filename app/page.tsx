"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { ArtistData } from "./api/artist/route";
import ArtistSelector from "@/components/ArtistSelector";
import GameBoard from "@/components/GameBoard";
import GuessInput from "@/components/GuessInput";
import { Music2, RotateCcw } from "lucide-react";

export default function HomePage() {
  const { artistName, artistImage, revealedIndices, isGameWon, resetGame } =
    useGameStore();
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

  const progress = revealedIndices.size;

  return (
    <div className="min-h-screen bg-gradient-game">
      <div className="mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-brand mb-3 shadow-brand">
            <Music2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gradient-brand mb-1">
            Top Songs
          </h1>
          <p className="text-gray-500 text-base">
            Guess the top 10 most-streamed songs on Spotify
          </p>
        </header>

        {/* Artist Selection or Game */}
        {!isStarted ? (
          <ArtistSelector onArtistSelected={handleArtistSelected} />
        ) : (
          <div className="space-y-4">
            {/* Artist Header */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5">
              <div className="flex items-center gap-4">
                {/* Artist Image */}
                {artistImage && (
                  <img
                    src={artistImage}
                    alt={artistName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-brand-purple/20"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {artistName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-brand-purple">
                      {progress}/10
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-brand rounded-full progress-bar-fill"
                        style={{ width: `${(progress / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-colors"
                  title="Change artist"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">New Artist</span>
                </button>
              </div>
            </div>

            {/* Guess Input */}
            {!isGameWon && <GuessInput />}

            {/* Win Message */}
            {isGameWon && (
              <div className="bg-gradient-brand rounded-2xl p-6 text-center shadow-brand">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  You got them all!
                </h3>
                <p className="text-white/80 mb-4">
                  All top 10 songs for {artistName} revealed
                </p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-purple font-semibold rounded-xl hover:bg-white/90 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            )}

            {/* Game Board */}
            <GameBoard />
          </div>
        )}
      </div>
    </div>
  );
}
