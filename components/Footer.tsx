import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-6"
      style={{ borderTop: "1px solid var(--raw-card-border)" }}
    >
      <div className="container mx-auto px-4 text-center text-sm text-text-muted font-sans space-y-1">
        <p>&copy; 2026 Top Songs. All rights reserved.</p>
        <p className="text-text-faint text-xs">
          Artist data and streaming figures sourced from{" "}
          <a
            href="https://kworb.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors"
          >
            Kworb.net
          </a>. All artist
          names, images, and trademarks belong to their respective owners. Not
          affiliated with Spotify or any listed artist.
        </p>
        <p className="space-x-3">
          <Link
            href="/faq"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/directory"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors"
          >
            Artist Directory
          </Link>
          <a
            href="https://buymeacoffee.com/topsongs"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-text-secondary transition-colors"
          >
            Support the dev
          </a>
        </p>
      </div>
    </footer>
  );
}
