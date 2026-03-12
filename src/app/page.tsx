"use client";

import { useState, useEffect } from "react";
import SkitPlanner from "@/components/SkitPlanner";

/* ─── Data ─── */
const posts = [
  { date: "Mar 5, Wed",  platform: "Instagram", type: "Carousel",  pillar: "Travel",  title: "Golden Hour in Chiang Mai",              photos: "01-portrait, 02-house-lanterns, 03-garden-path",      caption: "First impressions of Thailand — wooden houses, lanterns, golden light.", hashtags: "#chiangmai #thailand #goldenhour #travel" },
  { date: "Mar 6, Thu",  platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "Your Next Hire Isn't Human",             photos: "—",                                                    caption: "We deployed an AI employee in 14 days. No interviews. No onboarding drama. Just output.", hashtags: "" },
  { date: "Mar 7, Fri",  platform: "Instagram", type: "Reel",      pillar: "AI",      title: "POV: Your AI Employee's First Day",      photos: "Screen recording + face cam",                          caption: "POV: You hired an AI employee and it just handled your entire inbox before your morning coffee.", hashtags: "#ai #receptiveai #futureofwork #aiemployee" },
  { date: "Mar 8, Sat",  platform: "Instagram", type: "Reel",      pillar: "Travel",  title: "Tuk-Tuk Night Ride",                     photos: "15-tuk-tuk-neon (+ clip)",                             caption: "POV: your first tuk-tuk ride through neon-lit streets.", hashtags: "#tuktuk #bangkok #nightlife" },
  { date: "Mar 10, Mon", platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "Hiring Is Broken",                       photos: "—",                                                    caption: "Companies spend 3 months hiring someone who quits in 6. AI employees don't quit.", hashtags: "" },
  { date: "Mar 11, Tue", platform: "Instagram", type: "Reel",      pillar: "AI",      title: "Stop Hiring, Start Deploying",           photos: "Hormozi-style talking head",                           caption: "You don't need a bigger team. You need smarter systems. Deploy AI employees in 14 days.", hashtags: "#receptiveai #aiagents #startup #automation" },
  { date: "Mar 12, Wed", platform: "Instagram", type: "Story",     pillar: "Travel",  title: "Behind the Scenes — Photo Sorting",      photos: "BTS clips from Stories/",                              caption: "Sorting through 100+ photos from Thailand — the process.", hashtags: "" },
  { date: "Mar 13, Thu", platform: "Instagram", type: "Carousel",  pillar: "Travel",  title: "Thai Food That Blew My Mind",            photos: "08-mango, 09-fruit, 10-fried-rice, 17-night-market",  caption: "Mango sticky rice, street food, tropical fruit — a food diary.", hashtags: "#thaifood #streetfood #foodie" },
  { date: "Mar 14, Fri", platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "AI Employees Don't Call In Sick",         photos: "—",                                                    caption: "Your AI social media manager posts on schedule. Your AI support agent replies in 2 seconds. No PTO requests.", hashtags: "" },
  { date: "Mar 17, Mon", platform: "Instagram", type: "Reel",      pillar: "AI",      title: "What My AI Assistant Did While I Slept",  photos: "Screen recording montage",                             caption: "I woke up to 47 emails answered, 3 posts scheduled, and 12 support tickets closed. All by my AI employee.", hashtags: "#receptiveai #aiemployee #automation" },
  { date: "Mar 18, Tue", platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "The Real Cost of Hiring",                photos: "—",                                                    caption: "Salary + benefits + onboarding + management time + risk of quitting = $80K minimum. An AI employee = fraction of that, deployed in 14 days.", hashtags: "" },
  { date: "Mar 19, Wed", platform: "Instagram", type: "Carousel",  pillar: "Travel",  title: "Lantern Gardens at Sunset",              photos: "04-lanterns, 05-pathway, 03-garden-path",              caption: "Hidden gem in Chiang Mai — a lantern garden that feels unreal.", hashtags: "#chiangmai #lanterns #hiddenthailand" },
  { date: "Mar 20, Thu", platform: "Instagram", type: "Reel",      pillar: "AI",      title: "AI Employee vs. Human Employee",          photos: "Corporate comedy skit",                                caption: "Human: 'I need a mental health day.' AI: *already finished Q1 reports at 3am*", hashtags: "#corporatehumor #ai #receptiveai #work" },
  { date: "Mar 21, Fri", platform: "LinkedIn",  type: "Carousel",  pillar: "AI",      title: "5 Tasks Your AI Employee Handles Day One", photos: "Slide deck graphic",                                  caption: "1. Inbox triage 2. Meeting summaries 3. Content scheduling 4. Customer support 5. Follow-up reminders. All on autopilot.", hashtags: "" },
  { date: "Mar 24, Mon", platform: "Instagram", type: "Reel",      pillar: "AI",      title: "Running a Company from a Thai Cafe",      photos: "06-cafe-terrace + screen recording",                   caption: "My AI employees run the ops while I work from a cafe in Chiang Mai. This is the future of work.", hashtags: "#remotework #digitalnomad #receptiveai #ai" },
  { date: "Mar 25, Tue", platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "Headcount Is a Vanity Metric",           photos: "—",                                                    caption: "10-person team doing the work of 50. AI employees don't need desks, laptops, or Slack channels.", hashtags: "" },
  { date: "Mar 26, Wed", platform: "Instagram", type: "Story",     pillar: "Engage",  title: "Poll: What Would You Automate First?",   photos: "Poll sticker story",                                   caption: "If you could replace ONE task with AI, what would it be? Emails? Scheduling? Support?", hashtags: "" },
  { date: "Mar 27, Thu", platform: "Instagram", type: "Carousel",  pillar: "Travel",  title: "Aesthetic Cafes of Thailand",             photos: "06-cafe-terrace, 07-cafe-entrance, 18-marble-kitchen", caption: "Thailand's cafe scene is criminally underrated.", hashtags: "#cafethailand #aestheticcafe" },
  { date: "Mar 28, Fri", platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "Your Competitors Are Already Doing This", photos: "—",                                                   caption: "While you're posting job ads, your competitor deployed 3 AI employees last week. They ship faster, spend less, and don't have HR issues.", hashtags: "" },
  { date: "Mar 31, Mon", platform: "Instagram", type: "Reel",      pillar: "AI",      title: "Before & After: Manual vs AI Employee",   photos: "Split screen comparison",                              caption: "Left: 4 hours answering emails. Right: AI handled it in 12 minutes. Same quality. Zero burnout.", hashtags: "#receptiveai #productivity #aiagents" },
  { date: "Apr 1, Tue",  platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "The Future Already Happened",             photos: "—",                                                    caption: "AI employees aren't coming. They're here. The only question is whether you deploy them or compete against someone who did.", hashtags: "" },
  { date: "Apr 2, Wed",  platform: "Instagram", type: "Carousel",  pillar: "Travel",  title: "Thailand in 10 Photos",                  photos: "01, 04, 08, 11, 12, 15 (best picks)",                 caption: "If I had to sum up Thailand in 10 frames — this is it.", hashtags: "#thailand #travelgram #photoessay" },
  { date: "Apr 3, Thu",  platform: "Instagram", type: "Reel",      pillar: "AI",      title: "3 AI Employees Every Startup Needs",      photos: "Hormozi-style talking head",                           caption: "1. AI Executive Assistant — inbox, scheduling, follow-ups. 2. AI Social Media Manager — content on autopilot. 3. AI Support Agent — instant replies 24/7.", hashtags: "#receptiveai #startup #ai #saas" },
  { date: "Apr 4, Fri",  platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "Payroll Is the Biggest Lie in Business",  photos: "—",                                                    caption: "You're not paying for output. You're paying for presence. AI employees flip that equation.", hashtags: "" },
  { date: "Apr 7, Mon",  platform: "Instagram", type: "Reel",      pillar: "Travel",  title: "Boat Day in Pattaya",                    photos: "12-boat-ride (+ clip)",                                caption: "Sunrise on a boat in Pattaya — this is why I built a company I can run from anywhere.", hashtags: "#pattaya #remotework #founderslife" },
  { date: "Apr 8, Tue",  platform: "LinkedIn",  type: "Carousel",  pillar: "AI",      title: "How We Deploy AI Employees in 14 Days",  photos: "Process slide deck",                                   caption: "Day 1-3: Define the role. Day 4-7: Build workflows. Day 8-12: Train & test. Day 13-14: Live. No job posts. No interviews. Just results.", hashtags: "" },
  { date: "Apr 9, Wed",  platform: "Instagram", type: "Reel",      pillar: "AI",      title: "Your Competitors in 2027",               photos: "Corporate comedy skit",                                caption: "2024: 'We need to hire 10 people.' 2027: 'We deployed 10 AI employees last Tuesday.'", hashtags: "#ai #futureofwork #receptiveai" },
  { date: "Apr 10, Thu", platform: "Instagram", type: "Carousel",  pillar: "Travel",  title: "Hotel & Airbnb Aesthetic Finds",          photos: "13-towel-art, 18-marble, 19-kitchen, 14-cat",         caption: "The little details that made our stays memorable.", hashtags: "#hotellife #airbnb #travelaesthetic" },
  { date: "Apr 11, Fri", platform: "LinkedIn",  type: "Post",      pillar: "AI",      title: "I Run My Company with AI Employees",      photos: "—",                                                    caption: "From a cafe in Thailand, my AI employees handled 200+ support tickets, posted 15 pieces of content, and triaged my entire inbox this week. Zero human hires needed.", hashtags: "" },
  { date: "Apr 12, Sat", platform: "Instagram", type: "Story",     pillar: "Engage",  title: "DM Me 'AI' for Early Access",            photos: "CTA story with link",                                  caption: "We're opening early access to Receptive AI. DM me 'AI' and I'll send you the details.", hashtags: "" },
];

