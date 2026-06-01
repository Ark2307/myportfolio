"use client";

import { useEffect, useRef, useState } from "react";

export function useActiveTimer() {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startInterval = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        setActiveSeconds((s) => s + 1);
      }, 1000);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsActive(false);
        stopInterval();
      } else {
        setIsActive(true);
        startInterval();
      }
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { activeSeconds, isActive };
}
