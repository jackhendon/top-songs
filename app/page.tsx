import Header from "@/components/Header";
import ArtistSelector from "@/components/ArtistSelector";
import Footer from "@/components/Footer";
import ModePicker from "@/components/ModePicker";
import { getDailyArtistSlug, ARTIST_BIOS } from "@/lib/artistBios";
import { getArtistMetadata } from "@/lib/getArtistMetadata";
import { slugToArtistName } from "@/lib/slugs";

export default async function HomePage() {
  const dailySlug = getDailyArtistSlug();
  const dailyName = slugToArtistName(dailySlug);
  const meta = await getArtistMetadata(dailyName);
  const dailyArtist = {
    slug: dailySlug,
    name: dailyName,
    imageUrl: meta?.imageUrl,
    bio: ARTIST_BIOS[dailySlug],
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <ArtistSelector dailyArtist={dailyArtist} />
        <ModePicker />
        <section className="mt-8 px-2">
          <h2 className="font-display text-base font-bold text-text-secondary mb-2 tracking-[-0.02em]">
            Why Play Top Songs?
          </h2>
          <p className="text-sm text-text-muted font-sans leading-relaxed">
            TopSongs.io is a set of free browser games built on Spotify
            streaming data rather than opinion. Guess any artist&apos;s ten
            most-streamed songs across nearly 3,000 artists, play higher or
            lower on stream counts, or take the daily challenge, where everyone
            gets the same chain and a single attempt. The figures come from
            Kworb.net, which estimates totals from Spotify chart performance,
            and are refreshed every week. They are approximations rather than
            official counts, but they are consistent, which is what makes them
            worth guessing at.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
