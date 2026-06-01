"use client";

import { useEffect, useState } from "react";
import { useActiveTimer } from "./useActiveTimer";
import { getPostStats, upsertPostStats } from "@/lib/db";

export type PromptType = "rating" | "suggestions" | null;

export function useReadingPrompt(postId: string) {
  const { activeSeconds } = useActiveTimer();
  const [promptType, setPromptType] = useState<PromptType>(null);
  const [dismissed, setDismissed] = useState(false);
  const [secondDismissed, setSecondDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPostStats(postId).then((stats) => {
      if (stats?.promptDismissed) setDismissed(true);
      if (stats?.secondPromptDismissed) setSecondDismissed(true);
      setLoaded(true);
    });
  }, [postId]);

  useEffect(() => {
    if (!loaded) return;
    if (!dismissed && activeSeconds === 180) {
      setPromptType("rating");
    }
    if (!secondDismissed && activeSeconds === 420) {
      setPromptType("suggestions");
    }
  }, [activeSeconds, dismissed, secondDismissed, loaded]);

  const dismiss = async () => {
    if (promptType === "rating") {
      setDismissed(true);
      await upsertPostStats(postId, { promptDismissed: true });
    } else if (promptType === "suggestions") {
      setSecondDismissed(true);
      await upsertPostStats(postId, { secondPromptDismissed: true });
    }
    setPromptType(null);
  };

  const submitRating = async (rating: number, upvoted: boolean) => {
    await upsertPostStats(postId, { rating, upvoted, promptDismissed: true });
    setDismissed(true);
    setPromptType(null);
  };

  return { promptType, dismiss, submitRating, activeSeconds };
}
