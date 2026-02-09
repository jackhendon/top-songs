"use client";

import { useState } from "react";
import { Trophy, RotateCcw, Share2, Check } from "lucide-react";

interface VictoryScreenProps {
  artistName: string;
  totalGuesses: number;
  overflowCount: number;
  onPlayAgain: () => void;
}

function isMobileDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function VictoryScreen({
  artistName,
  totalGuesses,
  overflowCount,
  onPlayAgain,
}: VictoryScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `I guessed all of ${artistName}'s top 10 songs in ${totalGuesses} tries! 🎵\n\nPlay Top Songs at topsongs.io`;

    if (isMobileDevice() && navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      {/* Trophy Icon */}
      <div className="flex justify-center fade-in">
        <div className="w-24 h-24 rounded-full bg-mustard-400/20 border-4 border-mustard-500 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-mustard-600" />
        </div>
      </div>

      {/* Victory Message */}
      <div
        className="space-y-4 fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal-800">
          Congratulations!
        </h2>
        <p className="text-xl text-charcoal-700/80">
          You guessed all of{" "}
          <span className="font-semibold text-burnt-orange">
            {artistName}&apos;s
          </span>{" "}
          top 10 songs!
        </p>
      </div>

      {/* Stats */}
      <div
        className="song-slot p-8 fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-4xl font-display font-bold text-burnt-orange mb-2">
              {totalGuesses}
            </div>
            <div className="text-sm text-charcoal-700/60 uppercase tracking-wide">
              Total Guesses
            </div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-sage-600 mb-2">
              {overflowCount}
            </div>
            <div className="text-sm text-charcoal-700/60 uppercase tracking-wide">
              Honorable Mentions
            </div>
          </div>
        </div>
      </div>

      {/* Performance Message */}
      <div
        className="overflow-area fade-in"
        style={{ animationDelay: "300ms" }}
      >
        <p className="text-charcoal-700/80">
          {totalGuesses <= 10 && "🎯 Perfect game! You're a true fan!"}
          {totalGuesses > 10 &&
            totalGuesses <= 20 &&
            "🎵 Impressive! You know your music!"}
          {totalGuesses > 20 && "🎼 Well done! You completed the challenge!"}
        </p>
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 justify-center fade-in"
        style={{ animationDelay: "400ms" }}
      >
        <button
          onClick={onPlayAgain}
          className="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
        <button
          onClick={handleShare}
          className="btn-secondary inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Share Result
            </>
          )}
        </button>
      </div>
    </div>
  );
}
