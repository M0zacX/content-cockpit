"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useBoards, type BoardMember } from "@/hooks/useBoards";
import { createClient } from "@/lib/supabase/client";

function RoleToggle({
  value,
  onChange,
  size = "sm",
}: {
  value: "viewer" | "editor";
  onChange: (r: "viewer" | "editor") => void;
  size?: "sm" | "xs";
}) {
  const base = size === "xs"
    ? "px-2 py-0.5 text-[10px] font-medium rounded-md transition"
    : "px-2.5 py-1 text-xs font-medium rounded-lg transition";
  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-input-bg border border-border rounded-xl shrink-0">
      {(["viewer", "editor"] as const).map(r => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`${base} capitalize ${
            value === r
              ? "bg-accent text-white shadow-sm"
              : "text-text3 hover:text-text2"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

interface ShareModalProps {
  boardId: string;
  boardName: string;
  isOwner: boolean;
  onClose: () => void;
}

export default function ShareModal({ boardId, boardName, isOwner, onClose }: ShareModalProps) {
  const { getBoardMembers, inviteMember, removeMember, updateMemberRole } = useBoards();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [isPublic, setIsPublic] = useState(false);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor">("viewer");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const boardUrl = typeof window !== "undefined"
    ? `${window.location.origin}/board/${boardId.slice(0, 8)}`
    : "";

  /* ─── Load board visibility + members ─── */
  useEffect(() => {
    async function load() {
      setLoadingMembers(true);
      // Fetch current board visibility
      const { data: board } = await supabase
        .from("boards")
        .select("is_public, slug")
        .eq("id", boardId)
        .single();
      if (board) {
        setIsPublic(board.is_public);
        // Reconstruct the real URL with slug
        if (typeof window !== "undefined" && board.slug) {
          // will be used via computed value below
        }
      }
      // Fetch members
      const mems = await getBoardMembers(boardId);
      setMembers(mems);
      setLoadingMembers(false);
    }
    load();
  }, [boardId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Slug for URL ─── */
  const [boardSlug, setBoardSlug] = useState<string>("");
  useEffect(() => {
    supabase.from("boards").select("slug").eq("id", boardId).single()
      .then(({ data }) => { if (data?.slug) setBoardSlug(data.slug); });
  }, [boardId, supabase]);
  const shareUrl = typeof window !== "undefined" && boardSlug
    ? `${window.location.origin}/board/${boardSlug}`
    : boardUrl;

  /* ─── Toggle public/private ─── */
  async function handleVisibilityChange(pub: boolean) {
    setIsPublic(pub);
    await supabase.from("boards").update({ is_public: pub }).eq("id", boardId);
  }

  /* ─── Copy link ─── */
  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ─── Invite ─── */
  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Please enter a valid email address");
      return;
    }
    if (members.some(m => m.email === email)) {
      setInviteError("This person already has access");
      return;
    }
    setInviting(true);
    setInviteError(null);
    const member = await inviteMember(boardId, email, inviteRole);
    if (member) {
      setMembers(prev => [...prev, member]);
      setInviteEmail("");
    } else {
      setInviteError("Failed to invite. They may already have access.");
    }
    setInviting(false);
  }

  /* ─── Remove member ─── */
  async function handleRemove(memberId: string) {
    await removeMember(memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }

  /* ─── Change role ─── */
  async function handleRoleChange(memberId: string, role: "viewer" | "editor") {
    await updateMemberRole(memberId, role);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
  }

  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Share board</h2>
            <p className="text-xs text-text3 mt-0.5 truncate max-w-[260px]">{boardName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text3 hover:text-foreground hover:bg-hover-row transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Visibility */}
          <div>
            <p className="text-[11px] font-semibold text-text3 uppercase tracking-widest mb-2">Visibility</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleVisibilityChange(false)}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition ${
                  !isPublic
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-input-bg text-text2 hover:border-border-strong"
                }`}
              >
                <span className="mt-0.5 text-base">🔒</span>
                <div>
                  <p className="text-xs font-semibold leading-tight">Private</p>
                  <p className="text-[10px] text-text3 mt-0.5 leading-tight">Only you and invited people</p>
                </div>
              </button>
              <button
                onClick={() => handleVisibilityChange(true)}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition ${
                  isPublic
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-input-bg text-text2 hover:border-border-strong"
                }`}
              >
                <span className="mt-0.5 text-base">🌍</span>
                <div>
                  <p className="text-xs font-semibold leading-tight">Public</p>
                  <p className="text-[10px] text-text3 mt-0.5 leading-tight">Anyone with the link can view</p>
                </div>
              </button>
            </div>
          </div>

          {/* Board link */}
          <div>
            <p className="text-[11px] font-semibold text-text3 uppercase tracking-widest mb-2">Board Link</p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-input-bg border border-border rounded-xl text-xs text-text2 truncate font-mono">
                {shareUrl || "Loading…"}
              </div>
              <button
                onClick={copyLink}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
                  copied
                    ? "bg-t-green/15 text-t-green border-t-green/30"
                    : "bg-input-bg text-text2 border-border hover:bg-hover-row hover:border-border-strong"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Invite (owner only) */}
          {isOwner && (
            <div>
              <p className="text-[11px] font-semibold text-text3 uppercase tracking-widest mb-2">Invite People</p>
              <div className="flex gap-2">
                <input
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setInviteError(null); }}
                  onKeyDown={e => { if (e.key === "Enter") handleInvite(); }}
                  placeholder="email@example.com"
                  className="flex-1 min-w-0 px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
                />
                <RoleToggle value={inviteRole} onChange={setInviteRole} />
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-3 py-2 bg-accent text-white rounded-xl text-xs font-semibold hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {inviting ? "…" : "Invite"}
                </button>
              </div>
              {inviteError && (
                <p className="text-xs text-t-rose mt-1.5">{inviteError}</p>
              )}
            </div>
          )}

          {/* People with access */}
          <div>
            <p className="text-[11px] font-semibold text-text3 uppercase tracking-widest mb-2">People with Access</p>
            {loadingMembers ? (
              <p className="text-xs text-text3 py-2">Loading…</p>
            ) : (
              <div className="space-y-1">
                {/* Owner row */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-input-bg border border-border/50">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd"/></svg>
                  </div>
                  <p className="flex-1 text-xs text-foreground font-medium truncate">You (owner)</p>
                  <span className="text-[10px] text-text3 px-2 py-0.5 bg-border/50 rounded-md">Owner</span>
                </div>

                {/* Member rows */}
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-input-bg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] font-bold text-text2 shrink-0 uppercase">
                      {member.email.slice(0, 1)}
                    </div>
                    <p className="flex-1 text-xs text-foreground truncate">{member.email}</p>
                    {isOwner ? (
                      <>
                        <RoleToggle value={member.role} onChange={r => handleRoleChange(member.id, r)} size="xs" />
                        <button
                          onClick={() => handleRemove(member.id)}
                          className="w-5 h-5 flex items-center justify-center rounded text-text3 hover:text-t-rose hover:bg-t-rose/10 transition shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-text3 px-2 py-0.5 bg-border/50 rounded-md capitalize">{member.role}</span>
                    )}
                  </div>
                ))}

                {members.length === 0 && (
                  <p className="text-xs text-text3 py-1 px-3">No one else has access yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
