import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

interface Engagement {
  views: number;
  likes: number;
  useful: number;
}

const EMPTY: Engagement = { views: 0, likes: 0, useful: 0 };

type Action = "view" | "like" | "unlike" | "useful";
const ACTIONS: Action[] = ["view", "like", "unlike", "useful"];

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const redis = getRedis();
  if (!redis) return NextResponse.json(EMPTY);

  try {
    const [views, likes, useful] = await Promise.all([
      redis.get<number>(`views:${slug}`),
      redis.get<number>(`likes:${slug}`),
      redis.get<number>(`useful:${slug}`),
    ]);
    return NextResponse.json({
      views: views ?? 0,
      likes: likes ?? 0,
      useful: useful ?? 0,
    });
  } catch {
    return NextResponse.json(EMPTY);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action as Action | undefined;

  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return NextResponse.json(EMPTY);

  try {
    switch (action) {
      case "view":
        await redis.incr(`views:${slug}`);
        break;
      case "like":
        await redis.incr(`likes:${slug}`);
        break;
      case "unlike":
        await redis.decr(`likes:${slug}`);
        break;
      case "useful":
        await redis.incr(`useful:${slug}`);
        break;
    }

    const [views, likes, useful] = await Promise.all([
      redis.get<number>(`views:${slug}`),
      redis.get<number>(`likes:${slug}`),
      redis.get<number>(`useful:${slug}`),
    ]);
    return NextResponse.json({
      views: views ?? 0,
      likes: likes ?? 0,
      useful: useful ?? 0,
    });
  } catch {
    return NextResponse.json(EMPTY);
  }
}
