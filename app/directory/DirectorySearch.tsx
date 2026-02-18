"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
  initialValue: string;
  totalCount: number;
}

export default function DirectorySearch({ initialValue, totalCount }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = (q: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(`/directory${params.toString() ? `?${params}` : ""}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate(q), 350);
  };

  const handleClear = () => {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={`Search ${totalCount.toLocaleString()} artists…`}
        className="input-field w-full pl-10 pr-10"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search artists"
      />
      {value && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-secondary"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
