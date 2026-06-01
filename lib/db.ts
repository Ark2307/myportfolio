import Dexie, { type EntityTable } from "dexie";

export interface PostStats {
  postId: string;
  isRead: boolean;
  scrollPercent: number;
  totalActiveSeconds: number;
  lastReadAt: number;
  rating?: number;
  upvoted: boolean;
  promptDismissed: boolean;
  secondPromptDismissed: boolean;
}

export interface ReadingSession {
  id?: number;
  postId: string;
  startedAt: number;
  endedAt?: number;
  activeSeconds: number;
  scrollPercent: number;
}

class PortfolioDB extends Dexie {
  postStats!: EntityTable<PostStats, "postId">;
  readingSessions!: EntityTable<ReadingSession, "id">;

  constructor() {
    super("PortfolioDB");
    this.version(1).stores({
      postStats: "postId, isRead, lastReadAt",
      readingSessions: "++id, postId, startedAt",
    });
  }
}

export const db = new PortfolioDB();

export async function getPostStats(postId: string): Promise<PostStats | undefined> {
  return db.postStats.get(postId);
}

export async function upsertPostStats(postId: string, updates: Partial<PostStats>) {
  const existing = await db.postStats.get(postId);
  if (existing) {
    await db.postStats.update(postId, updates);
  } else {
    await db.postStats.add({
      postId,
      isRead: false,
      scrollPercent: 0,
      totalActiveSeconds: 0,
      lastReadAt: Date.now(),
      upvoted: false,
      promptDismissed: false,
      secondPromptDismissed: false,
      ...updates,
    });
  }
}

export async function getAllPostStats(): Promise<PostStats[]> {
  return db.postStats.toArray();
}

export async function saveReadingSession(session: Omit<ReadingSession, "id">) {
  await db.readingSessions.add(session);
}
