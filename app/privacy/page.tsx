import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy - Top Songs",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-6">
          Privacy Policy
        </h1>

        <p className="text-xs text-text-muted font-sans mb-6">
          Last updated: 15 February 2026
        </p>

        <div className="space-y-6 text-sm text-text-secondary font-sans leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              What we collect
            </h2>
            <p>
              Top Songs uses{" "}
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                PostHog
              </a>{" "}
              for anonymous analytics. PostHog may collect your IP address,
              approximate location, browser type, and pages visited. No
              accounts, cookies, or personally identifiable information are
              required to use this site.
            </p>
            <p>
              In accordance with UK GDPR and the Privacy and Electronic
              Communications Regulations (PECR), analytics are only activated
              after you give consent via the banner shown on your first visit.
              You can change your analytics preference at any time by clearing
              your browser&apos;s localStorage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Local storage
            </h2>
            <p>
              We store a small amount of data in your browser&apos;s
              localStorage to improve your experience:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-text-muted">
              <li>
                <span className="text-text-secondary">Theme preference</span>{" "}
                &mdash; light or dark mode
              </li>
              <li>
                <span className="text-text-secondary">Game history</span>{" "}
                &mdash; artists played, scores, and outcomes
              </li>
              <li>
                <span className="text-text-secondary">Analytics consent</span>{" "}
                &mdash; whether you accepted or declined analytics
              </li>
            </ul>
            <p className="mt-2">
              This data never leaves your device. You can clear it at any time
              from your browser settings or the{" "}
              <Link
                href="/profile"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                profile page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Third-party services
            </h2>
            <p>
              PostHog is the only third-party service that receives data from
              your visit. You can read their privacy policy at{" "}
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mustard dark:text-mint underline underline-offset-2"
              >
                posthog.com/privacy
              </a>
              . Data retention follows PostHog&apos;s standard policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              No cookies
            </h2>
            <p>
              This site does not set any cookies. Analytics are handled via
              PostHog&apos;s cookieless mode.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Contact
            </h2>
            <p>
              If you have questions about this policy, reach out via email at
              dev@topsongs.io.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
