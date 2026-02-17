"use client";

import { useState, useCallback } from "react";
import { useGameStore } from "@/lib/gameStore";
import { ArtistData } from "@/lib/types";
import Header from "@/components/Header";
import ArtistSelector from "@/components/ArtistSelector";
import GameBoard from "@/components/GameBoard";


import Footer from "@/components/Footer";

export default function HomePage() {
  const {
    artistName,
    totalGuesses,
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

  const handlePlayAgain = useCallback(async () => {
    const currentArtist = useGameStore.getState().artistName;
    if (!currentArtist) return;

    const response = await fetch(
      `/api/artist?name=${encodeURIComponent(currentArtist)}`,
    );
    if (!response.ok) return;

    const data: ArtistData = await response.json();
    const { startGame } = useGameStore.getState();
    startGame(
      data.artistName,
      data.artistId,
      data.imageUrl,
      data.songs,
      data.topTen,
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header onReset={handleReset} showNewArtist={isStarted} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {!isStarted ? (
          <ArtistSelector onArtistSelected={handleArtistSelected} />
        ) : (
          <GameBoard onReset={handleReset} onPlayAgain={handlePlayAgain} />
        )}
      </main>

      <Footer />
    </div>
  );
}
