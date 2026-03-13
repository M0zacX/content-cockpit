"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import CellDropdown, { type CellDropdownOption } from "@/components/CellDropdown";

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
  category: string;
  styleRef: string;
  environment: string;
}

interface VideoPreviewProps {
  videos: VideoEntry[];
  startIndex: number;
  onClose: () => void;
  onUpdateSkit: (id: string, field: string, value: string | boolean | null) => void;
  onDeleteSkit: (id: string) => void;
  categoryOptions: CellDropdownOption[];
  statusOptions: CellDropdownOption[];
  styleRefOptions: CellDropdownOption[];
  getCategoryStyle: (name: string) => { bg: string; text: string };
  getStatusStyle: (name: string) => { bg: string; text: string };
  readOnly?: boolean;
}

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

export default function VideoPreview({ videos, startIndex, onClose, onUpdateSkit, onDeleteSkit, categoryOptions, statusOptions, styleRefOptions, getCategoryStyle, getStatusStyle, readOnly }: VideoPreviewProps) {
  const [idx, setIdx] = useState(startIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const video = videos[idx];
  if (!video) return null;

  const embedUrl = getEmbedUrl(video.url, video.platform);
  const catStyle = getCategoryStyle(video.category);
  const statStyle = getStatusStyle(video.status);

  /* ─── Focus container on mount so keys work ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    containerRef.current?.focus();
    // When an iframe steals focus, window blurs — refocus our container
    // so arrow keys and Escape keep working after video playback starts.
    const refocus = () => setTimeout(() => containerRef.current?.focus(), 0);
    window.addEventListener("blur", refocus);
    return () => window.removeEventListener("blur", refocus);
  }, []);

  /* ─── Keyboard navigation ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }

    const tag = (e.target as HTMLElement)?.tagName;
    const type = (e.target as HTMLInputElement)?.type;
    if (tag === "INPUT" && type === "text") return;
    if (tag === "TEXTAREA") return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIdx(i => Math.min(i + 1, videos.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIdx(i => Math.max(i - 1, 0));
    }
  }, [onClose, videos.length]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* ─── Actions ─── */
  const update = (field: string, value: string | boolean | null) => {
    if (readOnly) return;
    onUpdateSkit(video.skitId, field, value);
  };

  const handleDelete = () => {
    if (readOnly) return;
    const nextIdx = idx < videos.length - 1 ? idx : idx - 1;
    onDeleteSkit(video.skitId);
    if (videos.length <= 1) { onClose(); return; }
    setIdx(Math.max(0, nextIdx));
  };

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-center justify-center outline-none"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 flex flex-col max-h-[92vh]">

        {/* ─── Top bar: Row 1 — Title + Counter + Close ─── */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-surface/95 backdrop-blur border border-border rounded-t-2xl">
          {!readOnly ? (
            <input
              type="text"
              value={video.skitTitle}
              onChange={e => update("inspiration", e.target.value)}
              placeholder="Skit title..."
              className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:text-text3 focus:outline-none border-b border-transparent focus:border-accent/40 transition py-0.5"
            />
          ) : (
            <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">{video.skitTitle || "Untitled"}</p>
          )}
          <span className="text-xs text-text3 shrink-0">
            {idx + 1} / {videos.length}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row transition shrink-0" title="Close (Esc)">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* ─── Top bar: Row 2 — Quick actions ─── */}
        {!readOnly && (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur border-x border-border flex-wrap">
            {/* Cast */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-text3">Cast</span>
              <input
                type="number"
                min={1}
                max={10}
                value={video.castSize}
                onChange={e => update("castSize", e.target.value)}
                className="w-9 h-6 text-center text-xs font-medium bg-input-bg border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent/25 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <div className="w-px h-5 bg-border" />

            {/* Approval */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => update("approved", video.approved === true ? null : true)}
                className={`p-1 rounded-md transition-all ${video.approved === true ? "text-t-green bg-t-green/15" : "text-text3/40 hover:text-t-green hover:bg-t-green/10"}`}
                title="Approve"
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
              <button
                onClick={() => update("approved", video.approved === false ? null : false)}
                className={`p-1 rounded-md transition-all ${video.approved === false ? "text-t-rose bg-t-rose/15" : "text-text3/40 hover:text-t-rose hover:bg-t-rose/10"}`}
                title="Reject"
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="w-px h-5 bg-border" />

            {/* Category — reuses CellDropdown */}
            <CellDropdown
              value={video.category}
              options={categoryOptions}
              onChange={v => update("category", v)}
              pillBg={catStyle.bg}
              pillText={catStyle.text}
              searchable
            />

            <div className="w-px h-5 bg-border" />

            {/* Style Ref — reuses CellDropdown */}
            <CellDropdown
              value={video.styleRef}
              options={styleRefOptions}
              onChange={v => update("styleRef", v)}
              pillBg="bg-accent/10"
              pillText="text-accent"
              searchable
            />

            <div className="w-px h-5 bg-border" />

            {/* Environment */}
            <input
              type="text"
              value={video.environment}
              onChange={e => update("environment", e.target.value)}
              placeholder="Environment"
              className="w-24 h-6 px-2 text-xs bg-input-bg border border-border rounded-md text-foreground placeholder:text-text3 focus:outline-none focus:ring-1 focus:ring-accent/25 transition"
            />

            <div className="w-px h-5 bg-border" />

            {/* Status — reuses CellDropdown */}
            <CellDropdown
              value={video.status}
              options={statusOptions}
              onChange={v => update("status", v)}
              pillBg={statStyle.bg}
              pillText={statStyle.text}
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-1 rounded-md text-text3/40 hover:text-t-rose hover:bg-t-rose/10 transition"
              title="Delete skit"
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        )}

        {/* ─── Video area ─── */}
        <div className="bg-black border-x border-border flex items-center justify-center relative overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "60vh" }}>
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="w-full h-full bg-black"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ border: "none", colorScheme: "dark" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8 text-white/70">
              <PlatformIcon platform={video.platform} size={48} />
              <p className="text-sm text-center">
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

          {/* Nav arrows */}
          {idx > 0 && (
            <button
              onClick={() => setIdx(i => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {idx < videos.length - 1 && (
            <button
              onClick={() => setIdx(i => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface/95 backdrop-blur border border-t-0 border-border rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-text3 min-w-0">
            <PlatformIcon platform={video.platform} size={14} />
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="truncate max-w-[280px] hover:text-accent transition">{video.url}</a>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text3/50 shrink-0">
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">&larr;</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">&rarr;</kbd>
            <span className="ml-0.5">nav</span>
            <kbd className="ml-1.5 px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">esc</kbd>
            <span className="ml-0.5">close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
