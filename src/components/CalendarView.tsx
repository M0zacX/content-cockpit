"use client";

import { useState } from "react";
import type { Post } from "@/lib/store";
import Modal from "./Modal";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const platformColors: Record<string, string> = {
  instagram: "border-l-accent bg-accent/15",
  linkedin: "border-l-blue bg-blue/15",
  story: "border-l-purple bg-purple/15",
  reel: "border-l-orange bg-orange/15",
};

interface Props {
  posts: Post[];
  onSave: (post: Post) => void;
  onDelete: (id: string) => void;
}

export default function CalendarView({ posts, onSave, onDelete }: Props) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);

  const [form, setForm] = useState({
    date: "",
    platform: "instagram" as Post["platform"],
    title: "",
    caption: "",
    photos: "",
    hashtags: "",
    notes: "",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  function changeMonth(dir: number) {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  }

  function openNew(dateStr?: string) {
    setEditPost(null);
    setForm({ date: dateStr || "", platform: "instagram", title: "", caption: "", photos: "", hashtags: "", notes: "" });
    setModalOpen(true);
  }

  function openEdit(post: Post) {
    setEditPost(post);
    setForm({ date: post.date, platform: post.platform, title: post.title, caption: post.caption, photos: post.photos, hashtags: post.hashtags, notes: post.notes });
    setModalOpen(true);
  }

  function handleSave() {
    onSave({ id: editPost?.id || Date.now().toString(), ...form });
    setModalOpen(false);
  }

  function handleDelete() {
    if (editPost) { onDelete(editPost.id); setModalOpen(false); }
  }

  function dateStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const cells: { day: number; current: boolean; date: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false, date: "" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, date: dateStr(d) });
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false, date: "" });

  const inputClass = "w-full px-3 py-2.5 bg-bg2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-foreground";

  return (
    <div>
      {/* Stats row */}
      <div className="border border-border rounded-lg overflow-hidden mb-8">
        <table>
          <thead>
            <tr>
              <th>Carousel-Ready</th>
              <th>Story Content</th>
              <th>Reels / Clips</th>
              <th>Scheduled</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center text-2xl font-extrabold text-accent">19</td>
              <td className="text-center text-2xl font-extrabold text-purple">25</td>
              <td className="text-center text-2xl font-extrabold text-orange">23</td>
              <td className="text-center text-2xl font-extrabold text-green">{posts.length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1.5 border border-border rounded-lg hover:bg-hover-row transition text-sm">
            &larr;
          </button>
          <span className="text-lg font-bold min-w-[180px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => changeMonth(1)} className="px-3 py-1.5 border border-border rounded-lg hover:bg-hover-row transition text-sm">
            &rarr;
          </button>
        </div>
        <button onClick={() => openNew()} className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold text-sm transition">
          + Schedule Post
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">
        {DAY_NAMES.map((d) => (
          <div key={d} className="bg-bg2 p-2.5 text-center text-xs font-semibold text-text2 uppercase border-b border-border">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayPosts = posts.filter((p) => p.date === cell.date);
          return (
            <div
              key={i}
              className={`min-h-[100px] p-2 cursor-pointer hover:bg-hover-row transition border-b border-r border-border ${
                !cell.current ? "opacity-30" : ""
              } ${isToday ? "ring-2 ring-accent ring-inset" : ""}`}
              onClick={() => cell.current && openNew(cell.date)}
            >
              <div className="text-xs font-semibold mb-1">{cell.day}</div>
              {dayPosts.map((p) => (
                <div
                  key={p.id}
                  className={`text-[11px] px-1.5 py-0.5 rounded mb-1 border-l-[3px] truncate cursor-pointer ${platformColors[p.platform] || ""}`}
                  onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                  title={p.title}
                >
                  {p.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-3">
        {[
          { label: "Instagram", color: "bg-accent" },
          { label: "LinkedIn", color: "bg-blue" },
          { label: "Story", color: "bg-purple" },
          { label: "Reel", color: "bg-orange" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-text2">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editPost ? "Edit Post" : "Schedule Post"}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text2 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Platform</label>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Post["platform"] })} className={inputClass}>
              <option value="instagram">Instagram Post</option>
              <option value="linkedin">LinkedIn Post</option>
              <option value="story">Story</option>
              <option value="reel">Reel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chiang Mai cafe culture..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Caption</label>
            <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Full caption..." rows={3} className={inputClass + " resize-y"} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Photos</label>
            <input type="text" value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} placeholder="e.g. 01-portrait, 02-house" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Hashtags</label>
            <input type="text" value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} placeholder="#thailand #travel" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Reminders..." rows={2} className={inputClass + " resize-y"} />
          </div>
          <div className="flex gap-3 pt-2">
            {editPost && (
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold mr-auto">Delete</button>
            )}
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border text-text2 hover:text-foreground rounded-lg text-sm ml-auto">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-semibold">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
