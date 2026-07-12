import { getAllPosts } from "@/lib/mdx";
import Hero from "@/components/home/Hero";
import AboutSpec from "@/components/home/AboutSpec";
import Journey from "@/components/home/Journey";
import LatestNotes from "@/components/home/LatestNotes";
import ResearchAreas from "@/components/home/ResearchAreas";

export default function HomePage() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <Hero />
      <AboutSpec />
      <Journey />
      <LatestNotes posts={latestPosts} />
      <ResearchAreas posts={posts} />
    </>
  );
}
