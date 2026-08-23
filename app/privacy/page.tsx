import Link from "next/link";
import AnalyticsPreference from "@/components/AnalyticsPreference";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy - Top Songs",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header logoHref="/" showNewArtist asHeading={false} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-6">
          Privacy Policy
        </h1>

        <p className="text-xs text-text-muted font-sans mb-6">
          Last updated: 23 August 2026
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
              Analytics run in a cookieless mode. Nothing is written to your
              device that survives the browser tab you are using: PostHog keeps
              its session identifier in <code>sessionStorage</code>, which your
              browser discards when the tab closes. We do not set cookies, we
              do not build a profile that follows you between visits, and we do
              not share anything with advertisers.
            </p>
            <p>
              Because no persistent identifier is stored, we rely on legitimate
              interest under UK GDPR rather than consent, as permitted for
              measurement that does not track individuals. You can opt out at
              any time and the choice is remembered:
            </p>
            <AnalyticsPreference />
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
                <span className="text-text-secondary">Analytics opt-out</span>{" "}
                &mdash; set only if you choose to opt out above
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
              PostHog&apos;s cookieless mode, and analytics requests are routed
              through topsongs.io rather than directly to PostHog, so no
              third-party domain sees your visit.
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
