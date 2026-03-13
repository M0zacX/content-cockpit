"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { Skit, Influencer } from "@/lib/store";

/* ═══════════════════════════════════════════════════
   DB ↔ App field mapping (snake_case ↔ camelCase)
   ═══════════════════════════════════════════════════ */

interface DbSkit {
  id: string;
  user_id: string;
  board_id: string;
  inspiration: string;
  links: string;
  cast_size: string;
  characters: string;
  category: string;
  style_ref: string;
  script: string;
  environment: string;
  status: string;
  approved?: boolean | null;
  is_public?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface DbInfluencer {
  id: string;
  user_id: string;
  name: string;
  handle: string;
  avatar: string;
  platforms: { platform: string; url: string }[];
  tags: string[];
  favorite: boolean;
  guide_content: string;
  is_private: boolean;
  created_at: string;
}

interface DbCategory {
  id: string;
  user_id: string;
  board_id: string;
  name: string;
  sort_order: number;
}

function dbToSkit(d: DbSkit): Skit {
  return {
    id: d.id,
    inspiration: d.inspiration,
    links: d.links ?? "",
    castSize: d.cast_size,
    characters: d.characters,
    category: d.category,
    styleRef: d.style_ref,
    script: d.script,
    environment: d.environment,
    status: d.status,
    approved: d.approved ?? null,
    isPublic: d.is_public ?? false,
    sort_order: d.sort_order ?? 0,
  };
}

function skitToDb(s: Skit, userId: string, boardId: string): Omit<DbSkit, "created_at" | "updated_at"> {
  return {
    id: s.id,
    user_id: userId,
    board_id: boardId,
    inspiration: s.inspiration,
    links: s.links ?? "",
    cast_size: s.castSize,
    characters: s.characters,
    category: s.category,
    style_ref: s.styleRef,
    script: s.script,
    environment: s.environment,
    status: s.status,
    approved: s.approved ?? null,
    is_public: s.isPublic ?? false,
    sort_order: s.sort_order ?? 0,
  };
}

function dbToInfluencer(d: DbInfluencer): Influencer & { isPrivate: boolean } {
  return {
    id: d.id,
    name: d.name,
    handle: d.handle,
    avatar: d.avatar,
    platforms: d.platforms || [],
    tags: d.tags || [],
    favorite: d.favorite,
    guideContent: d.guide_content,
    isPrivate: d.is_private,
  };
}

function influencerToDb(
  inf: Influencer & { isPrivate?: boolean },
  userId: string
): Omit<DbInfluencer, "created_at"> {
  return {
    id: inf.id,
    user_id: userId,
    name: inf.name,
    handle: inf.handle,
    avatar: inf.avatar,
    platforms: inf.platforms,
    tags: inf.tags,
    favorite: inf.favorite,
    guide_content: inf.guideContent,
    is_private: inf.isPrivate ?? false,
  };
}

/* ═══════════════════════════════════════════════════
   DEBOUNCE HELPER
   ═══════════════════════════════════════════════════ */
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/use-memo */
function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(fn);
  useEffect(() => { latest.current = fn; }, [fn]);

