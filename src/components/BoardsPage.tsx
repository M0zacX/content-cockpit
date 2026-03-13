"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useBoards, type Board } from "@/hooks/useBoards";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import ShareModal from "@/components/ShareModal";

/* ═══════════════════════════════════════════════════
   BOARD CARD
   ═══════════════════════════════════════════════════ */

interface BoardCardProps {
  board: Board;
  role?: "owner" | "editor" | "viewer";
  onOpen: () => void;
  onShare?: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
}

function BoardCard({ board, role = "owner", onOpen, onShare, onRename, onDelete }: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(board.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setMenuOpen(true);
  }

  function submitRename() {
    const name = renameName.trim();
    if (name && name !== board.name) onRename?.(name);
    setRenaming(false);
  }

  const statusBadge = board.isPublic
    ? { emoji: "🌍", label: "Public", cls: "bg-t-green/10 text-t-green border-t-green/20" }
    : role === "owner"
    ? { emoji: "🔒", label: "Private", cls: "bg-border/50 text-text3 border-border/30" }
    : role === "editor"
    ? { emoji: "✏️", label: "Editor", cls: "bg-t-blue/10 text-t-blue border-t-blue/20" }
    : { emoji: "👁", label: "Viewer", cls: "bg-border/50 text-text3 border-border/30" };

  return (
    <div
      onClick={onOpen}
      className="relative bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-accent/40 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 group flex flex-col gap-3 min-h-[130px]"
    >
      {/* Top row: icon + menu */}
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
        </div>
        {(onShare || onDelete) && (
          <button
            ref={menuBtnRef}
            onClick={openMenu}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text3 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-hover-row transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
          </button>
        )}
      </div>

      {/* Board name */}
      {renaming ? (
        <input
          autoFocus
          value={renameName}
          onChange={e => setRenameName(e.target.value)}
          onBlur={submitRename}
          onKeyDown={e => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(false); }}
          onClick={e => e.stopPropagation()}
          className="w-full bg-transparent border-b border-accent text-sm font-semibold text-foreground focus:outline-none pb-0.5"
        />
      ) : (
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{board.name}</h3>
      )}

      {/* Bottom row: status badge */}
      <div className="mt-auto">
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.cls}`}>
          <span>{statusBadge.emoji}</span>
          {statusBadge.label}
        </span>
      </div>

      {/* Context menu portal */}
      {menuOpen && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setMenuOpen(false)} />
          <div
            className="fixed dropdown-menu rounded-xl shadow-2xl border border-border overflow-hidden animate-slide-up py-1 w-40"
            style={{ zIndex: 9999, top: menuPos.top, right: menuPos.right }}
          >
            {onRename && (
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); setRenaming(true); setRenameName(board.name); }}
                className="w-full px-3 py-2 text-left text-sm text-text2 hover:bg-hover-row transition flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/></svg>
                Rename
              </button>
            )}
            {onShare && (
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onShare(); }}
                className="w-full px-3 py-2 text-left text-sm text-text2 hover:bg-hover-row transition flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
                Share
              </button>
            )}
            {onDelete && (
              <>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                  className="w-full px-3 py-2 text-left text-sm text-t-rose hover:bg-t-rose/10 transition flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                  Delete
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NEW BOARD CARD
   ═══════════════════════════════════════════════════ */

function NewBoardCard({ onCreate }: { onCreate: (name: string) => void }) {
  const [active, setActive] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const n = name.trim();
    if (n) { onCreate(n); setName(""); }
    setActive(false);
  }

  useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);

  return (
    <div
      onClick={() => !active && setActive(true)}
      className="bg-card border-2 border-dashed border-border/50 rounded-2xl p-5 cursor-pointer hover:border-accent/40 transition-all duration-200 flex items-center justify-center min-h-[130px]"
    >
      {active ? (
        <div className="w-full" onClick={e => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setActive(false); setName(""); } }}
            placeholder="Board name…"
            className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-text3 focus:outline-none border-b border-accent pb-0.5 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={!name.trim()}
              className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent-hover transition disabled:opacity-40"
            >
              Create
            </button>
            <button
              onClick={() => { setActive(false); setName(""); }}
              className="px-3 py-1.5 bg-input-bg text-text2 rounded-lg text-xs font-medium hover:bg-hover-row transition border border-border"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-text3 hover:text-text2 transition">
          <div className="w-9 h-9 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          </div>
          <span className="text-xs font-medium">New Board</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

export default function BoardsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { ownedBoards, sharedBoards, loading, createBoard, updateBoard, deleteBoard } = useBoards();
  const [shareTarget, setShareTarget] = useState<Board | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Board | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleCreate(name: string) {
    const board = await createBoard(name);
    if (board) router.push(`/board/${board.slug}`);
  }

  async function handleRename(board: Board, name: string) {
    await updateBoard(board.id, { name });
  }

  async function handleDelete(board: Board) {
    await deleteBoard(board.id);
    setDeleteConfirm(null);
  }

  return (
    <div className="relative min-h-screen bg-mesh text-foreground">
      {/* Orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-8">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">My Boards</h1>
              <p className="text-xs text-text3 mt-0.5">
                {ownedBoards.length} board{ownedBoards.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-xl glass-subtle hover:bg-hover-row transition"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>
              ) : (
                <svg className="w-4.5 h-4.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>
              )}
            </button>
            <div className="relative ml-1" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-xs font-bold text-accent hover:bg-accent/25 transition"
              >
                {(user?.user_metadata?.display_name || user?.email || "?").slice(0, 2).toUpperCase()}
              </button>
              {userMenuOpen && createPortal(
                <>
                  <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setUserMenuOpen(false)} />
                  <div
                    className="fixed dropdown-menu rounded-xl shadow-2xl border border-border overflow-hidden animate-slide-up py-1 w-48"
                    style={{
                      zIndex: 9999,
                      top: (userMenuRef.current?.getBoundingClientRect().bottom ?? 0) + 6,
                      right: window.innerWidth - (userMenuRef.current?.getBoundingClientRect().right ?? 0),
                    }}
                  >
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-foreground truncate">{user?.user_metadata?.display_name || user?.email?.split("@")[0]}</p>
                      <p className="text-[10px] text-text3 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push("/settings"); }}
                      className="w-full px-3 py-2 text-left text-sm text-text2 hover:bg-hover-row transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                      Settings
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="w-full px-3 py-2 text-left text-sm text-t-rose hover:bg-t-rose/10 transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
                      Sign out
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </div>

        {/* ─── Loading ─── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {/* ─── My Boards ─── */}
        {!loading && (
          <>
            <section>
              <p className="text-[11px] font-semibold text-text3 uppercase tracking-widest mb-3">My Boards</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {ownedBoards.map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    role="owner"
                    onOpen={() => router.push(`/board/${board.slug}`)}
                    onShare={() => setShareTarget(board)}
                    onRename={name => handleRename(board, name)}
                    onDelete={() => setDeleteConfirm(board)}
                  />
                ))}
                <NewBoardCard onCreate={handleCreate} />
              </div>
            </section>

            {/* ─── Shared with me ─── */}
            {sharedBoards.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold text-text3 uppercase tracking-widest mb-3">Shared with Me</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {sharedBoards.map(board => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      role="viewer"
                      onOpen={() => router.push(`/board/${board.slug}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ─── Share Modal ─── */}
      {shareTarget && (
        <ShareModal
          boardId={shareTarget.id}
          boardName={shareTarget.name}
          isOwner={true}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* ─── Delete Confirm ─── */}
      {deleteConfirm && createPortal(
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 9998 }} onClick={() => setDeleteConfirm(null)} />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up"
            style={{ zIndex: 9999 }}
          >
            <h3 className="text-base font-semibold text-foreground mb-2">Delete board?</h3>
            <p className="text-sm text-text2 mb-5">
              <strong className="text-foreground">{deleteConfirm.name}</strong> and all its skits will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-input-bg border border-border text-sm text-text2 rounded-xl hover:bg-hover-row transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-t-rose text-white text-sm font-semibold rounded-xl hover:bg-t-rose/80 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
