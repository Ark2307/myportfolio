"use client";

import { useCallback, useEffect, useState } from "react";

interface EngagementCounts {
  views: number;
  likes: number;
  useful: number;
}

type Action = "view" | "like" | "unlike" | "useful";

async function postAction(slug: string, action: Action): Promise<EngagementCounts | null> {
  try {
    const res = await fetch(`/api/engagement/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Global view/like/useful counts come from the server; whether *this*
 * browser has already viewed/liked/voted lives in localStorage — no
 * accounts, no server-side visitor tracking, matching a personal blog's
 * threat model (a cleared localStorage can re-vote, and that's fine).
 */
export function useEngagement(slug: string) {
  const [counts, setCounts] = useState<EngagementCounts>({ views: 0, likes: 0, useful: 0 });
  const [liked, setLiked] = useState(false);
  const [votedUseful, setVotedUseful] = useState(false);

  useEffect(() => {
    setLiked(window.localStorage.getItem(`liked:${slug}`) === "1");
    setVotedUseful(window.localStorage.getItem(`useful:${slug}`) === "1");

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/engagement/${slug}`);
        const data: EngagementCounts = res.ok
          ? await res.json()
          : { views: 0, likes: 0, useful: 0 };
        if (cancelled) return;
        setCounts(data);
      } catch {
        if (cancelled) return;
      }

      const viewedKey = `viewed:${slug}`;
      if (!window.localStorage.getItem(viewedKey)) {
        window.localStorage.setItem(viewedKey, "1");
        const updated = await postAction(slug, "view");
        if (!cancelled && updated) setCounts(updated);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toggleLike = useCallback(async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCounts((c) => ({ ...c, likes: c.likes + (nextLiked ? 1 : -1) }));
    window.localStorage.setItem(`liked:${slug}`, nextLiked ? "1" : "0");

    const updated = await postAction(slug, nextLiked ? "like" : "unlike");
    if (updated) setCounts(updated);
  }, [slug, liked]);

  const voteUseful = useCallback(async () => {
    if (votedUseful) return;
    setVotedUseful(true);
    setCounts((c) => ({ ...c, useful: c.useful + 1 }));
    window.localStorage.setItem(`useful:${slug}`, "1");

    const updated = await postAction(slug, "useful");
    if (updated) setCounts(updated);
  }, [slug, votedUseful]);

  return { ...counts, liked, votedUseful, toggleLike, voteUseful };
}
