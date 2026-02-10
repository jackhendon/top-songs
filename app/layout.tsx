import type { Metadata } from "next";
import PostHogInit from "@/components/PostHogInit";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://topsongs.io",
  ),
  title: "Top Songs - Guess the Hits",
  description:
    "Can you guess an artist's top 10 most-streamed songs on Spotify?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="paper-texture">
        <PostHogInit />
        {children}
      </body>
    </html>
  );
}
