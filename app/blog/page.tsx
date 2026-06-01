import { getAllPosts } from "@/lib/mdx";
import BlogListingClient from "./BlogListingClient";

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogListingClient posts={posts} />;
}
