import type { Metadata } from "next";
import { getAllPosts } from "@/lib/mdx";
import BlogListingClient from "./BlogListingClient";

const TITLE = "Technical Writing — Aryan Khandelwal";
const DESCRIPTION =
  "Notes on distributed systems, AI infrastructure, databases, and observability. Written for engineers who want depth, not surface-level takes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Relative URLs resolve against `metadataBase` (app/layout.tsx).
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  const posts = getAllPosts();
  return <BlogListingClient posts={posts} initialTag={tag ?? null} />;
}
