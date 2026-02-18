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
          <>
            <ArtistSelector onArtistSelected={handleArtistSelected} />
            <section className="mt-8 px-2">
              <h2 className="font-display text-base font-bold text-text-secondary mb-2 tracking-[-0.02em]">
                Why Play Top Songs?
              </h2>
              <p className="text-sm text-text-muted font-sans leading-relaxed">
                TopSongs.io is a free browser-based music game that tests your knowledge of the streaming era. Unlike traditional music quizzes, we focus on real Spotify data. Test your memory against the charts with thousands of artists from Taylor Swift to indie legends.
              </p>
            </section>
          </>
        ) : (
          <GameBoard onReset={handleReset} onPlayAgain={handlePlayAgain} />
        )}
      </main>

      <Footer />
    </div>
  );
}
