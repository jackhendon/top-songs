import { Music, User, RotateCcw, CircleHelp } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onReset?: () => void;
  showNewArtist?: boolean;
  logoHref?: string;
}

export default function Header({
  onReset,
  showNewArtist,
  logoHref,
}: HeaderProps) {
  const logoContent = (
    <>
      <div className="w-10 h-10 bg-mustard rounded-card flex items-center justify-center border-2 border-mustard-hover">
        <Music className="w-6 h-6 text-white" />
      </div>
      <div className="text-left">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-[-0.04em]">
          Top Songs<span className="sr-only">: The Spotify Music Trivia Game</span>
        </h1>
        <p className="text-xs text-text-muted hidden sm:block font-sans font-medium">
          The ultimate music trivia game. Guess the top 10 Spotify streams for your favorite artists.
        </p>
      </div>
    </>
  );

  return (
    <header
      className="bg-card-surface backdrop-blur-sm sticky top-0 z-10"
      style={{ borderBottom: "1px solid var(--raw-card-border)" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {logoHref ? (
            <Link href={logoHref} className="flex items-center gap-3">
              {logoContent}
            </Link>
          ) : (
            <button
              onClick={onReset}
              className="flex items-center gap-3 cursor-pointer"
            >
              {logoContent}
            </button>
          )}

          <div className="flex items-center gap-1">
            {showNewArtist && (onReset ? (
              <button
                onClick={onReset}
                className="btn-secondary text-sm whitespace-nowrap cursor-pointer w-9 h-9 p-0 flex items-center justify-center sm:w-auto sm:h-auto sm:px-4 sm:py-2"
                aria-label="New Game"
              >
                <RotateCcw className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">New Game</span>
              </button>
            ) : (
              <Link
                href="/"
                className="btn-secondary text-sm whitespace-nowrap w-9 h-9 p-0 flex items-center justify-center sm:w-auto sm:h-auto sm:px-4 sm:py-2"
                aria-label="New Game"
              >
                <RotateCcw className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">New Game</span>
              </Link>
            ))}
            <ThemeToggle />
            <Link
              href="/faq"
              className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              aria-label="FAQ & About"
            >
              <CircleHelp className="w-5 h-5" />
            </Link>
            <Link
              href="/profile"
              className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
