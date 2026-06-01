"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useReadingPrompt } from "@/hooks/useReadingPrompt";
import type { PostMeta } from "@/lib/mdx";
import Link from "next/link";

interface ReadingPromptProps {
  postId: string;
  suggestions: PostMeta[];
}

export default function ReadingPrompt({ postId, suggestions }: ReadingPromptProps) {
  const { promptType, dismiss, submitRating } = useReadingPrompt(postId);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <AnimatePresence>
      {promptType && (
        <motion.div
          key={promptType}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 w-80 rounded-xl shadow-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-lg)",
          }}
          role="dialog"
          aria-live="polite"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="font-mono text-xs font-medium" style={{ color: "var(--accent)" }}>
              {promptType === "rating" ? "// ENJOYING_THIS?" : "// SIMILAR_READS"}
            </span>
            <button
              onClick={dismiss}
              className="p-1 rounded transition-colors hover:bg-[var(--surface-2)]"
              aria-label="Dismiss"
            >
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {promptType === "rating" ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "var(--text)" }}>
                  You&apos;ve been reading for 3 minutes. How&apos;s this note?
                </p>

                {/* Dot rating */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(n)}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        background:
                          n <= (hoverRating || selectedRating)
                            ? "var(--accent)"
                            : "transparent",
                        borderColor:
                          n <= (hoverRating || selectedRating)
                            ? "var(--accent)"
                            : "var(--border-strong)",
                      }}
                      aria-label={`Rate ${n} of 5`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => submitRating(selectedRating, true)}
                    disabled={selectedRating === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    <ThumbsUp size={13} />
                    Submit
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-3 py-2 rounded-lg text-sm transition-all"
                    style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "var(--text)" }}>
                  You might enjoy these next:
                </p>
                {suggestions.slice(0, 2).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    onClick={dismiss}
                    className="block p-3 rounded-lg transition-colors"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <div className="text-xs font-mono mb-1" style={{ color: "var(--accent)" }}>
                      {post.tags[0]}
                    </div>
                    <div className="text-sm font-medium line-clamp-2" style={{ color: "var(--text)" }}>
                      {post.title}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {post.readingTime} min read
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
