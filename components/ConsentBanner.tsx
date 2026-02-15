"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent, initPostHog } from "@/lib/analytics";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAccept() {
    setConsent("yes");
    initPostHog();
    setVisible(false);
  }

  function handleDecline() {
    setConsent("no");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 fade-in">
      <div className="border-t border-border-primary bg-card-surface px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <p className="text-sm text-text-secondary font-sans flex-1">
            We use anonymous analytics (no cookies, no personal data) to
            understand how people play. Nothing is sent until you agree.{" "}
            <Link
              href="/privacy"
              className="text-mustard dark:text-mint underline underline-offset-2"
            >
              Privacy&nbsp;policy
            </Link>
          </p>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleDecline} className="btn-secondary text-sm">
              Decline
            </button>
            <button onClick={handleAccept} className="btn-primary text-sm">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
