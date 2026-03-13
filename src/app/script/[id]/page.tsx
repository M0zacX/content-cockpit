"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { fetchBoardMemberForUser } from "@/hooks/useBoards";

interface ScriptBoard {
  id: string;
  name: string;
  slug: string;
  is_public: boolean;
  owner_id: string;
}

interface ScriptSkit {
  id: string;
  inspiration: string;
  cast_size: string;
  characters: string;
  category: string;
  style_ref: string;
  script: string;
  status: string;
  environment: string;
  board_id: string;
  is_public: boolean;
  boards: ScriptBoard;
}

const CHAR_COLORS = [
  "text-accent",
  "text-t-green",
  "text-t-amber",
  "text-purple-400",
  "text-pink-400",
  "text-cyan-400",
];

const CHAR_DOT_COLORS = [
  "bg-accent",
  "bg-t-green",
  "bg-t-amber",
  "bg-purple-400",
  "bg-pink-400",
  "bg-cyan-400",
];

const CHAR_ACTIVE_COLORS = [
  "bg-accent/15 text-accent border-accent/30",
  "bg-t-green/15 text-t-green border-t-green/30",
  "bg-t-amber/15 text-t-amber border-t-amber/30",
  "bg-purple-400/15 text-purple-400 border-purple-400/30",
  "bg-pink-400/15 text-pink-400 border-pink-400/30",
  "bg-cyan-400/15 text-cyan-400 border-cyan-400/30",
];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  "Idea":       { bg: "bg-yellow-500/15", text: "text-yellow-400", icon: "💡" },
  "In Progress":{ bg: "bg-blue-500/15",   text: "text-blue-400",   icon: "✏️" },
  "Scripted":   { bg: "bg-purple-500/15", text: "text-purple-400", icon: "📝" },
  "Filmed":     { bg: "bg-green-500/15",  text: "text-green-400",  icon: "🎬" },
  "Done":       { bg: "bg-t-green/15",    text: "text-t-green",    icon: "✅" },
};

const CAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Killer Script": { bg: "bg-rose-500/15",   text: "text-rose-400",   dot: "bg-rose-400" },
  "AI Agent":      { bg: "bg-violet-500/15", text: "text-violet-400", dot: "bg-violet-400" },
  "Corporate":     { bg: "bg-blue-500/15",   text: "text-blue-400",   dot: "bg-blue-400" },
  "Tech/Startup":  { bg: "bg-amber-500/15",  text: "text-amber-400",  dot: "bg-amber-400" },
};
function getCatStyle(cat: string) {
  return CAT_COLORS[cat] || { bg: "bg-border/50", text: "text-text2", dot: "bg-text3" };
}

function parseLines(script: string) {
  return script.split("\n").map((line, i) => {
    const match = line.match(/^([A-Z][\w\s]*?):\s*(.*)/);
    if (match) return { lineNum: i, char: match[1].trim(), text: match[2] };
    const dir = line.match(/^\[(.+)\]$/);
    if (dir) return { lineNum: i, char: "[Direction]", text: line };
    return { lineNum: i, char: "other", text: line };
  });
}

