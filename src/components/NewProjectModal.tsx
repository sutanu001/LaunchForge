import React, { useState } from "react";
import { Sparkles, X, Lightbulb, ArrowRight } from "lucide-react";
import { Idea } from "../types";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newIdea: Idea, autoConsult: boolean) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Idea["category"]>("SaaS");
  const [autoConsult, setAutoConsult] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data, autoConsult);
        setTitle("");
        setDescription("");
      } else {
        alert("Creation error: " + data.error);
      }
    } catch (err: any) {
      alert("Failed to initialize project: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleIdeas = [
    { title: "AI Medical Study Partner", desc: "USMLE flashcard generator from textbook PDFs", cat: "Education" },
    { title: "Micro-SaaS Billing Monitor", desc: "Real-time Stripe webhook analytics for solo developers", cat: "SaaS" },
    { title: "Rare Book Matcher", desc: "Semantic vector search matching emotional reading moods", cat: "AI" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl border-2 border-[#1A1A1A] bg-[#F9F8F6] p-8 md:p-10 shadow-[12px_12px_0px_0px_#FFD700] relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1 border border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-[#1A1A1A] text-[#FFD700] flex items-center justify-center font-bold font-mono">
            +
          </div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-[#1A1A1A]/50">
            // NEW STARTUP DOSSIER
          </span>
        </div>

        <h2 className="text-4xl font-black uppercase tracking-tight mb-6">
          Initialize Project Idea
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase font-mono font-bold tracking-widest text-[#1A1A1A] mb-2">
              Project Concept Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI-powered fitness coach"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A] px-4 py-3 text-base font-bold placeholder:font-normal placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono font-bold tracking-widest text-[#1A1A1A] mb-2">
                Primary Hub Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white border border-[#1A1A1A] px-4 py-3 text-xs uppercase font-mono font-bold focus:outline-none shadow-[3px_3px_0px_0px_#1A1A1A] cursor-pointer"
              >
                <option value="SaaS">SaaS Platform</option>
                <option value="Mobile App">Mobile Application</option>
                <option value="AI">AI / Machine Learning</option>
                <option value="Productivity">Productivity Utility</option>
                <option value="Education">EdTech / Study Suite</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer select-none bg-white border border-[#1A1A1A] px-4 py-3 w-full shadow-[3px_3px_0px_0px_#1A1A1A]">
                <input
                  type="checkbox"
                  checked={autoConsult}
                  onChange={(e) => setAutoConsult(e.target.checked)}
                  className="w-4 h-4 accent-[#1A1A1A]"
                />
                <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                  <span>Auto-Consult AI Engine</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono font-bold tracking-widest text-[#1A1A1A] mb-2">
              Elevator Pitch / Problem Statement
            </label>
            <textarea
              rows={3}
              placeholder="Briefly describe what this app does or the exact problem it solves..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A] p-4 text-xs font-sans leading-relaxed placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
            />
          </div>

          {/* Quick Inspirations */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-mono font-bold text-[#1A1A1A]/40 block mb-2">
              Or click a sample blueprint idea:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {sampleIdeas.map((sm, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setTitle(sm.title);
                    setDescription(sm.desc);
                    setCategory(sm.cat as any);
                  }}
                  className="bg-white border border-[#1A1A1A]/30 hover:border-[#1A1A1A] p-2.5 text-[11px] cursor-pointer transition-all hover:translate-x-0.5"
                >
                  <div className="font-bold font-mono text-[#1A1A1A]">{sm.title}</div>
                  <div className="text-[10px] text-[#1A1A1A]/60 truncate">{sm.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#1A1A1A]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-xs uppercase font-mono font-bold border border-transparent hover:border-[#1A1A1A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-extrabold flex items-center gap-2 hover:bg-[#FFD700] hover:text-[#1A1A1A] hover:border hover:border-[#1A1A1A] transition-all cursor-pointer shadow-[4px_4px_0px_0px_#1A1A1A] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700] group-hover:text-[#1A1A1A]" />
              <span>{isSubmitting ? "Initializing..." : "Create Project Dossier"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
