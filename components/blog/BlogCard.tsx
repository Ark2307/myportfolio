"use client";

import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/mdx";
import BlogCoverArt from "@/components/blog/BlogCoverArt";
import { getTagColor } from "@/lib/researchAreas";

const NEW_WITHIN_DAYS = 45;

function isNewPost(dateStr: string, now: number): boolean {
  if (!dateStr) return false;
  const ageMs = now - new Date(dateStr).getTime();
  return ageMs >= 0 && ageMs <= NEW_WITHIN_DAYS * 24 * 60 * 60 * 1000;
}

interface BlogCardProps {
  post: PostMeta;
  scrollPercent: number;
  isRead: boolean;
  now?: number;
}

export default function BlogCard({ post, scrollPercent, isRead, now = Date.now() }: BlogCardProps) {
  const hasStarted = scrollPercent > 0;
  // "NEW" means untouched, not just recently published — a post you've
  // already opened shouldn't still read as new, regardless of its age.
  const isNew = isNewPost(post.date, now) && !hasStarted;
  const isInProgress = hasStarted && !isRead;

  return (
    <Link href={`/blog/${post.slug}`} className="block group card h-full" style={{ textDecoration: "none" }}>
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 overflow-hidden">
            <BlogCoverArt slug={post.slug} tags={post.tags} className="transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}
        {isNew && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded font-mono text-[10px] font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            NEW
          </span>
        )}
        {isInProgress && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded font-mono text-[10px] font-medium"
            style={{ background: "var(--surface)", color: "var(--status-amber)", border: "1px solid var(--border)" }}
          >
            IN PROGRESS
          </span>
        )}
        {isRead && (
          <span
            className="absolute top-2 right-2 px-2 py-0.5 rounded font-mono text-[10px] font-medium"
            style={{ background: "var(--surface)", color: "var(--status-green)", border: "1px solid var(--border)" }}
          >
            ✓ READ
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="tag"
              style={{
                background: `${getTagColor(tag)}1a`,
                color: getTagColor(tag),
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold leading-snug line-clamp-2"
          style={{ color: "var(--text)", fontFamily: "var(--font-ibm)" }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-auto font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>

        {/* Progress bar */}
        {scrollPercent > 0 && (
          <div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${scrollPercent}%`, background: "var(--accent)" }}
              />
            </div>
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
              {scrollPercent}% read
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
