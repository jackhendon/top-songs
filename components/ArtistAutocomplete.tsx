"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Music2 } from "lucide-react";
import {
  searchArtists,
  getPopularSuggestions,
  ArtistAutocompleteItem,
} from "@/lib/artistAutocomplete";

interface ArtistAutocompleteProps {
  onSelect: (slug: string) => void;
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export default function ArtistAutocomplete({
  onSelect,
  onSubmit,
  disabled = false,
}: ArtistAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ArtistAutocompleteItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const popularSuggestions = useRef(getPopularSuggestions(8)).current;

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      // Show popular artists when query is empty but dropdown is open
      if (isOpen) {
        setSuggestions(popularSuggestions);
      }
      return;
    }

    debounceRef.current = setTimeout(() => {
      const results = searchArtists(query);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, isOpen, popularSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectItem(suggestions[highlightedIndex]);
      } else if (query.trim()) {
        handleFreeformSubmit();
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && containerRef.current) {
      const dropdown = containerRef.current.querySelector(
        "#artist-suggestions",
      );
      const highlightedElement = dropdown?.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelectItem = (artist: ArtistAutocompleteItem) => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(artist.slug);
  };

  const handleFreeformSubmit = () => {
    if (!query.trim()) return;
    const submitted = query.trim();
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSubmit(submitted);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFocus = () => {
    if (!query.trim()) {
      setSuggestions(popularSuggestions);
    }
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Input + Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint w-4 h-4 sm:w-5 sm:h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Search for an artist..."
            className="input-field w-full pl-10 sm:pl-11 text-sm sm:text-base"
            disabled={disabled}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="artist-suggestions"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `artist-suggestion-${highlightedIndex}`
                : undefined
            }
          />
        </div>
        <button
          type="button"
          disabled={disabled || !query.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
          onClick={handleFreeformSubmit}
        >
          {disabled ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
              Loading
            </span>
          ) : (
            "Play"
          )}
        </button>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="artist-suggestions"
          role="listbox"
          className="autocomplete-dropdown"
        >
          {suggestions.map((artist, index) => (
            <button
              key={artist.slug}
              id={`artist-suggestion-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              data-highlighted={index === highlightedIndex}
              className="autocomplete-item"
              onClick={() => handleSelectItem(artist)}
              onMouseEnter={() => setHighlightedIndex(index)}
              type="button"
            >
              <Music2 className="autocomplete-item-icon w-4 h-4 shrink-0" />
              <span className="truncate">{artist.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
