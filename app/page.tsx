import { getAllPosts } from "@/lib/mdx";
import Hero from "@/components/home/Hero";
import StatsStrip from "@/components/home/StatsStrip";
import ArchitectureDiagram from "@/components/home/ArchitectureDiagram";
import LatestNotes from "@/components/home/LatestNotes";
import ResearchAreas from "@/components/home/ResearchAreas";
import Projects from "@/components/home/Projects";
import AboutSpec from "@/components/home/AboutSpec";

export default function HomePage() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <Hero />
      <StatsStrip />
      <ArchitectureDiagram />
      <LatestNotes posts={latestPosts} />
      <ResearchAreas posts={posts} />
      <Projects />
      <AboutSpec />
    </>
  );
}