/* ─── Styles ─── */
const pillarColors: Record<string, { bg: string; text: string; dot: string }> = {
  AI:     { bg: "bg-emerald-100/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  Travel: { bg: "bg-amber-100/80",   text: "text-amber-700",   dot: "bg-amber-500" },
  Engage: { bg: "bg-violet-100/80",  text: "text-violet-700",  dot: "bg-violet-500" },
};

const platformColors: Record<string, string> = {
  Instagram: "bg-gradient-to-r from-pink-500 to-orange-400",
  LinkedIn:  "bg-[#0A66C2]",
};

const typeColors: Record<string, string> = {
  Carousel: "bg-rose-100 text-rose-700",
  Reel:     "bg-orange-100 text-orange-700",
  Story:    "bg-purple-100 text-purple-700",
  Post:     "bg-sky-100 text-sky-700",
};

const categories = ["All", "Corporate Humor", "Tech CEO", "AI / Agents", "Career / Hustle", "Travel", "Other"] as const;
type Category = (typeof categories)[number];

const categoryColors: Record<string, string> = {
  "Corporate Humor": "bg-orange-100 text-orange-700",
  "Tech CEO":        "bg-blue-100 text-blue-700",
  "AI / Agents":     "bg-emerald-100 text-emerald-700",
  "Career / Hustle": "bg-rose-100 text-rose-700",
  "Travel":          "bg-amber-100 text-amber-700",
  "Other":           "bg-slate-100 text-slate-600",
};

interface SavedLink {
  id: string;
  url: string;
  category: Category;
  note: string;
  addedAt: string;
}

/* ─── Pill Badge ─── */
function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${className}`}>
      {children}
    </span>
  );
}

/* ─── SVG Icons ─── */
function SearchIcon() {
  return <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function TrashIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
}
function LinkIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>;
}
function PencilIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>;
}
function PlusIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}
function PlayIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>;
}
function XIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
}
function ExternalIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;
}

/* ─── Embed URL helpers ─── */
function getEmbedUrl(url: string): string | null {
  // Instagram posts & reels
  const igMatch = url.match(/instagram\.com\/(p|reel|reels)\/([^/?]+)/);
  if (igMatch) return `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed/`;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;

  return null;
}

function canEmbed(url: string): boolean {
  return getEmbedUrl(url) !== null;
}

/* ─── Preview Modal ─── */
function PreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const embedUrl = getEmbedUrl(url);
  const isInstagram = url.includes("instagram.com");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: isInstagram ? 440 : 800, maxWidth: "95vw", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <span className="text-sm text-slate-500 truncate max-w-[70%]">
            {url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Open in new tab"
            >
              <ExternalIcon />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto" style={{ maxHeight: "calc(90vh - 52px)" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full border-0"
              style={{ height: isInstagram ? 680 : 450, minHeight: 400 }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <p className="text-slate-400 text-sm mb-4">This link can&apos;t be embedded directly.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B2559] text-white text-sm font-semibold rounded-xl hover:bg-[#2a3a7c] transition"
              >
                <ExternalIcon /> Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Content Plan Tab ─── */
function ContentPlanTable() {
  const [search, setSearch] = useState("");
  const [filterPillar, setFilterPillar] = useState("All");

  const pillars = ["All", "AI", "Travel", "Engage"];
  const filtered = posts.filter(p => {
    if (filterPillar !== "All" && p.pillar !== filterPillar) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.caption.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[240px] relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><SearchIcon /></div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or caption..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>
          <div className="flex gap-2">
            {pillars.map(p => (
              <button
                key={p}
                onClick={() => setFilterPillar(p)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  filterPillar === p
                    ? "bg-[#1B2559] text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Showing {filtered.length} of {posts.length} posts
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">#</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Date</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Platform</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Type</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Pillar</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Title</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Assets</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Caption</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const pillar = pillarColors[p.pillar] || pillarColors.AI;
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4 text-sm text-slate-300 font-medium">{i + 1}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{p.date}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${platformColors[p.platform]}`}>
                        {p.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Pill className={typeColors[p.type]}>{p.type}</Pill>
                    </td>
                    <td className="px-5 py-4">
                      <Pill className={`${pillar.bg} ${pillar.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pillar.dot} mr-1.5`} />
                        {p.pillar}
                      </Pill>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800 max-w-[220px]">{p.title}</td>
                    <td className="px-5 py-4 text-xs text-slate-400 max-w-[160px]">
                      <div className="truncate">{p.photos}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[320px]">
                      <div className="line-clamp-2 leading-relaxed">{p.caption}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-400 px-1">
        {Object.entries(pillarColors).map(([name, c]) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Inspiration Links Tab ─── */
function LinkOrganizer() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [inputCategory, setInputCategory] = useState<Category>("Other");
  const [inputNote, setInputNote] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("inspiration-links");
    if (stored) {
      try { setLinks(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("inspiration-links", JSON.stringify(links));
  }, [links]);

  function addLink() {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    const urls = trimmed.split(/[\n\s]+/).filter(u => u.startsWith("http"));
    if (urls.length === 0 && trimmed.length > 0) {
      urls.push(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    }
    const newLinks: SavedLink[] = urls.map(url => ({
      id: crypto.randomUUID(),
      url,
      category: inputCategory,
      note: inputNote,
      addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
    setLinks(prev => [...newLinks, ...prev]);
    setInputUrl("");
    setInputNote("");
  }

  function removeLink(id: string) { setLinks(prev => prev.filter(l => l.id !== id)); }
  function startEdit(link: SavedLink) { setEditingId(link.id); setEditNote(link.note); }
  function saveEdit(id: string) { setLinks(prev => prev.map(l => l.id === id ? { ...l, note: editNote } : l)); setEditingId(null); }
  function updateCategory(id: string, category: Category) { setLinks(prev => prev.map(l => l.id === id ? { ...l, category } : l)); }

  function extractHandle(url: string): string {
    const match = url.match(/instagram\.com\/([^/?]+)/);
    if (match && !["p", "reel", "reels", "stories"].includes(match[1])) return `@${match[1]}`;
    if (url.includes("linkedin.com")) return "LinkedIn";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("tiktok.com")) return "TikTok";
    return "";
  }

  function extractType(url: string): string {
    if (url.includes("/reel/") || url.includes("/reels/")) return "Reel";
    if (url.includes("/p/")) return "Post";
    if (url.includes("/stories/")) return "Story";
    return "Link";
  }

  const filtered = links
    .filter(l => filterCategory === "All" || l.category === filterCategory)
    .filter(l => !search || l.url.toLowerCase().includes(search.toLowerCase()) || l.note.toLowerCase().includes(search.toLowerCase()) || extractHandle(l.url).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {/* Add Link Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <textarea
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addLink(); } }}
              placeholder="Paste link(s) here — one per line for bulk add"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none"
              rows={2}
            />
            <input
              value={inputNote}
              onChange={e => setInputNote(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
              placeholder="Optional note (e.g., 'great editing style', 'use this format')"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[140px]">
            <select
              value={inputCategory}
              onChange={e => setInputCategory(e.target.value as Category)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            >
              {categories.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={addLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-semibold rounded-xl hover:bg-[#2a3a7c] shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon /> Add Link
            </button>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><SearchIcon /></div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search links, handles, notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => {
              const count = c === "All" ? links.length : links.filter(l => l.category === c).length;
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
                  {c} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          {filtered.length} link{filtered.length !== 1 ? "s" : ""} · Stored in your browser
        </div>
      </div>

      {/* Links Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-200 py-16 text-center">
          <div className="text-slate-300 mb-2">
            <LinkIcon />
          </div>
          <p className="text-sm text-slate-400">
            {links.length === 0 ? "No links saved yet. Paste a link above to get started." : "No links match your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50 w-10">#</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Source</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Type</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Category</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Link</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Note</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50">Added</th>
                  <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-4 bg-slate-50/50 w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link, i) => (
                  <tr key={link.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4 text-sm text-slate-300 font-medium">{i + 1}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{extractHandle(link.url) || "—"}</td>
                    <td className="px-5 py-4">
                      <Pill className="bg-slate-100 text-slate-600">{extractType(link.url)}</Pill>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={link.category}
                        onChange={e => updateCategory(link.id, e.target.value as Category)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border-none cursor-pointer focus:outline-none ${categoryColors[link.category] || "bg-slate-100 text-slate-600"}`}
                      >
                        {categories.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-sm max-w-[280px]">
                      <div className="flex items-center gap-2">
                        {canEmbed(link.url) && (
                          <button
                            onClick={() => setPreviewUrl(link.url)}
                            className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center transition"
                            title="Preview"
                          >
                            <PlayIcon />
                          </button>
                        )}
                        <button
                          onClick={() => canEmbed(link.url) ? setPreviewUrl(link.url) : window.open(link.url, "_blank")}
                          className="text-blue-600 hover:text-blue-800 hover:underline truncate text-left"
                        >
                          {link.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
                          {link.url.replace(/^https?:\/\/(www\.)?/, "").length > 40 ? "..." : ""}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[200px]">
                      {editingId === link.id ? (
                        <div className="flex gap-1.5">
                          <input
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(link.id); if (e.key === "Escape") setEditingId(null); }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(link.id)} className="text-xs text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg font-medium transition">Save</button>
                        </div>
                      ) : (
                        <div
                          className="truncate cursor-pointer hover:text-slate-700 flex items-center gap-1.5 group/note"
                          onClick={() => startEdit(link)}
                        >
                          {link.note || <span className="text-slate-300 italic">add note...</span>}
                          <span className="opacity-0 group-hover/note:opacity-100 text-slate-300 transition"><PencilIcon /></span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{link.addedAt}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => removeLink(link.id)}
                        className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                        title="Remove"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}

/* ─── Tabs ─── */
const pageTabs = ["Content Plan", "Inspiration Links", "Skit Planner"] as const;
type Tab = (typeof pageTabs)[number];

/* ─── Main Page ─── */
export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Content Plan");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100 text-slate-800">
      <div className="max-w-[1500px] mx-auto px-6 py-8">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Receptive AI
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Content Planner · 30 posts · Mar–Apr 2026
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-1.5">
            {pageTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-[#1B2559] text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "Content Plan" && <ContentPlanTable />}
        {activeTab === "Inspiration Links" && <LinkOrganizer />}
        {activeTab === "Skit Planner" && <SkitPlanner />}
      </div>
    </div>
  );
}
