import { notFound } from "next/navigation";
import { getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/mdx";
import { getSuggestions } from "@/lib/suggestions";
import { SITE_NAME, buildBlogPostingJsonLd } from "@/lib/seo";
import BlogPostClient from "./BlogPostClient";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  // Relative URLs here resolve against `metadataBase` (set in app/layout.tsx),
  // so no manual origin-joining is needed for openGraph/twitter/canonical.
  const image = post.coverImage ?? `/blog/${slug}/opengraph-image`;

  return {
    title: `${post.title} — ${SITE_NAME}`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post.date || undefined,
      tags: post.tags,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const suggestions = getSuggestions(post, allPosts, new Set<string>(), 3);
  const jsonLd = buildBlogPostingJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data built server-side from our own frontmatter — not
        // user input, so no sanitization is needed for this injection.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} suggestions={suggestions} />
    </>
  );
}
