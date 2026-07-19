import type { Post } from "@/lib/mdx";

export const SITE_NAME = "Aryan Khandelwal";

// Set NEXT_PUBLIC_SITE_URL in production to the real deployed domain — this
// fallback only exists so metadata/JSON-LD URLs resolve during local dev.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function postOgImageUrl(slug: string): string {
  return absoluteUrl(`/blog/${slug}/opengraph-image`);
}

/**
 * `BlogPosting` JSON-LD for a single post — read by search engines to power
 * rich results (author, publish date, article type) beyond what plain
 * <meta> tags convey.
 */
export function buildBlogPostingJsonLd(post: Post) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.coverImage ? absoluteUrl(post.coverImage) : postOgImageUrl(post.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image,
    datePublished: post.date || undefined,
    dateModified: post.date || undefined,
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
    author: { "@type": "Person", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: { "@type": "Person", name: SITE_NAME, url: absoluteUrl("/") },
  };
}
