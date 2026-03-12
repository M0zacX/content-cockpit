"use client";

import { useState } from "react";
import type { Inspo } from "@/lib/store";
import Modal from "./Modal";

const platformBadge: Record<string, string> = {
  instagram: "bg-accent/15 text-accent",
  linkedin: "bg-blue/15 text-blue",
  tiktok: "bg-green/15 text-green",
  general: "bg-purple/15 text-purple",
};

interface Props {
  inspos: Inspo[];
  onSave: (inspo: Inspo) => void;
  onDelete: (id: string) => void;
}

export default function InspirationBoard({ inspos, onSave, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editInspo, setEditInspo] = useState<Inspo | null>(null);
  const [form, setForm] = useState({ title: "", platform: "instagram" as Inspo["platform"], link: "", desc: "", tags: "" });

  function openNew() {
    setEditInspo(null);
    setForm({ title: "", platform: "instagram", link: "", desc: "", tags: "" });
    setModalOpen(true);
  }

  function openEdit(inspo: Inspo) {
    setEditInspo(inspo);
    setForm({ title: inspo.title, platform: inspo.platform, link: inspo.link, desc: inspo.desc, tags: inspo.tags.join(", ") });
    setModalOpen(true);
  }

  function handleSave() {
    onSave({
      id: editInspo?.id || Date.now().toString(),
      title: form.title || "Untitled",
      platform: form.platform,
      link: form.link,
      desc: form.desc,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setModalOpen(false);
  }

  function handleDelete() {
    if (editInspo) { onDelete(editInspo.id); setModalOpen(false); }
  }

  const inputClass = "w-full px-3 py-2.5 bg-bg2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-foreground";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Inspiration Board</h2>
          <p className="text-sm text-text2 mt-1">Save links, notes, and ideas from creators you admire</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold text-sm transition">
          + Add Inspiration
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th className="w-28">Platform</th>
              <th>Link</th>
              <th>Tags</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {inspos.map((ins) => (
              <tr key={ins.id} className="cursor-pointer" onClick={() => openEdit(ins)}>
                <td className="font-semibold whitespace-nowrap">{ins.title}</td>
                <td>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${platformBadge[ins.platform] || platformBadge.general}`}>
                    {ins.platform}
                  </span>
                </td>
                <td>
                  {ins.link ? (
                    <a
                      href={ins.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue text-xs hover:underline"
                    >
                      Open &rarr;
                    </a>
                  ) : (
                    <span className="text-text2 text-xs">-</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-1 flex-wrap">
                    {ins.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-text2 px-2 py-0.5 bg-bg2 rounded-full border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-text2 text-sm max-w-xs">
                  <div className="line-clamp-2">{ins.desc}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editInspo ? "Edit Inspiration" : "Add Inspiration"}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text2 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Adam Zane - LinkedIn carousel style" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Platform</label>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Inspo["platform"] })} className={inputClass}>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Link (optional)</label>
            <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Notes</label>
            <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="What do you like? What can you replicate?" rows={4} className={inputClass + " resize-y"} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="carousel, storytelling, hook" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            {editInspo && (
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
