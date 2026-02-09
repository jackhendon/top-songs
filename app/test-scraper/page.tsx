"use client";

import { useState } from "react";
import { ArtistData } from "../api/artist/route";

export default function TestScraperPage() {
  const [artistName, setArtistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ArtistData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testArtist = async (name: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `/api/artist?name=${encodeURIComponent(name)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artistName.trim()) {
      testArtist(artistName.trim());
    }
  };

  const quickTest = (name: string) => {
    setArtistName(name);
    testArtist(name);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Kworb Scraper Test</h1>

        {/* Quick Test Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => quickTest("Taylor Swift")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test: Taylor Swift
          </button>
          <button
            onClick={() => quickTest("Drake")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test: Drake
          </button>
          <button
            onClick={() => quickTest("The Weeknd")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test: The Weeknd
          </button>
          <button
            onClick={() => quickTest("Bad Bunny")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test: Bad Bunny
          </button>
        </div>

        {/* Custom Artist Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Enter artist name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              {loading ? "Loading..." : "Test"}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Display */}
        {data && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              {data.imageUrl && (
                <img
                  src={data.imageUrl}
                  alt={data.artistName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{data.artistName}</h2>
                <p className="text-sm text-gray-500">
                  Spotify ID: {data.artistId}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Total songs found: {data.songs.length}
            </p>

            <h3 className="text-xl font-semibold mb-3">Top 10 Songs:</h3>
            <div className="space-y-2">
              {data.topTen.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-700 w-8">
                      #{song.rank}
                    </span>
                    <span className="font-medium">{song.title}</span>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{song.totalStreams.toLocaleString()} total</div>
                    <div className="text-xs">
                      {song.dailyStreams.toLocaleString()} daily
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show all songs in collapsed section */}
            {data.songs.length > 10 && (
              <details className="mt-6">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  Show all {data.songs.length} songs
                </summary>
                <div className="mt-3 space-y-1 max-h-96 overflow-y-auto">
                  {data.songs.slice(10).map((song, index) => (
                    <div
                      key={index + 10}
                      className="flex items-center justify-between p-2 text-sm hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-8">#{song.rank}</span>
                        <span>{song.title}</span>
                      </div>
                      <span className="text-gray-600 text-xs">
                        {song.totalStreams.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