export default function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [skit, setSkit] = useState<ScriptSkit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [canView, setCanView] = useState(false);
  const [charFilter, setCharFilter] = useState("All");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const supabase = createClient();

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("skits")
        .select("id, inspiration, cast_size, characters, category, style_ref, script, status, environment, board_id, is_public, boards(id, name, slug, is_public, owner_id)")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const s = data as unknown as ScriptSkit;
      setSkit(s);

      const board = s.boards;
      const isOwner = !!user && user.id === board.owner_id;

      if (isOwner || s.is_public || board.is_public) {
        setCanView(true);
        setLoading(false);
        return;
      }

      if (user) {
        const member = await fetchBoardMemberForUser(board.id, user.email, user.id);
        setCanView(!!member);
      } else {
        setCanView(false);
      }

      setLoading(false);
    }

    load();
  }, [id, user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Loading ─── */
  if (authLoading || loading) {
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
        <h1 className="text-xl font-bold text-foreground">Script not found</h1>
        <p className="text-sm text-text2">This script doesn&apos;t exist or the link is incorrect.</p>
        <button onClick={() => router.push("/")} className="mt-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition">
          Go home
        </button>
      </div>
    );
  }

  /* ─── No access ─── */
  if (!canView) {
    return (
      <div className="fixed inset-0 bg-mesh flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <p className="text-5xl">🔒</p>
        <h1 className="text-xl font-bold text-foreground">This script is private</h1>
        <p className="text-sm text-text2">
          {user
            ? "You don't have access to this board. Ask the owner to invite you."
            : "Sign in to access this script if you've been invited."}
        </p>
        {!user && (
          <button
            onClick={() => router.push(`/login?redirect=/script/${id}`)}
            className="mt-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition"
          >
            Sign in
          </button>
        )}
        <button onClick={() => router.push("/")} className="px-4 py-2 bg-input-bg border border-border text-sm text-text2 rounded-xl hover:bg-hover-row transition">
          Go home
        </button>
      </div>
    );
  }

  const board = skit!.boards;
  const parsedLines = parseLines(skit!.script || "");
  const chars = [...new Set(parsedLines.map(l => l.char).filter(c => c !== "other" && c !== "[Direction]"))];
  const charColorMap = Object.fromEntries(chars.map((c, i) => [c, CHAR_COLORS[i % CHAR_COLORS.length]]));
  const charDotMap = Object.fromEntries(chars.map((c, i) => [c, CHAR_DOT_COLORS[i % CHAR_DOT_COLORS.length]]));
  const charActiveMap = Object.fromEntries(chars.map((c, i) => [c, CHAR_ACTIVE_COLORS[i % CHAR_ACTIVE_COLORS.length]]));
  const hasDirections = parsedLines.some(l => l.char === "[Direction]");
  const showFilter = chars.length > 0 || hasDirections;

  const visibleLines = charFilter === "All"
    ? parsedLines
    : parsedLines.filter(l => l.char === charFilter);

  const catStyle = getCatStyle(skit!.category);
  const statusStyle = STATUS_STYLES[skit!.status] || { bg: "bg-input-bg", text: "text-text2", icon: "" };

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-mesh text-foreground flex flex-col">
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col gap-4 flex-1">

        {/* Header */}
        <div className="glass-medium rounded-2xl px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/board/${board.slug}`)}
            className="flex items-center gap-1.5 text-text2 hover:text-foreground transition text-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
            Board
          </button>
          <span className="w-px h-4 bg-border" />
          <span className="text-sm text-text2 truncate flex-1">{board.name}</span>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
              copied ? "bg-t-green/15 text-t-green" : "bg-input-bg text-text2 hover:bg-hover-row border border-border"
            }`}
          >
            {copied ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
            )}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Skit metadata */}
        <div className="glass-medium rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${catStyle.bg} ${catStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {skit!.category}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
              <span className="text-[11px]">{statusStyle.icon}</span>
              {skit!.status}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground leading-snug">{skit!.inspiration || "Untitled Skit"}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[12px] text-text3">
            <span>{skit!.cast_size} cast</span>
            {skit!.characters && <><span className="w-px h-3 bg-border" /><span>{skit!.characters}</span></>}
            {skit!.environment && <><span className="w-px h-3 bg-border" /><span>{skit!.environment}</span></>}
            {skit!.style_ref && <><span className="w-px h-3 bg-border" /><span>{skit!.style_ref}</span></>}
          </div>
        </div>

        {/* Script */}
        <div className="glass-strong rounded-2xl flex flex-col flex-1 overflow-hidden">
          {/* Character filter */}
          {showFilter && (
            <div className="px-4 pt-3 pb-2 border-b border-border flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-text3 uppercase tracking-wider mr-0.5">Filter:</span>
              <button
                onClick={() => setCharFilter("All")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${charFilter === "All" ? "bg-accent text-white border-accent/30" : "bg-input-bg text-text2 hover:bg-hover-row border-transparent"}`}
              >All</button>
              {chars.map(c => (
                <button
                  key={c}
                  onClick={() => setCharFilter(f => f === c ? "All" : c)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                    charFilter === c
                      ? charActiveMap[c]
                      : "bg-input-bg text-text2 hover:bg-hover-row border-transparent"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${charDotMap[c]}`} />
                  {c}
                </button>
              ))}
              {hasDirections && (
                <button
                  onClick={() => setCharFilter(f => f === "[Direction]" ? "All" : "[Direction]")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${charFilter === "[Direction]" ? "bg-t-amber/15 text-t-amber border-t-amber/30" : "bg-input-bg text-text2 hover:bg-hover-row border-transparent"}`}
                >Directions</button>
              )}
            </div>
          )}

          {/* Script content */}
          <div className="p-4 lg:p-6 overflow-y-auto flex-1">
            {skit!.script ? (
              <div className="space-y-0.5">
                {visibleLines.map((line, i) => {
                  if (!line.text.trim()) return <div key={i} className="h-3" />;
                  if (line.char === "[Direction]") {
                    return (
                      <p key={i} className="text-sm font-mono text-t-amber italic leading-relaxed py-0.5">
                        {line.text}
                      </p>
                    );
                  }
                  if (line.char === "other") {
                    return (
                      <p key={i} className="text-sm font-mono text-text2 leading-relaxed py-0.5">
                        {line.text}
                      </p>
                    );
                  }
                  const color = charColorMap[line.char] || "text-foreground";
                  return (
                    <p key={i} className={`text-sm font-mono leading-relaxed py-0.5 ${color}`}>
                      {line.text}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="w-12 h-12 text-text3 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                <p className="text-sm text-text3">No script written yet</p>
              </div>
            )}
          </div>

          {/* Footer stats */}
          {skit!.script && (
            <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[11px] text-text3">
              <span>{skit!.script.split("\n").filter(l => l.trim()).length} lines</span>
              <span className="w-px h-3 bg-border" />
              <span>{skit!.script.split(/\s+/).filter(Boolean).length} words</span>
              {chars.length > 0 && (
                <>
                  <span className="w-px h-3 bg-border" />
                  <span>{chars.join(", ")}</span>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
