import type { PostMeta } from "./mdx";

export function getSuggestions(
  currentPost: PostMeta,
  allPosts: PostMeta[],
  readPostIds: Set<string>,
  count = 3
): PostMeta[] {
  const others = allPosts.filter((p) => p.slug !== currentPost.slug);

  const scored = others.map((post) => {
    const sharedTags = post.tags.filter((t) => currentPost.tags.includes(t)).length;
    // Slightly prefer unread posts
    const readPenalty = readPostIds.has(post.slug) ? 0.5 : 0;
    return { post, score: sharedTags - readPenalty };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.post);
}
