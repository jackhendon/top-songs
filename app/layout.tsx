import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import PostHogInit from "@/components/PostHogInit";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io",
  ),
  title: "Top Songs - Music Games Built on Real Spotify Data",
  description:
    "Three free music games built on real Spotify play counts: guess an artist's top 10, play higher or lower on stream counts, or take the daily challenge.",
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable}`}>
      <head>
        {/* Artist artwork is hotlinked from Spotify's CDN and React preloads it
            at high priority, so open the connection alongside the stylesheet
            rather than after it. */}
        <link rel="preconnect" href="https://i.scdn.co" crossOrigin="" />
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
