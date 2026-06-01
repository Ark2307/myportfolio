"use client";

import { useReadingProgress } from "@/hooks/useReadingProgress";

interface ReadingProgressProps {
  postId: string;
  initialPercent?: number;
}

export default function ReadingProgress({ postId, initialPercent = 0 }: ReadingProgressProps) {
  const progress = useReadingProgress(postId, initialPercent);

  return (
    <div
      className="reading-progress-bar"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
