import { Music, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onReset?: () => void;
  showNewArtist?: boolean;
  logoHref?: string;
  rightContent?: React.ReactNode;
}

export default function Header({
  onReset,
  showNewArtist,
  logoHref,
  rightContent,
}: HeaderProps) {
  const logoContent = (
    <>
      <div className="w-10 h-10 bg-burnt-orange rounded-card flex items-center justify-center border-2 border-burnt-sienna">
        <Music className="w-6 h-6 text-white" />
      </div>
      <div className="text-left">
        <h1 className="font-display text-2xl md:text-3xl font-black text-charcoal-800 tracking-tight">
          Top Songs
        </h1>
        <p className="text-xs text-charcoal-700/60 hidden sm:block">
          Guess the top 10 most-streamed tracks for your favourite artists
        </p>
      </div>
    </>
  );

  return (
    <header className="border-b-2 border-charcoal-700/15 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {logoHref ? (
            <Link
              href={logoHref}
              className="flex items-center gap-3"
            >
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

          <div className="flex items-center gap-3">
            {rightContent}
            {showNewArtist && (
              <button
                onClick={onReset}
                className="btn-secondary text-sm cursor-pointer"
              >
                New Artist
              </button>
            )}
            {!rightContent && (
              <Link
                href="/profile"
                className="w-9 h-9 flex items-center justify-center rounded-full text-charcoal-700/50 hover:text-charcoal-800 hover:bg-charcoal-700/5 transition-colors"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
