import type { Metadata } from "next";

// Game history lives in localStorage, so this page is empty for every crawler
// and identical for every visitor. Nothing here to index.
export const metadata: Metadata = {
  title: "Your Games - Top Songs",
  robots: { index: false, follow: true },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
