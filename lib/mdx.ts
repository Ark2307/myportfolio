import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostCategory = "blog" | "experience" | "theory";

export interface PostMeta {
  slug: string;
  category: PostCategory;
  title: string;
  date: string;
  tags: string[];
  coverImage?: string;
  excerpt: string;
  readingTime: number;
}

export interface Post extends PostMeta {
  content: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

const CATEGORY_DIRS: Record<PostCategory, { exts: string[] }> = {
  blog:       { exts: [".mdx", ".md"] },
  experience: { exts: [".mdx", ".md"] },
  theory:     { exts: [".mdx", ".md"] },
};

function wordsToMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 265));
}

function readDir(category: PostCategory): PostMeta[] {
  const dir = path.join(CONTENT_ROOT, category);
  if (!fs.existsSync(dir)) return [];

  const exts = CATEGORY_DIRS[category].exts;
  const files = fs
    .readdirSync(dir)
    .filter((f) => exts.some((ext) => f.endsWith(ext)));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);

      // Skip files with no meaningful content or frontmatter title
      if (!data.title && content.trim().length < 10) return null;

      return {
        slug,
        category,
        title: data.title ?? slug.replace(/-/g, " "),
        date: data.date ?? "",
        tags: data.tags ?? [],
        coverImage: data.coverImage,
        excerpt: data.excerpt ?? content.trim().slice(0, 160).replace(/\n/g, " "),
        readingTime: wordsToMinutes(content),
      } satisfies PostMeta;
    })
    .filter((p): p is PostMeta => p !== null);
}

export function getAllPosts(categories?: PostCategory[]): PostMeta[] {
  const cats: PostCategory[] = categories ?? ["blog", "experience", "theory"];
  return cats
    .flatMap((c) => readDir(c))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, category?: PostCategory): Post | null {
  const cats: PostCategory[] = category ? [category] : ["blog", "experience", "theory"];

  for (const cat of cats) {
    const dir = path.join(CONTENT_ROOT, cat);
    for (const ext of [".mdx", ".md"]) {
      const filePath = path.join(dir, `${slug}${ext}`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);
        return {
          slug,
          category: cat,
          title: data.title ?? slug.replace(/-/g, " "),
          date: data.date ?? "",
          tags: data.tags ?? [],
          coverImage: data.coverImage,
          excerpt: data.excerpt ?? content.trim().slice(0, 160).replace(/\n/g, " "),
          readingTime: wordsToMinutes(content),
          content,
        };
      }
    }
  }
  return null;
}

export function getAllSlugs(): { slug: string; category: PostCategory }[] {
  const cats: PostCategory[] = ["blog", "experience", "theory"];
  return cats.flatMap((cat) => {
    const dir = path.join(CONTENT_ROOT, cat);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => ({ slug: f.replace(/\.(mdx|md)$/, ""), category: cat }));
  });
}
