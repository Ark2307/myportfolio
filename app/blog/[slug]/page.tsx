import { notFound } from "next/navigation";
import { getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/mdx";
import { getSuggestions } from "@/lib/suggestions";
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
  return {
    title: `${post.title} — Aryan Khandelwal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const suggestions = getSuggestions(post, allPosts, new Set<string>(), 3);

  return <BlogPostClient post={post} suggestions={suggestions} />;
}
