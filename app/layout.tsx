import type { Metadata } from "next";
import PostHogInit from "@/components/PostHogInit";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <PostHogInit />
        {children}
      </body>
    </html>
  );
}
