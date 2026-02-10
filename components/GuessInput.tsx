"use client";

import { useRef, useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function GuessInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "overflow" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [shaking, setShaking] = useState(false);

  const { makeGuess } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();

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
      className={`song-slot p-4 sm:p-5 ${shaking ? "animate-shake" : ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <label
          htmlFor="guess"
          className="block text-sm font-semibold text-charcoal-700 mb-1"
        >
          Guess a song
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="guess"
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter song title..."
            className="input-field flex-1 text-base"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary min-h-[44px] cursor-pointer"
          >
            Guess
          </button>
        </div>

        {/* Feedback Message */}
        {feedback.type && (
          <div
            className={`flex items-center gap-2 p-3 rounded-card text-sm font-medium border-2 ${
              feedback.type === "success"
                ? "bg-sage-400/10 border-sage-600 text-sage-600"
                : feedback.type === "overflow"
                  ? "bg-mustard-400/10 border-mustard-500 text-mustard-500"
                  : "bg-burnt-orange/10 border-burnt-orange text-burnt-sienna"
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
