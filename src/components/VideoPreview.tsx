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

interface BoardOption {
  id: string;
  name: string;
}

interface VideoPreviewProps {
  videos: VideoEntry[];
  startIndex: number;
  onClose: () => void;
  onUpdateSkit: (id: string, field: string, value: string | boolean | null) => void;
  onDeleteSkit: (id: string) => void;
  onMoveSkit?: (skitId: string, boardId: string) => void;
  otherBoards?: BoardOption[];
  categoryOptions: CellDropdownOption[];
  statusOptions: CellDropdownOption[];
  styleRefOptions: CellDropdownOption[];
  getCategoryStyle: (name: string) => { bg: string; text: string };
  getStatusStyle: (name: string) => { bg: string; text: string };
  readOnly?: boolean;
}

/* ═══════════════════════════════════════════════════
   FACEBOOK SDK (lazy-loaded)
   ═══════════════════════════════════════════════════ */

let fbSdkPromise: Promise<void> | null = null;
function loadFacebookSdk(): Promise<void> {
  if (fbSdkPromise) return fbSdkPromise;
  fbSdkPromise = new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).FB) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return fbSdkPromise;
}

function FacebookEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadFacebookSdk().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (ref.current && (window as any).FB) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).FB.XFBML.parse(ref.current);
      }
    });
  }, [url]);
  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center overflow-auto">
      <div
        className="fb-video"
        data-href={url}
        data-width="350"
        data-allowfullscreen="true"
        data-autoplay="true"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TWITTER/X SDK (lazy-loaded)
   ═══════════════════════════════════════════════════ */

let twttrSdkPromise: Promise<void> | null = null;
function loadTwitterSdk(): Promise<void> {
  if (twttrSdkPromise) return twttrSdkPromise;
  twttrSdkPromise = new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).twttr?.widgets) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return twttrSdkPromise;
}

function TwitterEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tweetId = url.match(/\/status\/(\d+)/)?.[1];
    if (!tweetId || !ref.current) return;
    let cancelled = false;
    ref.current.innerHTML = "";
    loadTwitterSdk().then(() => {
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = ""; // clear again in case StrictMode re-ran
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).twttr.widgets.createTweet(tweetId, ref.current, {
        theme: "dark",
        align: "center",
      });
    });
    return () => { cancelled = true; };
  }, [url]);
  return <div ref={ref} className="w-full h-full flex items-center justify-center overflow-auto" />;
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
    if (platform === "instagram") {
      const id = u.pathname.match(/\/(?:reel|p)\/([^/?]+)/)?.[1];
      return id ? `https://www.instagram.com/p/${id}/embed/` : null;
    }
    // Twitter/X has no reliable iframe-only embed — show fallback button
    if (platform === "twitter") return null;
    if (platform === "vimeo") {
      const id = u.pathname.match(/\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
    // Facebook uses SDK-based embed (FacebookEmbed component), not iframe
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
  if (platform === "facebook") return "Facebook";
  if (platform === "vimeo") return "Vimeo";
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
  if (platform === "facebook") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
  if (platform === "vimeo") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609C15.9 20.065 12.999 22 10.553 22c-1.517 0-2.8-1.4-3.844-4.205l-2.1-7.7C3.84 7.29 3.04 5.89 2.17 5.89c-.19 0-.856.4-1.996 1.193L-.001 4.6A315.67 315.67 0 0 0 3.63 1.29C5.25-.07 6.49-.34 7.338-.17c2.48.19 4.007 2.86 4.582 8.01.62-3.96 1.99-5.94 4.1-5.94 1.16 0 2.596 1.16 3.2 2.16 1.32.86 1.95 2.15 1.76 2.36z"/></svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export default function VideoPreview({ videos, startIndex, onClose, onUpdateSkit, onDeleteSkit, onMoveSkit, otherBoards = [], categoryOptions, statusOptions, styleRefOptions, getCategoryStyle, getStatusStyle, readOnly }: VideoPreviewProps) {
  const [idx, setIdx] = useState(startIndex);
  const [moveOpen, setMoveOpen] = useState(false);
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

    const key = e.key.toLowerCase();

    // Navigate: ArrowRight / D = next, ArrowLeft / A = prev
    if (e.key === "ArrowRight" || key === "d") {
      e.preventDefault();
      setIdx(i => Math.min(i + 1, videos.length - 1));
    } else if (e.key === "ArrowLeft" || key === "a") {
      e.preventDefault();
      setIdx(i => Math.max(i - 1, 0));
    }
    // Approve + advance: ArrowUp / W
    else if (e.key === "ArrowUp" || key === "w") {
      e.preventDefault();
      onUpdateSkit(videos[idx]?.skitId ?? "", "approved", true);
      setIdx(i => Math.min(i + 1, videos.length - 1));
    }
    // Reject + advance: ArrowDown / S
    else if (e.key === "ArrowDown" || key === "s") {
      e.preventDefault();
      onUpdateSkit(videos[idx]?.skitId ?? "", "approved", false);
      setIdx(i => Math.min(i + 1, videos.length - 1));
    }
  }, [onClose, videos, idx, onUpdateSkit]);

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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

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

            {/* Move to board */}
            {otherBoards.length > 0 && onMoveSkit && (
              <div className="relative">
                <button
                  onClick={() => setMoveOpen(o => !o)}
                  className="p-1 rounded-md text-text3/40 hover:text-accent hover:bg-accent/10 transition"
                  title="Move to board"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                </button>
                {moveOpen && (
                  <>
                    <div className="fixed inset-0 z-[20]" onClick={() => setMoveOpen(false)} />
                    <div className="dropdown-menu absolute right-0 bottom-full mb-1 z-[21] rounded-xl p-1.5 min-w-[180px] animate-slide-up">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-text3 uppercase tracking-wider">Move to</div>
                      {otherBoards.map(b => (
                        <button key={b.id} onClick={() => {
                          onMoveSkit(video.skitId, b.id);
                          setMoveOpen(false);
                          if (videos.length <= 1) { onClose(); return; }
                          setIdx(i => Math.min(i, videos.length - 2));
                        }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-text2 hover:bg-hover-row transition truncate">
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

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
        <div className="bg-black border-x border-border flex items-center justify-center relative overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
          {video.platform === "facebook" ? (
            <FacebookEmbed url={video.url} />
          ) : video.platform === "twitter" ? (
            <TwitterEmbed url={video.url} />
          ) : embedUrl ? (
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
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">←</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">A</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">→</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">D</kbd>
            <span className="ml-0.5">nav</span>
            <span className="mx-1.5 text-white/10">|</span>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↑</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">W</kbd>
            <span className="ml-0.5 text-t-green/60">approve</span>
            <span className="mx-1.5 text-white/10">|</span>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↓</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">S</kbd>
            <span className="ml-0.5 text-t-rose/60">reject</span>
            <span className="mx-1.5 text-white/10">|</span>
            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">esc</kbd>
            <span className="ml-0.5">close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
