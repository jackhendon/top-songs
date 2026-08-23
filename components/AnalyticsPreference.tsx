"use client";

import { useEffect, useState } from "react";
import { hasOptedOut, setOptedOut } from "@/lib/analytics";

export default function AnalyticsPreference() {
  const [optedOut, setOptedOutState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOptedOutState(hasOptedOut());
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !optedOut;
    setOptedOut(next);
    setOptedOutState(next);
  };

  return (
    <div className="card p-4 mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <p className="flex-1 text-sm text-text-secondary font-sans">
        {ready && optedOut
          ? "You are opted out. No analytics events are being sent from this browser."
          : "Anonymous analytics are on. Nothing that identifies you is collected, and nothing is stored beyond this browser tab."}
      </p>
      <button
        onClick={toggle}
        className={
          optedOut ? "btn-primary text-sm shrink-0" : "btn-secondary text-sm shrink-0"
        }
        disabled={!ready}
      >
        {optedOut ? "Turn analytics on" : "Opt out of analytics"}
      </button>
    </div>
  );
}
