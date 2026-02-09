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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "reveal-flash": {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "reveal-flash": "reveal-flash 0.6s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
