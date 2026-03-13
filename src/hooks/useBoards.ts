"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

export interface Board {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  memberRole?: "viewer" | "editor";
}

export interface BoardMember {
  id: string;
  boardId: string;
  email: string;
  userId: string | null;
  role: "viewer" | "editor";
  invitedBy: string;
  createdAt: string;
}

interface DbBoard {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  slug: string;
  is_public: boolean;
  created_at: string;
}

interface DbBoardMember {
  id: string;
  board_id: string;
  email: string;
  user_id: string | null;
  role: "viewer" | "editor";
  invited_by: string;
  created_at: string;
}

/* ═══════════════════════════════════════════════════
   CONVERTERS
   ═══════════════════════════════════════════════════ */

function dbToBoard(d: DbBoard): Board {
  return {
    id: d.id,
    ownerId: d.owner_id,
    name: d.name,
    description: d.description,
    slug: d.slug,
    isPublic: d.is_public,
    createdAt: d.created_at,
  };
}

function dbToMember(d: DbBoardMember): BoardMember {
  return {
    id: d.id,
    boardId: d.board_id,
    email: d.email,
    userId: d.user_id,
    role: d.role,
    invitedBy: d.invited_by,
    createdAt: d.created_at,
  };
}

/* ═══════════════════════════════════════════════════
   SLUG GENERATION
   ═══════════════════════════════════════════════════ */

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const random = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${random}` : `board-${random}`;
}

/* ═══════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════ */

export function useBoards() {
  const { user } = useAuth();
  const [ownedBoards, setOwnedBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const migratedRef = useRef(false);

  /* ─── Load boards ─── */
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1. Boards I own
        const { data: owned, error: ownedErr } = await supabase
          .from("boards")
          .select("*")
          .eq("owner_id", user!.id)
          .order("created_at", { ascending: true });
        if (ownedErr) throw ownedErr;

        // 2. Boards shared with me (via board_members)
        const { data: memberRows, error: memberErr } = await supabase
          .from("board_members")
          .select("board_id, role")
          .or(`user_id.eq.${user!.id},email.eq.${user!.email}`);
        if (memberErr) throw memberErr;

        let sharedData: Board[] = [];
        if (memberRows && memberRows.length > 0) {
          const roleMap = new Map<string, "viewer" | "editor">();
          for (const r of memberRows as { board_id: string; role: "viewer" | "editor" }[]) {
            roleMap.set(r.board_id, r.role);
          }
          const boardIds = [...roleMap.keys()];
          const { data: sharedBoards, error: sharedErr } = await supabase
            .from("boards")
            .select("*")
            .in("id", boardIds)
            .neq("owner_id", user!.id);
          if (sharedErr) throw sharedErr;
          sharedData = (sharedBoards as DbBoard[]).map(d => ({ ...dbToBoard(d), memberRole: roleMap.get(d.id) }));
        }

        if (cancelled) return;

        const ownedData = (owned as DbBoard[]).map(dbToBoard);
        setOwnedBoards(ownedData);
        setSharedBoards(sharedData);

        // 3. Migration: if new user with no boards, create default + migrate existing skits
        if (ownedData.length === 0 && !migratedRef.current) {
          migratedRef.current = true;
          await migrateExistingData();
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load boards");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Migrate existing data (runs once for legacy users) ─── */
  async function migrateExistingData() {
    if (!user) return;
    const slug = generateSlug("My Board");

    const { data: newBoard, error: boardErr } = await supabase
      .from("boards")
      .insert({ owner_id: user.id, name: "My Board", description: "", slug, is_public: false })
      .select()
      .single();
    if (boardErr || !newBoard) { console.error("Migration error:", boardErr?.message); return; }

    // Migrate orphaned skits
    await supabase.from("skits")
      .update({ board_id: newBoard.id })
      .eq("user_id", user.id)
      .is("board_id", null);

    // Migrate orphaned categories
    await supabase.from("categories")
      .update({ board_id: newBoard.id })
      .eq("user_id", user.id)
      .is("board_id", null);

    setOwnedBoards([dbToBoard(newBoard as DbBoard)]);
  }

  /* ─── Create board ─── */
  const createBoard = useCallback(async (name: string): Promise<Board | null> => {
    if (!user) return null;
    const slug = generateSlug(name);
    const { data, error } = await supabase
      .from("boards")
      .insert({ owner_id: user.id, name, description: "", slug, is_public: false })
      .select()
      .single();
    if (error) { console.error("Create board error:", error.message); return null; }
    const board = dbToBoard(data as DbBoard);
    setOwnedBoards(prev => [...prev, board]);
    return board;
  }, [user, supabase]);

  /* ─── Update board ─── */
  const updateBoard = useCallback(async (
    id: string,
    patch: Partial<Pick<Board, "name" | "description" | "isPublic">>
  ) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.isPublic !== undefined) dbPatch.is_public = patch.isPublic;

    const { error } = await supabase.from("boards").update(dbPatch).eq("id", id);
    if (error) { console.error("Update board error:", error.message); return; }
    setOwnedBoards(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }, [supabase]);

  /* ─── Delete board ─── */
  const deleteBoard = useCallback(async (id: string) => {
    const { error } = await supabase.from("boards").delete().eq("id", id);
    if (error) { console.error("Delete board error:", error.message); return; }
    setOwnedBoards(prev => prev.filter(b => b.id !== id));
  }, [supabase]);

  /* ─── Board members CRUD ─── */
  const getBoardMembers = useCallback(async (boardId: string): Promise<BoardMember[]> => {
    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });
    if (error) { console.error("Get members error:", error.message); return []; }
    return (data as DbBoardMember[]).map(dbToMember);
  }, [supabase]);

  const inviteMember = useCallback(async (
    boardId: string,
    email: string,
    role: "viewer" | "editor"
  ): Promise<BoardMember | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("board_members")
      .insert({ board_id: boardId, email: email.toLowerCase().trim(), role, invited_by: user.id })
      .select()
      .single();
    if (error) { console.error("Invite member error:", error.message); return null; }
    return dbToMember(data as DbBoardMember);
  }, [user, supabase]);

  const removeMember = useCallback(async (memberId: string) => {
    const { error } = await supabase.from("board_members").delete().eq("id", memberId);
    if (error) console.error("Remove member error:", error.message);
  }, [supabase]);

  const updateMemberRole = useCallback(async (memberId: string, role: "viewer" | "editor") => {
    const { error } = await supabase.from("board_members").update({ role }).eq("id", memberId);
    if (error) console.error("Update role error:", error.message);
  }, [supabase]);

  return {
    ownedBoards,
    sharedBoards,
    loading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    getBoardMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
}

/* ═══════════════════════════════════════════════════
   FETCH A SINGLE BOARD BY SLUG (works for anon users)
   ═══════════════════════════════════════════════════ */

export async function fetchBoardBySlug(slug: string): Promise<Board | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return dbToBoard(data as DbBoard);
}

export async function fetchBoardMemberForUser(
  boardId: string,
  email: string | null | undefined,
  userId: string | null | undefined
): Promise<BoardMember | null> {
  if (!email && !userId) return null;
  const supabase = createClient();
  let query = supabase.from("board_members").select("*").eq("board_id", boardId);
  if (userId) {
    query = query.or(`user_id.eq.${userId},email.eq.${email ?? ""}`);
  } else if (email) {
    query = query.eq("email", email);
  }
  const { data } = await query.limit(1).single();
  if (!data) return null;
  return dbToMember(data as DbBoardMember);
}
