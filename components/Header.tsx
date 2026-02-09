import { Music } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className="border-b-2 border-charcoal-700/15 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-burnt-orange rounded-card flex items-center justify-center border-2 border-burnt-sienna">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-800">
                Top Songs
              </h1>
              <p className="text-xs text-charcoal-700/60 hidden sm:block">
                Guess the top 10 most-streamed tracks
              </p>
            </div>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="btn-secondary text-sm cursor-pointer"
            >
              New Artist
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
