import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/mdx";
import SectionLabel from "@/components/ui/SectionLabel";
import BlogCoverArt from "@/components/blog/BlogCoverArt";

interface NextReadSuggestionsProps {
  suggestions: PostMeta[];
}

export default function NextReadSuggestions({ suggestions }: NextReadSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <section
      className="mt-20 pt-12"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <SectionLabel label="Continue Reading" />
      <h3
        className="text-xl font-bold mb-6"
        style={{ fontFamily: "var(--font-ibm)", color: "var(--text)" }}
      >
        Similar Architecture Notes
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {suggestions.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group card overflow-hidden"
            style={{ textDecoration: "none" }}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  <BlogCoverArt slug={post.slug} tags={post.tags} className="transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {post.tags.slice(0, 1).map((tag) => (
                  <span key={tag} className="font-mono text-[10px]" style={{ color: "var(--accent-text)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <h4
                className="text-sm font-semibold line-clamp-2 mb-2"
                style={{ color: "var(--text)", fontFamily: "var(--font-ibm)" }}
              >
                {post.title}
              </h4>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {post.readingTime} min read
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
