"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { upsertPostStats } from "@/lib/db";

export function useReadingProgress(postId: string, initialPercent = 0) {
  const [progress, setProgress] = useState(initialPercent);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestProgress = useRef(initialPercent);

  const persist = useCallback(
    (percent: number) => {
      upsertPostStats(postId, {
        scrollPercent: percent,
        isRead: percent >= 80,
        lastReadAt: Date.now(),
      });
    },
    [postId]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      setProgress(percent);
      latestProgress.current = percent;

      // Debounce persist by 5s
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(percent), 5000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      persist(latestProgress.current);
    };
  }, [persist]);

  return progress;
}