  return useCallback(
    ((...args: any[]) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    }) as T,
    [delay] // eslint-disable-line react-hooks/exhaustive-deps
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any, react-hooks/use-memo */

/* ═══════════════════════════════════════════════════
   DEFAULT CATEGORIES
   ═══════════════════════════════════════════════════ */
const DEFAULT_CATEGORIES = ["Killer Script", "AI Agent", "Corporate", "Tech/Startup"];

/* ═══════════════════════════════════════════════════
   SESSION STORAGE CACHE (survives page refreshes)
   ═══════════════════════════════════════════════════ */
interface CachedData {
  skits: Skit[];
  influencers: SupabaseInfluencer[];
  categories: string[];
}

const CACHE_PREFIX = "board_data_";

function readCache(boardId: string): CachedData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + boardId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(boardId: string, data: CachedData) {
  try { sessionStorage.setItem(CACHE_PREFIX + boardId, JSON.stringify(data)); } catch {}
}

function updateCache(boardId: string, partial: Partial<CachedData>) {
  const existing = readCache(boardId);
  if (existing) {
    writeCache(boardId, { ...existing, ...partial });
  }
}

/* ═══════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════ */
export interface SupabaseInfluencer extends Influencer {
  isPrivate: boolean;
}

export function useSupabaseData(boardId: string | null) {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  // This hook runs inside a component rendered with ssr: false,
  // so sessionStorage is always available in useState initializers.
  const cached = boardId ? readCache(boardId) : null;
  const [skits, setSkitsState] = useState<Skit[]>(cached?.skits ?? []);
  const [influencers, setInfluencersState] = useState<SupabaseInfluencer[]>(cached?.influencers ?? []);
  const [categories, setCategoriesState] = useState<string[]>(cached?.categories ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const supabase = supabaseRef.current;

  // Track what we've already fetched to prevent re-fetching on tab switch
  const fetchedForRef = useRef<string | null>(null);

  /* ─── Fetch all data (stale-while-revalidate) ─── */
  useEffect(() => {
    // For owned/editor boards we need user; for public boards boardId is enough
    if (!boardId) { setLoading(false); return; }

    // Only fetch once per board (prevents tab-switch and auth-change re-fetches)
    if (fetchedForRef.current === boardId) return;
    fetchedForRef.current = boardId;

    let cancelled = false;
    const hasCached = !!readCache(boardId);

    async function load() {
      // Only show spinner if no cached data
      if (!hasCached) {
        setLoading(true);
      }
      setError(null);

      try {
        const [skitsRes, influencersRes, categoriesRes] = await Promise.all([
          supabase.from("skits").select("*")
            .eq("board_id", boardId)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true }),
          supabase.from("influencers").select("*").order("created_at", { ascending: true }),
          supabase.from("categories").select("*")
            .eq("board_id", boardId)
            .order("sort_order", { ascending: true }),
        ]);

        if (cancelled) return;

        if (skitsRes.error) throw skitsRes.error;
        if (influencersRes.error) throw influencersRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        const newSkits = (skitsRes.data as DbSkit[]).map(dbToSkit);
        const newInfluencers = (influencersRes.data as DbInfluencer[]).map(dbToInfluencer);
        const newCategories = categoriesRes.data.length > 0
          ? (categoriesRes.data as DbCategory[]).map(c => c.name)
          : DEFAULT_CATEGORIES;

        setSkitsState(newSkits);
        setInfluencersState(newInfluencers);
        setCategoriesState(newCategories);

        // Update cache
        writeCache(boardId!, { skits: newSkits, influencers: newInfluencers, categories: newCategories });

        // Seed default categories if board has none (only for authenticated owner)
        if (categoriesRes.data.length === 0 && userRef.current) {
          await supabase.from("categories").insert(
            DEFAULT_CATEGORIES.map((name, i) => ({
              user_id: userRef.current!.id,
              board_id: boardId,
              name,
              sort_order: i,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      // Reset so React strict mode re-mount can re-fetch
      fetchedForRef.current = null;
    };
  }, [supabase, boardId]);

  /* ─── Persist skits (debounced upsert) ─── */
  const debouncedSkitSync = useDebouncedCallback(async (nextSkits: Skit[]) => {
    if (!user || !boardId) return;
    const dbRows = nextSkits.map(s => ({
      ...skitToDb(s, user.id, boardId),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("skits").upsert(dbRows, { onConflict: "id" });
    if (error) console.error("Skit sync error:", error.message);
  }, 500);

  const persistSkits = useCallback(
    (next: Skit[]) => {
      setSkitsState(next);
      if (boardId) updateCache(boardId, { skits: next });
      debouncedSkitSync(next as unknown as never[]);
    },
    [debouncedSkitSync, boardId]
  );

  /* ─── Delete skits ─── */
  const deleteSkits = useCallback(
    async (ids: string[]) => {
      if (!user) return;
      setSkitsState(prev => {
        const next = prev.filter(s => !ids.includes(s.id));
        if (boardId) updateCache(boardId, { skits: next });
        return next;
      });
      const { error } = await supabase.from("skits").delete().in("id", ids);
      if (error) console.error("Delete skit error:", error.message);
    },
    [user, supabase, boardId]
  );

  /* ─── Move skits to another board ─── */
  const moveSkits = useCallback(
    async (ids: string[], targetBoardId: string) => {
      if (!user) return;
      setSkitsState(prev => {
        const next = prev.filter(s => !ids.includes(s.id));
        if (boardId) updateCache(boardId, { skits: next });
        return next;
      });
      const { error } = await supabase.from("skits").update({ board_id: targetBoardId }).in("id", ids);
      if (error) console.error("Move skit error:", error.message);
    },
    [user, supabase, boardId]
  );

  /* ─── Persist influencers ─── */
  const persistInfluencers = useCallback(
    async (infs: SupabaseInfluencer[]) => {
      if (!user) return;
      setInfluencersState(infs);
      if (boardId) updateCache(boardId, { influencers: infs });
      const dbRows = infs.map(inf => influencerToDb(inf, user.id));
      const { error } = await supabase.from("influencers").upsert(dbRows, { onConflict: "id" });
      if (error) console.error("Influencer sync error:", error.message);
    },
    [user, supabase, boardId]
  );

  const deleteInfluencer = useCallback(
    async (id: string) => {
      if (!user) return;
      setInfluencersState(prev => {
        const next = prev.filter(inf => inf.id !== id);
        if (boardId) updateCache(boardId, { influencers: next });
        return next;
      });
      const { error } = await supabase.from("influencers").delete().eq("id", id);
      if (error) console.error("Delete influencer error:", error.message);
    },
    [user, supabase, boardId]
  );

  /* ─── Persist categories ─── */
  const persistCategories = useCallback(
    async (cats: string[]) => {
      if (!user || !boardId) return;
      setCategoriesState(cats);
      updateCache(boardId, { categories: cats });
      // Delete all for this board then re-insert
      await supabase.from("categories").delete().eq("board_id", boardId);
      if (cats.length > 0) {
        const { error } = await supabase.from("categories").insert(
          cats.map((name, i) => ({
            user_id: user.id,
            board_id: boardId,
            name,
            sort_order: i,
          }))
        );
        if (error) console.error("Category sync error:", error.message);
      }
    },
    [user, supabase, boardId]
  );

  /* ─── Seed defaults for new board ─── */
  const seedDefaults = useCallback(
    async (defaultSkits: Omit<Skit, "id">[], defaultInfluencers: Omit<Influencer, "id">[]) => {
      if (!user || !boardId) return;

      if (defaultSkits.length > 0) {
        const skitRows = defaultSkits.map((s) => ({
          user_id: user.id,
          board_id: boardId,
          inspiration: s.inspiration,
          links: s.links ?? "",
          cast_size: s.castSize,
          characters: s.characters,
          category: s.category,
          style_ref: s.styleRef,
          script: s.script,
          environment: s.environment,
          status: s.status,
        }));

        const { data: insertedSkits, error: skitErr } = await supabase
          .from("skits")
          .insert(skitRows)
          .select();

        if (skitErr) {
          console.error("Seed skits error:", skitErr.message);
        } else if (insertedSkits) {
          setSkitsState((insertedSkits as DbSkit[]).map(dbToSkit));
        }
      }

      const infRows = defaultInfluencers.map(inf => ({
        user_id: user.id,
        name: inf.name,
        handle: inf.handle,
        avatar: inf.avatar,
        platforms: inf.platforms,
        tags: inf.tags,
        favorite: inf.favorite,
        guide_content: inf.guideContent,
        is_private: false,
      }));

      const { data: insertedInfs, error: infErr } = await supabase
        .from("influencers")
        .insert(infRows)
        .select();

      if (infErr) {
        console.error("Seed influencers error:", infErr.message);
      } else if (insertedInfs) {
        setInfluencersState((insertedInfs as DbInfluencer[]).map(dbToInfluencer));
      }
    },
    [user, supabase, boardId]
  );

  return {
    skits,
    influencers,
    categories,
    loading,
    error,
    persistSkits,
    deleteSkits,
    moveSkits,
    persistInfluencers,
    deleteInfluencer,
    persistCategories,
    seedDefaults,
  };
}
