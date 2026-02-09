"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function GuessInput() {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "overflow" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [shaking, setShaking] = useState(false);

  const { makeGuess } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guess.trim()) return;

    const result = makeGuess(guess);

    switch (result) {
      case "correct-top10":
        setFeedback({
          type: "success",
          message: "That's in the top 10!",
        });
        setGuess("");
        break;

      case "correct-overflow":
        setFeedback({
          type: "overflow",
          message: "Correct song, but not in the top 10",
        });
        setGuess("");
        break;

      case "duplicate":
        setFeedback({
          type: "error",
          message: "You already guessed that song",
        });
        triggerShake();
        break;

      case "incorrect":
        setFeedback({
          type: "error",
          message: "Not a match. Try again!",
        });
        triggerShake();
        break;
    }

    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedback({ type: null, message: "" });
    }, 3000);
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-4 sm:p-5 ${shaking ? "animate-shake" : ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <label
          htmlFor="guess"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Guess a song
        </label>
        <div className="flex gap-2">
          <input
            id="guess"
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter song title..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-colors text-base"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            className="px-5 py-3 bg-gradient-brand text-white font-semibold rounded-xl transition-all hover:shadow-brand active:scale-95 min-h-[44px] cursor-pointer"
          >
            Guess
          </button>
        </div>

        {/* Feedback Message */}
        {feedback.type && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              feedback.type === "success"
                ? "bg-correct-light text-correct"
                : feedback.type === "overflow"
                  ? "bg-overflow-light text-overflow"
                  : "bg-error-light text-error"
            }`}
          >
            {feedback.type === "success" && (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            {feedback.type === "overflow" && (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            {feedback.type === "error" && (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </form>
    </div>
  );
}
