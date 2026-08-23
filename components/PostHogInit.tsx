"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics";

export default function PostHogInit() {
  useEffect(() => {
    // initPostHog is a no-op if the visitor has opted out.
    initPostHog();
  }, []);

  return null;
}
