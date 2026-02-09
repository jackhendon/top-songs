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

  const { makeGuess } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guess.trim()) return;

    const result = makeGuess(guess);

    switch (result) {
      case "correct-top10":
        setFeedback({
          type: "success",
          message: "✓ Correct! That's in the top 10!",
        });
        setGuess("");
        break;

      case "correct-overflow":
        setFeedback({
          type: "overflow",
          message: "~ Correct song, but not in the top 10",
        });
        setGuess("");
        break;

      case "duplicate":
        setFeedback({
          type: "error",
          message: "You already guessed that song",
        });
        break;

      case "incorrect":
        setFeedback({
          type: "error",
          message: "✗ Not a match. Try again!",
        });
        break;
    }

    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedback({ type: null, message: "" });
    }, 3000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="guess"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Guess a song:
          </label>
          <div className="flex gap-2">
            <input
              id="guess"
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter song title..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Guess
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback.type && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              feedback.type === "success"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                : feedback.type === "overflow"
                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
            }`}
          >
            {feedback.type === "success" && (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {feedback.type === "overflow" && (
              <AlertCircle className="w-5 h-5" />
            )}
            {feedback.type === "error" && <XCircle className="w-5 h-5" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}
      </form>
    </div>
  );
}
