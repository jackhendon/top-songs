"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { ArtistData } from "@/lib/types";
import Header from "@/components/Header";
import ArtistSelector from "@/components/ArtistSelector";
import GameBoard from "@/components/GameBoard";

import VictoryScreen from "@/components/VictoryScreen";

export default function HomePage() {
  const {
    artistName,
    revealedIndices,
    overflowSongs,
    totalGuesses,
    isGameWon,
    isGaveUp,
    resetGame,
  } = useGameStore();
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
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header onReset={isStarted ? handleReset : undefined} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {!isStarted ? (
          <ArtistSelector onArtistSelected={handleArtistSelected} />
        ) : isGameWon && !isGaveUp ? (
          <VictoryScreen
            artistName={artistName}
            totalGuesses={totalGuesses}
            overflowCount={overflowSongs.length}
            onPlayAgain={handleReset}
          />
        ) : (
          <GameBoard onReset={handleReset} />
        )}
      </main>

      <footer className="py-6 border-t-2 border-charcoal-700/10">
        <div className="container mx-auto px-4 text-center text-sm text-charcoal-700/60">
          <p>Data sourced from Kworb.net · Made with ♫ for music lovers</p>
        </div>
      </footer>
    </div>
  );
}
