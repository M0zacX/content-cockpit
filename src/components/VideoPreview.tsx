"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

export interface VideoEntry {
  url: string;
  platform: string;
  skitId: string;
  skitTitle: string;
  approved: boolean | null;
  castSize: string;
  status: string;
}

interface VideoPreviewProps {
  videos: VideoEntry[];
  startIndex: number;
  onClose: () => void;
  onUpdateSkit: (id: string, field: string, value: string | boolean | null) => void;
  readOnly?: boolean;
}

/* ═══════════════════════════════════════════════════
   STATUSES
   ═══════════════════════════════════════════════════ */

const STATUSES = ["Idea", "In Progress", "Filming", "Done", "Posted"] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  "Idea":        { bg: "bg-text3/15",    text: "text-text2",    icon: "💡" },
  "In Progress": { bg: "bg-t-amber/15",  text: "text-t-amber",  icon: "🔄" },
  "Filming":     { bg: "bg-t-blue/15",   text: "text-t-blue",   icon: "🎬" },
  "Done":        { bg: "bg-t-green/15",  text: "text-t-green",  icon: "✅" },
  "Posted":      { bg: "bg-t-purple/15", text: "text-t-purple", icon: "🚀" },
};

/* ═══════════════════════════════════════════════════
   EMBED URL HELPERS
   ═══════════════════════════════════════════════════ */

function getEmbedUrl(url: string, platform: string): string | null {
  try {
    const u = new URL(url);
    if (platform === "youtube") {
      const id =
        u.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1] ||
        u.searchParams.get("v") ||
        (u.hostname === "youtu.be" ? u.pathname.slice(1) : null);
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (platform === "tiktok") {
      const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
      return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function getPlatformLabel(platform: string): string {
  if (platform === "instagram") return "Instagram";
  if (platform === "tiktok") return "TikTok";
  if (platform === "youtube") return "YouTube";
  if (platform === "twitter") return "X / Twitter";
  return "Browser";
}

/* ═══════════════════════════════════════════════════
   PLATFORM ICON
   ═══════════════════════════════════════════════════ */

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const s = size;
  if (platform === "instagram") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
  );
  if (platform === "tiktok") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.5a6.34 6.34 0 0 0 6.34-6.34V8.71a8.2 8.2 0 0 0 3.76.96V6.69Z"/></svg>
  );
  if (platform === "youtube") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3 3 0 0 0-2.12-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.57A3 3 0 0 0 .5 6.19 31.25 31.25 0 0 0 0 12a31.25 31.25 0 0 0 .5 5.81 3 3 0 0 0 2.12 2.12c1.84.57 9.38.57 9.38.57s7.54 0 9.38-.57a3 3 0 0 0 2.12-2.12A31.25 31.25 0 0 0 24 12a31.25 31.25 0 0 0-.5-5.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z"/></svg>
  );
  if (platform === "twitter") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export default function VideoPreview({ videos, startIndex, onClose, onUpdateSkit, readOnly }: VideoPreviewProps) {
  const [idx, setIdx] = useState(startIndex);
  const [statusOpen, setStatusOpen] = useState(false);

  const video = videos[idx];
  if (!video) return null;

  const embedUrl = getEmbedUrl(video.url, video.platform);

  /* ─── Keyboard navigation ─── */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }

    // Don't capture arrows when typing in cast input
    if ((e.target as HTMLElement)?.tagName === "INPUT") return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIdx(i => Math.min(i + 1, videos.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIdx(i => Math.max(i - 1, 0));
    }
  }, [onClose, videos.length]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* ─── Approval toggle ─── */
  const toggleApprove = () => {
    if (readOnly) return;
    onUpdateSkit(video.skitId, "approved", video.approved === true ? null : true);
  };
  const toggleReject = () => {
    if (readOnly) return;
    onUpdateSkit(video.skitId, "approved", video.approved === false ? null : false);
  };

  /* ─── Status change ─── */
  const changeStatus = (s: string) => {
    if (readOnly) return;
    onUpdateSkit(video.skitId, "status", s);
    setStatusOpen(false);
  };

  /* ─── Cast size change ─── */
  const changeCast = (val: string) => {
    if (readOnly) return;
    onUpdateSkit(video.skitId, "castSize", val);
  };

  const statusStyle = STATUS_STYLES[video.status] || STATUS_STYLES["Idea"];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">

        {/* ─── Top bar ─── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-surface/90 backdrop-blur border border-border rounded-t-2xl">
          {/* Title & counter */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{video.skitTitle || "Untitled"}</p>
            <p className="text-xs text-text3">Video {idx + 1} of {videos.length}</p>
          </div>

          {/* Quick actions */}
          {!readOnly && (
            <div className="flex items-center gap-2">
              {/* Approval */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleApprove}
                  className={`p-1.5 rounded-lg transition-all ${video.approved === true ? "text-t-green bg-t-green/15" : "text-text3/40 hover:text-t-green hover:bg-t-green/10"}`}
                  title="Approve"
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </button>
                <button
                  onClick={toggleReject}
                  className={`p-1.5 rounded-lg transition-all ${video.approved === false ? "text-t-rose bg-t-rose/15" : "text-text3/40 hover:text-t-rose hover:bg-t-rose/10"}`}
                  title="Reject"
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-border" />

              {/* Cast size */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-text3">Cast</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={video.castSize}
                  onChange={e => changeCast(e.target.value)}
                  className="w-10 h-7 text-center text-xs font-medium bg-input-bg border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-border" />

              {/* Status */}
              <div className="relative">
                <button
                  onClick={() => setStatusOpen(o => !o)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition ${statusStyle.bg} ${statusStyle.text}`}
                >
                  <span>{statusStyle.icon}</span>
                  <span>{video.status}</span>
                  <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 7-7-7"/></svg>
                </button>
                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 min-w-[140px] dropdown-menu rounded-xl py-1 z-20">
                      {STATUSES.map(s => {
                        const st = STATUS_STYLES[s] || STATUS_STYLES["Idea"];
                        return (
                          <button
                            key={s}
                            onClick={() => changeStatus(s)}
                            className={`w-full text-left px-3 py-1.5 text-xs transition flex items-center gap-2 ${video.status === s ? "bg-accent/15 text-accent font-semibold" : "text-text2 hover:bg-hover-row"}`}
                          >
                            <span>{st.icon}</span> {s}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Close button */}
          <button onClick={onClose} className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row transition" title="Close (Esc)">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* ─── Video area ─── */}
        <div className="bg-black/90 border-x border-border flex items-center justify-center relative" style={{ aspectRatio: "9/16", maxHeight: "65vh" }}>
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ border: "none" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8">
              <PlatformIcon platform={video.platform} size={48} />
              <p className="text-sm text-text3 text-center">
                {video.platform === "instagram"
                  ? "Instagram doesn't support embedded playback"
                  : "This video can't be embedded"}
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition"
              >
                Watch on {getPlatformLabel(video.platform)}
              </a>
            </div>
          )}

          {/* Nav arrows (overlay) */}
          {idx > 0 && (
            <button
              onClick={() => setIdx(i => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition"
              title="Previous (←)"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {idx < videos.length - 1 && (
            <button
              onClick={() => setIdx(i => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition"
              title="Next (→)"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface/90 backdrop-blur border border-t-0 border-border rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-text3">
            <PlatformIcon platform={video.platform} size={14} />
            <span className="truncate max-w-[300px]">{video.url}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text3/60">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">→</kbd>
            <span className="ml-1">navigate</span>
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">Esc</kbd>
            <span className="ml-1">close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
