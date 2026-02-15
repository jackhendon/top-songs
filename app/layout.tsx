import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import PostHogInit from "@/components/PostHogInit";
import ConsentBanner from "@/components/ConsentBanner";
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
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <PostHogInit />
        <ConsentBanner />
        {children}
      </body>
    </html>
  );
}
