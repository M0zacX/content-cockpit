"use client";

import { useState, useEffect, useCallback } from "react";
import { type Skit, getSkits, setSkits } from "@/lib/store";

/* ─── Default Data (70 skit concepts) ─── */
const defaultSkits: Omit<Skit, "id">[] = [
  // === KILLER SCRIPTS BATCH 1 ===
  {inspiration:"The AI Is My Emotional Support",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"We Trained It on Me",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"The AI Got Poached",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"The AI Caught Us Doing Nothing",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"Better Relationship with Clients",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / phone call",status:"Done"},
  {inspiration:"He Talks to the AI More Than Me",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"Says What I'm Thinking",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / laptop",status:"Done"},
  {inspiration:"The AI Sided with the Client",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"We Gave the AI a Budget",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {inspiration:"The AI Applied to Our Competitor",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / laptop screen",status:"Done"},
  // === AI AGENT (1-20) ===
  {inspiration:"The AI Has a Better LinkedIn Than Me",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Left a Glassdoor Review",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"We're Replacing the Intern with AI",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Got a Better Performance Review",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@jordanreviewsittt",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Started Delegating Work to Me",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Figured Out We're Overpaying the Accountant",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Sends Passive-Aggressive Slack Messages",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@corporate.sween",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Wrote a Company Culture Doc",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Interviews Our New Hire",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@techroastshow",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Started a Side Project",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Negotiates Its Own Contract",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@thatcorporatelawyer",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Discovers the Company Credit Card",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {inspiration:"We Let the AI Handle Customer Support",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Created an Org Chart",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@_businesscasualty",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Set Next Quarter's Goals",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Built a Productivity Leaderboard",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Catches You Lying in a Meeting",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Sent a Salary Transparency Report",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Won't Stop Quoting Naval",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {inspiration:"The AI Applied to Y Combinator Without Telling Us",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@lukealexxander",script:"",environment:"",status:"Idea"},
  // === CORPORATE (21-40) ===
  {inspiration:"The Meeting That Should've Been an Email",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {inspiration:"POV: Screen Share and Forget Your Tabs",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"Let's Take This Offline",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@_businesscasualty",script:"",environment:"",status:"Idea"},
  {inspiration:"The Company Pizza Party",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"We're a Family Here",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {inspiration:"The 5-Minute Sync",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporate.sween",script:"",environment:"",status:"Idea"},
  {inspiration:"The Reply-All Disaster",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@jordanreviewsittt",script:"",environment:"",status:"Idea"},
  {inspiration:"Everyone Gets 'Meets Expectations'",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"The Unpaid Intern",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {inspiration:"The LinkedIn Motivation Post",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {inspiration:"'That's a Great Question'",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {inspiration:"Trust Falls Over Zoom",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"The CEO Read One Business Book",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"'We Need to Talk'",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {inspiration:"Corporate Buzzword Bingo",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@_businesscasualty",script:"",environment:"",status:"Idea"},
  {inspiration:"The Slack Status Lie",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporate.sween",script:"",environment:"",status:"Idea"},
  {inspiration:"The Email Sign-Off Escalation",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"The 'Quick Favor'",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"Working From Home vs. Reality",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {inspiration:"The Office Kitchen War",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  // === TECH/STARTUP (41-60) ===
  {inspiration:"Disrupting... Water",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"47 Slides for a To-Do App",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {inspiration:"Every Founder After Reading One Naval Tweet",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {inspiration:"LinkedIn Lunatics",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {inspiration:"'Pre-Revenue'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@lukealexxander",script:"",environment:"",status:"Idea"},
  {inspiration:"The Developer Who Automates a 5-Minute Task",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {inspiration:"The Ping Pong Table Priority",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"Pivoting the Pivot",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {inspiration:"The '18-Hour Day' CEO",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"'We're Like Uber But For...'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"The Tech Interview",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@techroastshow",script:"",environment:"",status:"Idea"},
  {inspiration:"Blockchain in 2026",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {inspiration:"The Monday Pivot",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {inspiration:"'The Product Sells Itself'",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@lukealexxander",script:"",environment:"",status:"Idea"},
  {inspiration:"'We're an AI Company'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {inspiration:"The Founder Morning Routine Video",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {inspiration:"'Just a Button'",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {inspiration:"The 'Let's Grab Coffee' Ambush",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {inspiration:"The Social Media 'Strategy'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {inspiration:"The Founder Who Only Speaks in Metrics",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@pm_alec",script:"",environment:"",status:"Idea"},
];

/* ─── Category + Status Colors ─── */
const skitCategoryColors: Record<string, string> = {
  "AI Agent":       "bg-emerald-100 text-emerald-700",
  "Corporate":      "bg-blue-100 text-blue-700",
  "Tech/Startup":   "bg-orange-100 text-orange-700",
  "Killer Script":  "bg-rose-100 text-rose-700",
};

const statusColors: Record<string, string> = {
  "Done":       "bg-emerald-100 text-emerald-700",
  "Idea":       "bg-slate-100 text-slate-500",
  "In Progress":"bg-amber-100 text-amber-700",
  "Filming":    "bg-blue-100 text-blue-700",
};

const skitCategories = ["All", "Killer Script", "AI Agent", "Corporate", "Tech/Startup"] as const;
const castSizes = ["All", "2", "3"] as const;

/* ─── Icons ─── */
function SearchIcon() {
  return <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function PlusIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}
function TrashIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
}
function DownloadIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
}
function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <svg className="w-3 h-3 text-slate-300 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" /></svg>;
  return asc
    ? <svg className="w-3 h-3 text-blue-500 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
    : <svg className="w-3 h-3 text-blue-500 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
}

/* ─── Pill Badge ─── */
function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${className}`}>
      {children}
    </span>
  );
}

/* ─── Editable Cell ─── */
function EditableCell({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    return (
      <input
        className={`w-full px-2 py-1 bg-blue-50 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${className}`}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); setEditing(false); }}
        onKeyDown={e => {
          if (e.key === "Enter") { onChange(draft); setEditing(false); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        autoFocus
      />
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-blue-50/50 rounded px-1 py-0.5 min-h-[24px] transition ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-slate-300 italic text-xs">click to edit</span>}
    </div>
  );
}

/* ─── Main Component ─── */
export default function SkitPlanner() {
  const [skits, setSkitsState] = useState<Skit[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterCast, setFilterCast] = useState("All");
  const [sortCol, setSortCol] = useState<keyof Skit | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Load from localStorage or seed defaults
  useEffect(() => {
    const stored = getSkits();
    if (stored.length > 0) {
      setSkitsState(stored);
    } else {
      const seeded = defaultSkits.map((s, i) => ({ ...s, id: String(i + 1) }));
      setSkitsState(seeded);
      setSkits(seeded);
    }
  }, []);

  // Persist on change
  const persist = useCallback((next: Skit[]) => {
    setSkitsState(next);
    setSkits(next);
  }, []);

  // Update a single skit field
  function updateSkit(id: string, field: keyof Skit, value: string) {
    persist(skits.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  // Add new row
  function addRow() {
    const newId = String(Date.now());
    const newSkit: Skit = {
      id: newId,
      inspiration: "",
      castSize: "2",
      characters: "A + B",
      category: "AI Agent",
      styleRef: "",
      script: "",
      environment: "",
      status: "Idea",
    };
    persist([...skits, newSkit]);
  }

  // Delete selected
  function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} row(s)?`)) return;
    persist(skits.filter(s => !selected.has(s.id)));
    setSelected(new Set());
  }

  // Toggle select
  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(s => s.id)));
    }
  }

  // Sort
  function handleSort(col: keyof Skit) {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  }

  // Download CSV
  function downloadCSV() {
    const headers = ["#", "Inspiration", "Cast Size", "Characters", "Category", "Style Reference", "Script", "Environment", "Status"];
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = skits.map((r, i) => [
      i + 1, esc(r.inspiration), r.castSize, esc(r.characters), esc(r.category),
      esc(r.styleRef), esc(r.script), esc(r.environment), esc(r.status),
    ].join(","));
    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skit-planner.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Filter + sort
  let filtered = skits.filter(s => {
    if (filterCategory !== "All" && s.category !== filterCategory) return false;
    if (filterCast !== "All" && s.castSize !== filterCast) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.inspiration.toLowerCase().includes(q) ||
             s.characters.toLowerCase().includes(q) ||
             s.styleRef.toLowerCase().includes(q) ||
             s.environment.toLowerCase().includes(q) ||
             s.script.toLowerCase().includes(q);
    }
    return true;
  });

  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const va = (a[sortCol] || "").toLowerCase();
      const vb = (b[sortCol] || "").toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  // Stats
  const total = skits.length;
  const scriptsDone = skits.filter(s => s.script.toLowerCase() === "complete").length;
  const filmed = skits.filter(s => s.status.toLowerCase() === "done").length;

  const columns: { key: keyof Skit; label: string; sortable: boolean }[] = [
    { key: "inspiration", label: "Inspiration", sortable: true },
    { key: "castSize", label: "Cast", sortable: true },
    { key: "characters", label: "Characters", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "styleRef", label: "Style Ref", sortable: true },
    { key: "script", label: "Script", sortable: true },
    { key: "environment", label: "Environment", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Bar */}
      <div className="flex gap-6 text-sm text-slate-500 px-1">
        <span>Total: <strong className="text-slate-700">{total}</strong></span>
        <span>Showing: <strong className="text-slate-700">{filtered.length}</strong></span>
        <span>Scripts Done: <strong className="text-emerald-600">{scriptsDone}</strong></span>
        <span>Filmed: <strong className="text-emerald-600">{filmed}</strong></span>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[220px] relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><SearchIcon /></div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skits..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {skitCategories.map(c => {
              const count = c === "All" ? skits.length : skits.filter(s => s.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setFilterCategory(c)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    filterCategory === c
                      ? "bg-[#1B2559] text-white shadow-md"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {c} <span className="ml-1 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Cast filter */}
          <div className="flex gap-2">
            {castSizes.map(c => (
              <button
                key={c}
                onClick={() => setFilterCast(c)}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                  filterCast === c
                    ? "bg-[#1B2559] text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {c === "All" ? "Any Cast" : `${c} people`}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-semibold rounded-xl hover:bg-[#2a3a7c] shadow-md hover:shadow-lg transition-all"
          >
            <PlusIcon /> Add Row
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <DownloadIcon /> Download CSV
          </button>
          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all"
            >
              <TrashIcon /> Delete {selected.size} selected
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-4 bg-slate-50/50 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-4 bg-slate-50/50 w-10">#</th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-4 bg-slate-50/50 ${col.sortable ? "cursor-pointer hover:text-slate-600 select-none" : ""}`}
                  >
                    {col.label}
                    {col.sortable && <SortIcon active={sortCol === col.key} asc={sortAsc} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((skit, i) => (
                <tr
                  key={skit.id}
                  className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors group ${selected.has(skit.id) ? "bg-blue-50/50" : ""}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(skit.id)}
                      onChange={() => toggleSelect(skit.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-300 font-medium">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 max-w-[240px]">
                    <EditableCell value={skit.inspiration} onChange={v => updateSkit(skit.id, "inspiration", v)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-center w-16">
                    <EditableCell value={skit.castSize} onChange={v => updateSkit(skit.id, "castSize", v)} className="text-center" />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <EditableCell value={skit.characters} onChange={v => updateSkit(skit.id, "characters", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={skit.category}
                      onChange={e => updateSkit(skit.id, "category", e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border-none cursor-pointer focus:outline-none ${skitCategoryColors[skit.category] || "bg-slate-100 text-slate-600"}`}
                    >
                      {skitCategories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    <EditableCell value={skit.styleRef} onChange={v => updateSkit(skit.id, "styleRef", v)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    <EditableCell value={skit.script} onChange={v => updateSkit(skit.id, "script", v)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    <EditableCell value={skit.environment} onChange={v => updateSkit(skit.id, "environment", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <Pill className={statusColors[skit.status] || "bg-slate-100 text-slate-500"}>
                      <EditableCell value={skit.status} onChange={v => updateSkit(skit.id, "status", v)} />
                    </Pill>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-sm text-slate-400">
                    No skits match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-400 px-1 flex-wrap">
        {Object.entries(skitCategoryColors).map(([name, cls]) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cls.split(" ")[0]}`} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
