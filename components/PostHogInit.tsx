"use client";

import { useEffect } from "react";
import { initPostHog, hasConsented } from "@/lib/analytics";

export default function PostHogInit() {
  useEffect(() => {
    if (hasConsented()) {
      initPostHog();
    }
  }, []);

  return null;
}
