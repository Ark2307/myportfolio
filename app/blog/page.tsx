import { getAllPosts } from "@/lib/mdx";
import BlogListingClient from "./BlogListingClient";

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  const posts = getAllPosts();
  return <BlogListingClient posts={posts} initialTag={tag ?? null} />;
}
