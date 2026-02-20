import Header from "@/components/Header";
import ArtistSelector from "@/components/ArtistSelector";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <ArtistSelector />
        <section className="mt-8 px-2">
          <h2 className="font-display text-base font-bold text-text-secondary mb-2 tracking-[-0.02em]">
            Why Play Top Songs?
          </h2>
          <p className="text-sm text-text-muted font-sans leading-relaxed">
            TopSongs.io is a free browser-based music game that tests your knowledge of the streaming era. Unlike traditional music quizzes, we focus on real Spotify data. Test your memory against the charts with thousands of artists from Taylor Swift to indie legends.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
