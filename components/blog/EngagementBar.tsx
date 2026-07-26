"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ThumbsUp, Link2, Eye, Check } from "lucide-react";
import { useEngagement } from "@/hooks/useEngagement";

interface EngagementBarProps {
  slug: string;
  readingTime: number;
}

export default function EngagementBar({ slug, readingTime }: EngagementBarProps) {
  const { views, likes, useful, liked, votedUseful, toggleLike, voteUseful } =
    useEngagement(slug);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="mt-10 pt-6 flex flex-wrap items-center gap-3 font-mono text-xs"
      style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
    >
      <button
        onClick={voteUseful}
        disabled={votedUseful}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors disabled:opacity-60"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <ThumbsUp size={13} style={{ color: votedUseful ? "var(--accent-text)" : "var(--text-muted)" }} />
        {votedUseful ? "Thanks!" : "Was this useful?"}
        {useful > 0 && <span>· {useful}</span>}
      </button>

      <button
        onClick={toggleLike}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <Heart
          size={13}
          fill={liked ? "var(--accent-text)" : "none"}
          style={{ color: liked ? "var(--accent-text)" : "var(--text-muted)" }}
        />
        Like
        {likes > 0 && <span>· {likes}</span>}
      </button>

      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>

      <button
        onClick={shareOnLinkedIn}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <Image src="/linkedin.svg" alt="" width={13} height={13} />
        Share on LinkedIn
      </button>

      <span className="inline-flex items-center gap-1.5 ml-auto">
        <Eye size={13} />
        {views}
      </span>
      <span>·</span>
      <span>{readingTime} min read</span>
    </div>
  );
}
