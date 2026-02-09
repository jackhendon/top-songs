import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#8B5CF6",
          pink: "#EC4899",
        },
        correct: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        overflow: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        locked: {
          DEFAULT: "#E5E7EB",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
      },
      keyframes: {
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "reveal-flash": {
          "0%": { opacity: "0.6" },
          "100%": { opacity: "0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "bounce-in": "bounce-in 0.5s ease-out",
        "reveal-flash": "reveal-flash 0.8s ease-out",
        shake: "shake 0.5s ease-in-out",
      },
      boxShadow: {
        brand: "0 4px 14px 0 rgba(139, 92, 246, 0.25)",
        correct: "0 4px 14px 0 rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
