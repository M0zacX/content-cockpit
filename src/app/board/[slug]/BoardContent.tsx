"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import SkitPlanner from "@/components/SkitPlanner";
import { fetchBoardMemberForUser } from "@/hooks/useBoards";

interface Board {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  is_public: boolean;
}

/* ─── Session storage cache for board metadata ─── */
interface CachedBoard {
  board: Board;
  canView: boolean;
  canEdit: boolean;
}
const BOARD_CACHE_PREFIX = "board_meta_";

function readBoardCache(slug: string): CachedBoard | null {
  try {
    const raw = sessionStorage.getItem(BOARD_CACHE_PREFIX + slug);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeBoardCache(slug: string, data: CachedBoard) {
  try { sessionStorage.setItem(BOARD_CACHE_PREFIX + slug, JSON.stringify(data)); } catch {}
}

export default function BoardContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  // This component is rendered with ssr: false, so sessionStorage is always available.
  // useState initializers safely read from cache — no SSR hydration issues.
  const cached = readBoardCache(slug);
  const [board, setBoard] = useState<Board | null>(cached?.board ?? null);
  const [boardLoading, setBoardLoading] = useState(!cached);
  const [canView, setCanView] = useState(cached?.canView ?? false);
  const [canEdit, setCanEdit] = useState(cached?.canEdit ?? false);
  const [notFound, setNotFound] = useState(false);

  // Track what we've already fetched to prevent re-fetching on tab switch
  // (Supabase fires TOKEN_REFRESHED when tab becomes visible, changing user object)
  const fetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch once per slug (prevents tab-switch re-fetches)
    if (fetchedForRef.current === slug) return;
    fetchedForRef.current = slug;

    const supabase = createClient();
    const hasCached = !!readBoardCache(slug);

    async function load() {
      if (!hasCached) {
        setBoardLoading(true);
      }

      const { data, error } = await supabase
        .from("boards")
        .select("id, owner_id, name, slug, is_public")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        if (!hasCached) setNotFound(true);
        setBoardLoading(false);
        return;
      }

      const b = data as Board;
      setBoard(b);

      let view = false;
      let edit = false;

      const isOwner = !!userRef.current && userRef.current.id === b.owner_id;

      if (isOwner) {
        view = true;
        edit = true;
      } else if (b.is_public) {
        view = true;
        edit = false;
      } else if (userRef.current) {
        const member = await fetchBoardMemberForUser(b.id, userRef.current.email, userRef.current.id);
        if (member) {
          view = true;
          edit = member.role === "editor";
        }
      }

      setCanView(view);
      setCanEdit(edit);
      writeBoardCache(slug, { board: b, canView: view, canEdit: edit });
      setBoardLoading(false);
    }

    load();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Loading ─── */
  if (boardLoading) {
    return (
      <div className="fixed inset-0 bg-page-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Not found ─── */
  if (notFound) {
    return (
      <div className="fixed inset-0 bg-mesh flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <p className="text-5xl">🔍</p>
        <h1 className="text-xl font-bold text-foreground">Board not found</h1>
        <p className="text-sm text-text2">This board doesn&apos;t exist or the link is incorrect.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition"
        >
          Go home
        </button>
      </div>
    );
  }

  /* ─── Private / no access ─── */
  if (!canView) {
    return (
      <div className="fixed inset-0 bg-mesh flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <p className="text-5xl">🔒</p>
        <h1 className="text-xl font-bold text-foreground">This board is private</h1>
        <p className="text-sm text-text2">
          {user
            ? "You don't have access to this board. Ask the owner to invite you."
            : "Sign in to access this board if you've been invited."}
        </p>
        {!user && (
          <button
            onClick={() => router.push(`/login?redirect=/board/${slug}`)}
            className="mt-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition"
          >
            Sign in
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-input-bg border border-border text-sm text-text2 rounded-xl hover:bg-hover-row transition"
        >
          Go home
        </button>
      </div>
    );
  }

  /* ─── Board view ─── */
  return (
    <div className="relative h-screen bg-mesh text-foreground overflow-hidden flex flex-col">
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />
      <div className="relative z-10 max-w-[1500px] w-full mx-auto px-4 lg:px-6 py-3 lg:py-4 flex-1 min-h-0 flex flex-col">
        <SkitPlanner
          boardId={board!.id}
          boardName={board!.name}
          readOnly={!canEdit}
        />
      </div>
    </div>
  );
}
