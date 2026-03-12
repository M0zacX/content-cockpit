"use client";

import { useState } from "react";
import type { Idea } from "@/lib/store";
import Modal from "./Modal";

const platformBadge: Record<string, string> = {
  instagram: "bg-accent/15 text-accent",
  linkedin: "bg-blue/15 text-blue",
  story: "bg-purple/15 text-purple",
  reel: "bg-orange/15 text-orange",
};

interface Props {
  ideas: Idea[];
  onSave: (idea: Idea) => void;
  onDelete: (id: string) => void;
}

export default function PostIdeas({ ideas, onSave, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [form, setForm] = useState({ title: "", platform: "instagram" as Idea["platform"], desc: "", photos: "" });

  function openNew() {
    setEditIdea(null);
    setForm({ title: "", platform: "instagram", desc: "", photos: "" });
    setModalOpen(true);
  }

  function openEdit(idea: Idea) {
    setEditIdea(idea);
    setForm({ title: idea.title, platform: idea.platform, desc: idea.desc, photos: idea.photos });
    setModalOpen(true);
  }

  function handleSave() {
    onSave({ id: editIdea?.id || Date.now().toString(), ...form });
    setModalOpen(false);
  }

  function handleDelete() {
    if (editIdea) { onDelete(editIdea.id); setModalOpen(false); }
  }

  const inputClass = "w-full px-3 py-2.5 bg-bg2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-foreground";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Post Ideas</h2>
          <p className="text-sm text-text2 mt-1">Pre-planned carousel and reel concepts from your Thailand content</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold text-sm transition">
          + Add Idea
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table>
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Title</th>
              <th className="w-28">Platform</th>
              <th>Description</th>
              <th>Photos</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea, i) => (
              <tr key={idea.id} className="cursor-pointer" onClick={() => openEdit(idea)}>
                <td className="text-text2 text-center">{i + 1}</td>
                <td className="font-semibold whitespace-nowrap">{idea.title}</td>
                <td>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${platformBadge[idea.platform] || platformBadge.instagram}`}>
                    {idea.platform}
                  </span>
                </td>
                <td className="text-text2 text-sm max-w-md">
                  <div className="line-clamp-3 whitespace-pre-line">{idea.desc}</div>
                </td>
                <td className="text-text2 text-xs max-w-[200px]">
                  <div className="truncate">{idea.photos}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editIdea ? "Edit Idea" : "Add Post Idea"}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text2 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Thai street food carousel" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Platform</label>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Idea["platform"] })} className={inputClass}>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="story">Story</option>
              <option value="reel">Reel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Description</label>
            <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Describe the concept, flow, and vibe..." rows={5} className={inputClass + " resize-y"} />
          </div>
          <div>
            <label className="block text-xs text-text2 mb-1">Photos / Clips</label>
            <input type="text" value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} placeholder="e.g. 08-mango, 09-fruit" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            {editIdea && (
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
