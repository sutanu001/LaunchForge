import React, { useState, useEffect } from "react";
import { Idea } from "../types";
import {
  Sparkles,
  Trash2,
  RefreshCw,
  Cpu,
  Database,
  Calendar,
  DollarSign,
  Users,
  Lightbulb,
  CheckSquare,
  FileText,
  Copy,
  Check,
  Zap,
  Shield,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface IdeaDetailProps {
  idea: Idea | null;
  index: number;
  onUpdate: (updated: Idea) => void;
  onDelete: (id: string) => void;
}

export const IdeaDetail: React.FC<IdeaDetailProps> = ({
  idea,
  index,
  onUpdate,
  onDelete,
}) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dossier" | "brainstorm" | "strategy" | "swot" | "notes"
  >("dossier");
  const [brainstormCount, setBrainstormCount] = useState<number>(10);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [isGeneratingSwot, setIsGeneratingSwot] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [copilotReply, setCopilotReply] = useState<string | null>(null);

  useEffect(() => {
    setCopilotReply(null);
    setRefinePrompt("");
  }, [idea?.id]);

  if (!idea) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F8F6] p-12 text-center">
        <div className="max-w-md border border-[#1A1A1A] p-12 bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <Lightbulb className="w-12 h-12 text-[#FFD700] mx-auto mb-4 stroke-[1.5]" />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
            No Dossier Selected
          </h2>
          <p className="font-serif italic text-sm text-[#1A1A1A]/60 mb-6">
            Select an existing startup project from the left rail or initialize a
            new product idea to begin AI architectural consulting.
          </p>
        </div>
      </div>
    );
  }

  const paddedIdx = String(index + 1).padStart(2, "0");

  const handleExpandAI = async () => {
    try {
      setIsExpanding(true);
      const res = await fetch("/api/ai/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          title: idea.title,
          description: idea.description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data);
      } else {
        alert("Consultant Error: " + data.error);
      }
    } catch (e: any) {
      alert("Failed to connect to AI consultant engine: " + e.message);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleGenerateSwot = async () => {
    try {
      setIsGeneratingSwot(true);
      const res = await fetch("/api/ai/swot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
        }),
      });
      const swotData = await res.json();
      if (res.ok && swotData && !swotData.error) {
        const updatedIdea = { ...idea, swot: swotData };
        onUpdate(updatedIdea);
        fetch(`/api/ideas/${idea.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ swot: swotData }),
        });
      } else {
        alert("SWOT Error: " + (swotData.error || "Failed to generate SWOT analysis"));
      }
    } catch (e: any) {
      alert("Failed to generate SWOT: " + e.message);
    } finally {
      setIsGeneratingSwot(false);
    }
  };

  const handleBrainstormMore = async () => {
    try {
      setIsBrainstorming(true);
      const res = await fetch("/api/ai/brainstorm-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          count: brainstormCount,
        }),
      });
      const newFeatures = await res.json();
      if (res.ok && Array.isArray(newFeatures)) {
        const currentBrainstorm = idea.features?.brainstorm || [];
        onUpdate({
          ...idea,
          features: {
            mvp: idea.features?.mvp || [],
            future: idea.features?.future || [],
            brainstorm: [...newFeatures, ...currentBrainstorm],
          },
        });
      }
    } catch (e: any) {
      alert("Brainstorm error: " + e.message);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleStatusChange = (newStatus: Idea["status"]) => {
    onUpdate({ ...idea, status: newStatus });
    fetch(`/api/ideas/${idea.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleNotesChange = (notes: string) => {
    onUpdate({ ...idea, notes });
  };

  const saveNotes = () => {
    fetch(`/api/ideas/${idea.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: idea.notes }),
    });
  };

  const copySql = () => {
    if (idea.schema?.sql) {
      navigator.clipboard.writeText(idea.schema.sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleRefineIdea = async () => {
    if (!refinePrompt.trim() || !idea) return;
    try {
      setIsRefining(true);
      setCopilotReply(null);
      const res = await fetch("/api/ai/refine-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          prompt: refinePrompt.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data && !data.error && data.updatedIdea) {
        const updated = {
          ...idea,
          ...data.updatedIdea,
          id: idea.id,
        };
        onUpdate(updated);
        setCopilotReply(data.reply || "Dossier updated successfully based on your prompt.");
        setRefinePrompt("");
        fetch(`/api/ideas/${idea.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }).catch(console.error);
      } else {
        alert("Co-pilot Error: " + (data.error || "Failed to refine dossier"));
      }
    } catch (e: any) {
      alert("Refinement failed: " + e.message);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F6] text-[#1A1A1A] font-sans h-full overflow-y-auto">
      {/* TOP HEADER & CONTROLS */}
      <div className="p-12 pb-6 border-b border-[#1A1A1A]/10 bg-[#F9F8F6]">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-baseline space-x-4 max-w-3xl">
            <span className="font-serif italic text-2xl text-[#1A1A1A]/40 font-bold select-none">
              {paddedIdx}.
            </span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none text-[#1A1A1A] break-words">
              {idea.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status Selector */}
            <select
              value={idea.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as Idea["status"])
              }
              className="bg-white border border-[#1A1A1A] px-3 py-2 text-xs uppercase tracking-widest font-bold font-mono focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_#1A1A1A]"
            >
              <option value="New">Status: New</option>
              <option value="Researching">Status: Researching</option>
              <option value="Building">Status: Building</option>
              <option value="Completed">Status: Completed</option>
              <option value="Archived">Status: Archived</option>
            </select>

            {/* AI Consultant Button */}
            <button
              onClick={handleExpandAI}
              disabled={isExpanding}
              className="px-6 py-2 bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-[#FFD700] hover:text-[#1A1A1A] hover:border hover:border-[#1A1A1A] transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${isExpanding ? "animate-spin" : ""}`}
              />
              <span>{isExpanding ? "Analyzing..." : "AI Consult"}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(idea.id)}
              className="p-2 border border-[#1A1A1A] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1A1A1A]"
              title="Delete Dossier"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Short description */}
        <p className="text-sm text-[#1A1A1A]/70 max-w-4xl mt-3 font-sans leading-relaxed">
          {idea.description || "No project overview entered."}
        </p>

        {/* AI Venture Co-pilot Prompt Bar */}
        <div className="mt-6 p-4 bg-white border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] max-w-4xl">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="p-2 bg-[#1A1A1A] text-[#FFD700] shrink-0 flex items-center gap-1.5 px-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] uppercase font-mono font-bold text-white tracking-wider">AI Co-pilot</span>
            </div>
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRefining && refinePrompt.trim()) {
                  handleRefineIdea();
                }
              }}
              placeholder="Give instructions to refine dossier: e.g. 'Pivot target audience to enterprise B2B' or 'Add vector search table'..."
              className="flex-1 bg-transparent border-none text-xs font-mono focus:outline-none placeholder:text-[#1A1A1A]/40 min-w-[200px]"
              disabled={isRefining}
            />
            <button
              onClick={handleRefineIdea}
              disabled={isRefining || !refinePrompt.trim()}
              className="px-5 py-2 bg-[#FFD700] text-[#1A1A1A] text-xs uppercase font-extrabold tracking-widest border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FFD700] transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1A1A1A] disabled:opacity-40 shrink-0 flex items-center gap-1.5 ml-auto sm:ml-0"
            >
              {isRefining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              <span>{isRefining ? "Refining..." : "Refine Idea"}</span>
            </button>
          </div>

          {/* Co-pilot Reply Banner */}
          {copilotReply && (
            <div className="mt-3 pt-3 border-t border-[#1A1A1A]/10 flex items-start gap-2.5 text-xs font-serif italic text-[#1A1A1A]/90 bg-[#FFD700]/15 p-3.5 border-l-3 border-[#1A1A1A]">
              <span className="font-sans font-black uppercase text-[9px] not-italic text-[#1A1A1A] bg-[#FFD700] px-1.5 py-0.5 shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_#1A1A1A]">
                Co-pilot Note
              </span>
              <span className="leading-relaxed">"{copilotReply}"</span>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex space-x-8 border-b border-[#1A1A1A] mt-8 pt-2">
          <button
            onClick={() => setActiveTab("dossier")}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dossier"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A] -mb-[1px]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Architectural Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab("brainstorm")}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "brainstorm"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A] -mb-[1px]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Feature Hub ({idea.features?.brainstorm?.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveTab("strategy")}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "strategy"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A] -mb-[1px]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Monetization & Rivals</span>
          </button>

          <button
            onClick={() => setActiveTab("swot")}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "swot"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A] -mb-[1px]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>AI SWOT Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "notes"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A] -mb-[1px]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scratchpad Notes</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURAL DOSSIER (Editorial Layout) */}
      {activeTab === "dossier" && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="p-12 pt-8">
            {!idea.analysis ? (
              <div className="border border-[#1A1A1A] bg-white p-12 text-center my-8 shadow-[6px_6px_0px_0px_#1A1A1A]">
                <Zap className="w-10 h-10 text-[#FFD700] mx-auto mb-3 stroke-[2]" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                  Dossier Not Yet Synthesized
                </h3>
                <p className="font-serif italic text-sm opacity-65 mb-6 max-w-md mx-auto">
                  Run the AI Consulting Engine to generate database blueprints, MVP
                  feature hierarchies, complexity matrices, and 4-week roadmaps.
                </p>
                <button
                  onClick={handleExpandAI}
                  disabled={isExpanding}
                  className="px-8 py-3 bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2 hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all cursor-pointer shadow-[4px_4px_0px_0px_#1A1A1A]"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>
                    {isExpanding
                      ? "Consulting AI Architect..."
                      : "Generate Full Product Blueprint"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT 2 COLS */}
                <div className="lg:col-span-2">
                  <div className="mb-10">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 font-mono">
                      // Idea Analysis Statement
                    </h4>
                    <p className="font-serif text-2xl md:text-3xl leading-relaxed italic text-[#1A1A1A]">
                      "{idea.analysis.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border-t border-[#1A1A1A] pt-6">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4 text-[#1A1A1A]">
                        Core Features (MVP)
                      </h4>
                      <ul className="space-y-3 text-sm font-bold">
                        {idea.features?.mvp?.map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-start justify-between group"
                          >
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-[#1A1A1A] mr-2.5 shrink-0"></div>
                              <span>{feat.name}</span>
                            </div>
                            <span className="text-[9px] font-mono font-normal uppercase opacity-40 bg-[#1A1A1A]/5 px-1.5 py-0.5">
                              {feat.category}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-[#1A1A1A] pt-6">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4 text-[#1A1A1A]">
                        Target Audience
                      </h4>
                      <ul className="space-y-2 text-sm text-[#1A1A1A]/75 italic font-serif">
                        {idea.analysis.targetAudience?.map((aud, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-xs opacity-40 font-mono not-italic">
                              [{idx + 1}]
                            </span>
                            <span>{aud}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10">
                        <h5 className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-2">
                          Problems Solved
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.analysis.problemsSolved?.map((prob, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 px-2 py-0.5 font-sans"
                            >
                              {prob}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COL: BLACK CONSULTANT CARD */}
                <div className="bg-[#1A1A1A] text-[#F9F8F6] p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_#FFD700] border border-[#1A1A1A] h-full min-h-[22rem]">
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-60">
                        AI Tech Consultant
                      </h4>
                      <Cpu className="w-4 h-4 text-[#FFD700]" />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <span className="text-[9px] block opacity-40 uppercase tracking-widest font-mono mb-1">
                          Frontend Stack
                        </span>
                        <span className="text-base font-bold text-white tracking-tight">
                          {idea.techStack?.frontend || "Next.js / React"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] block opacity-40 uppercase tracking-widest font-mono mb-1">
                          Backend / AI Engine
                        </span>
                        <span className="text-base font-bold text-white tracking-tight">
                          {idea.techStack?.backend || "Node.js / Python"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] block opacity-40 uppercase tracking-widest font-mono mb-1">
                          Database & Vectors
                        </span>
                        <span className="text-base font-bold text-[#FFD700] tracking-tight">
                          {idea.techStack?.database || "PostgreSQL"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] block opacity-40 uppercase tracking-widest font-mono mb-1">
                          Cloud Infrastructure
                        </span>
                        <span className="text-sm font-semibold text-white/80">
                          {idea.techStack?.hosting || "Vercel + Cloud Run"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/20">
                    <span className="text-[9px] block opacity-50 uppercase tracking-widest font-mono mb-1">
                      Complexity Assessment
                    </span>
                    <span className="text-4xl font-black uppercase tracking-tighter text-white">
                      {idea.analysis.complexityScore}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: SCHEMA & ROADMAP (Exact Editorial Grid) */}
          <div className="mt-12 border-t border-[#1A1A1A] grid grid-cols-1 md:grid-cols-2 bg-white shrink-0">
            {/* LEFT: DATABASE BLUEPRINT */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-[#1A1A1A] bg-[#FDFCFB]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] uppercase tracking-widest font-bold flex items-center">
                  <span className="mr-2 text-base">⚡</span> Database Blueprint
                </h4>
                {idea.schema?.sql && (
                  <button
                    onClick={copySql}
                    className="text-[10px] uppercase font-mono px-2 py-1 border border-[#1A1A1A]/30 hover:border-[#1A1A1A] bg-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSql ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSql ? "Copied" : "Copy SQL"}</span>
                  </button>
                )}
              </div>

              <div className="bg-[#1A1A1A] text-[#F9F8F6] p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-60 border border-[#1A1A1A]">
                <pre>
                  {idea.schema?.sql ||
                    "-- No database blueprint generated yet. Click AI Consult above."}
                </pre>
              </div>

              {idea.schema?.explanations && (
                <div className="mt-4 space-y-2 pt-3 border-t border-[#1A1A1A]/10">
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block">
                    Table Schema Rationales:
                  </span>
                  {idea.schema.explanations.map((exp, i) => (
                    <div key={i} className="text-xs font-serif italic">
                      <strong className="font-mono not-italic text-[11px] mr-1 text-[#1A1A1A]">
                        {exp.table}:
                      </strong>
                      <span className="opacity-75">{exp.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: DEVELOPMENT ROADMAP */}
            <div className="p-8 bg-white flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>4-Week Execution Roadmap</span>
                </h4>

                <div className="space-y-4 divide-y divide-[#1A1A1A]/10">
                  {idea.roadmap ? (
                    idea.roadmap.map((rm, idx) => (
                      <div key={idx} className="pt-3 first:pt-0">
                        <div className="flex items-center justify-between text-sm font-bold mb-1">
                          <span className="font-mono text-xs opacity-60 mr-2">
                            {rm.week}
                          </span>
                          <span className="text-[#1A1A1A] truncate">{rm.title}</span>
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 border font-bold shrink-0 ${
                              rm.status === "Ready"
                                ? "bg-green-100 text-green-800 border-green-600"
                                : rm.status === "Next"
                                ? "bg-[#FFD700] text-[#1A1A1A] border-[#1A1A1A]"
                                : "bg-gray-100 text-gray-500 border-gray-300"
                            }`}
                          >
                            {rm.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5 pl-2 border-l border-[#1A1A1A]/20">
                          {rm.tasks?.map((tsk, ti) => (
                            <span
                              key={ti}
                              className="text-[11px] text-[#1A1A1A]/70 font-sans"
                            >
                              • {tsk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs opacity-40 italic font-serif py-6 text-center">
                      Execution milestones will appear here after AI consulting.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#1A1A1A]/20 flex items-center justify-between text-[10px] font-mono opacity-50 uppercase">
                <span>Methodology: Agile / Lean Startup</span>
                <span>Sprint Cycle: 7 Days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE BRAINSTORM HUB */}
      {activeTab === "brainstorm" && (
        <div className="p-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1A1A1A]">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">
                AI Feature Storming Hub
              </h3>
              <p className="font-serif italic text-sm opacity-60">
                Generate 10, 20, or 50 speculative product features categorized by
                Core, Viral Growth, and Premium Tiers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold font-mono mr-2">
                Batch Size:
              </span>
              {[10, 20, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setBrainstormCount(num)}
                  className={`px-3 py-1 text-xs font-mono font-bold border cursor-pointer ${
                    brainstormCount === num
                      ? "bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A]"
                      : "bg-white text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]"
                  }`}
                >
                  +{num}
                </button>
              ))}

              <button
                onClick={handleBrainstormMore}
                disabled={isBrainstorming}
                className="ml-4 px-6 py-2 bg-[#FFD700] text-[#1A1A1A] border border-[#1A1A1A] text-xs uppercase font-extrabold tracking-widest flex items-center gap-2 hover:bg-[#1A1A1A] hover:text-[#FFD700] transition-colors cursor-pointer shadow-[3px_3px_0px_0px_#1A1A1A] disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isBrainstorming ? "animate-spin" : ""}`}
                />
                <span>{isBrainstorming ? "Storming..." : "Storm Features"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(["Core", "Growth", "Premium"] as const).map((tier) => {
              const tierFeatures =
                idea.features?.brainstorm?.filter((f) => f.tier === tier) || [];
              const tierColors = {
                Core: "bg-white border-[#1A1A1A]",
                Growth: "bg-[#FFD700]/15 border-[#1A1A1A]",
                Premium: "bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A]",
              };
              return (
                <div
                  key={tier}
                  className={`border p-6 shadow-[4px_4px_0px_0px_#1A1A1A] ${tierColors[tier]}`}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-current/20">
                    <h4 className="text-xs uppercase tracking-widest font-black">
                      {tier} Tier
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-current/10">
                      {tierFeatures.length} items
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {tierFeatures.length === 0 ? (
                      <li className="text-xs italic opacity-40 font-serif">
                        No {tier.toLowerCase()} features generated yet.
                      </li>
                    ) : (
                      tierFeatures.map((feat, fi) => (
                        <li
                          key={fi}
                          className="text-sm font-medium pb-2 border-b border-current/10 last:border-0"
                        >
                          <div className="font-bold mb-0.5">{feat.name}</div>
                          {feat.description && (
                            <div className="text-xs opacity-70 font-serif italic">
                              {feat.description}
                            </div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MONETIZATION & COMPETITORS */}
      {activeTab === "strategy" && (
        <div className="p-12 space-y-12">
          {/* Monetization */}
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
              Monetization Strategy Matrix
            </h3>
            <p className="font-serif italic text-sm opacity-60 mb-6">
              AI financial consulting evaluating subscription pricing, freemium loops,
              and advertising trade-offs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {idea.monetization ? (
                idea.monetization.map((mon, mi) => (
                  <div
                    key={mi}
                    className="border border-[#1A1A1A] bg-white p-6 shadow-[5px_5px_0px_0px_#1A1A1A]"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1A1A1A]">
                      <h4 className="font-black text-base uppercase">
                        {mon.model}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFD700] font-bold">
                        {mon.verdict}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                      <div className="bg-green-50 p-3 border border-green-200 text-green-900">
                        <span className="font-bold uppercase tracking-wider block text-[9px] mb-1 text-green-700">
                          Pros (+)
                        </span>
                        {mon.pros}
                      </div>
                      <div className="bg-red-50 p-3 border border-red-200 text-red-900">
                        <span className="font-bold uppercase tracking-wider block text-[9px] mb-1 text-red-700">
                          Cons (-)
                        </span>
                        {mon.cons}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 border border-[#1A1A1A] bg-white text-center font-serif italic text-sm opacity-60">
                  Run AI Consult to synthesize monetization strategies.
                </div>
              )}
            </div>
          </div>

          {/* Rivals */}
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
              Competitor Differentiation Dossier
            </h3>
            <p className="font-serif italic text-sm opacity-60 mb-6">
              Competitive intelligence highlighting direct incumbent solutions and our
              unfair advantage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {idea.competitors ? (
                idea.competitors.map((comp, ci) => (
                  <div
                    key={ci}
                    className="border border-[#1A1A1A] bg-[#F3F2EE] p-6 shadow-[5px_5px_0px_0px_#1A1A1A]"
                  >
                    <h4 className="font-black text-lg mb-2">{comp.name}</h4>
                    <div className="mb-4 bg-white p-3 border border-[#1A1A1A]/30 font-serif italic text-sm">
                      <span className="font-sans not-italic text-[10px] font-bold uppercase block text-[#1A1A1A]/50 mb-1">
                        Our Unfair Advantage:
                      </span>
                      "{comp.differentiation}"
                    </div>
                    {comp.pros && (
                      <div className="text-xs font-mono text-[#1A1A1A]/70">
                        <span className="font-bold mr-1">Incumbent strengths:</span>
                        {comp.pros.join(", ")}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 border border-[#1A1A1A] bg-white text-center font-serif italic text-sm opacity-60">
                  Run AI Consult to analyze incumbent competitors.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI SWOT MATRIX (Grid Layout) */}
      {activeTab === "swot" && (
        <div className="p-12 pt-8 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-[#1A1A1A]">
                AI Strategic SWOT Matrix
              </h3>
              <p className="font-serif italic text-sm opacity-60 text-[#1A1A1A]">
                AI assessment evaluating internal moats, execution hurdles, market tailwinds, and external threats.
              </p>
            </div>
            <button
              onClick={handleGenerateSwot}
              disabled={isGeneratingSwot}
              className="px-6 py-3 bg-[#1A1A1A] text-[#FFD700] text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-[#FFD700] hover:text-[#1A1A1A] hover:border hover:border-[#1A1A1A] transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingSwot ? "animate-spin" : ""}`} />
              <span>{isGeneratingSwot ? "Synthesizing Matrix..." : idea.swot ? "Regenerate SWOT" : "Trigger SWOT Analysis"}</span>
            </button>
          </div>

          {!idea.swot ? (
            <div className="border border-[#1A1A1A] bg-white p-16 text-center my-6 shadow-[8px_8px_0px_0px_#1A1A1A]">
              <Shield className="w-12 h-12 text-[#1A1A1A] mx-auto mb-4 stroke-[1.5]" />
              <h4 className="text-xl font-black uppercase tracking-tight mb-2">
                No Strategic SWOT Matrix Found
              </h4>
              <p className="font-serif italic text-sm text-[#1A1A1A]/60 mb-6 max-w-md mx-auto">
                Trigger the AI Strategic SWOT Engine to evaluate competitive moats, technical vulnerabilities, expansion opportunities, and regulatory risks.
              </p>
              <button
                onClick={handleGenerateSwot}
                disabled={isGeneratingSwot}
                className="px-8 py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-bold hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-all cursor-pointer shadow-[4px_4px_0px_0px_#1A1A1A]"
              >
                {isGeneratingSwot ? "Evaluating..." : "Generate SWOT Now"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
              {/* STRENGTHS */}
              <div className="border border-[#1A1A1A] bg-white p-8 shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                <div>
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                        <Target className="w-5 h-5" />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A]">
                        Strengths
                      </h4>
                    </div>
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Internal Moat
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {idea.swot.strengths?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-sans text-[#1A1A1A]/80 leading-relaxed">
                        <span className="font-mono font-bold text-emerald-600 select-none mt-0.5">[{idx + 1}]</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* WEAKNESSES */}
              <div className="border border-[#1A1A1A] bg-white p-8 shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                <div>
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A]">
                        Weaknesses
                      </h4>
                    </div>
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      Internal Friction
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {idea.swot.weaknesses?.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-sans text-[#1A1A1A]/80 leading-relaxed">
                        <span className="font-mono font-bold text-amber-600 select-none mt-0.5">[{idx + 1}]</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* OPPORTUNITIES */}
              <div className="border border-[#1A1A1A] bg-white p-8 shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                <div>
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-800 border border-blue-300 font-bold">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A]">
                        Opportunities
                      </h4>
                    </div>
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Market Tailwind
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {idea.swot.opportunities?.map((o, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-sans text-[#1A1A1A]/80 leading-relaxed">
                        <span className="font-mono font-bold text-blue-600 select-none mt-0.5">[{idx + 1}]</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* THREATS */}
              <div className="border border-[#1A1A1A] bg-white p-8 shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                <div>
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A]">
                        Threats
                      </h4>
                    </div>
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      External Risk
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {idea.swot.threats?.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-sans text-[#1A1A1A]/80 leading-relaxed">
                        <span className="font-mono font-bold text-rose-600 select-none mt-0.5">[{idx + 1}]</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SCRATCHPAD NOTES */}
      {activeTab === "notes" && (
        <div className="p-12 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">
                Notion Scratchpad
              </h3>
              <p className="font-serif italic text-sm opacity-60">
                Private free-form markdown notes and product reflections.
              </p>
            </div>
            <button
              onClick={saveNotes}
              className="px-6 py-2 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-bold shadow-[3px_3px_0px_0px_#FFD700] hover:bg-[#333] transition-colors cursor-pointer"
            >
              Save Notes
            </button>
          </div>

          <textarea
            value={idea.notes || ""}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="# Enter your private founder notes, meeting logs, or architectural thoughts here..."
            className="flex-1 w-full bg-white border border-[#1A1A1A] p-6 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] shadow-[6px_6px_0px_0px_#1A1A1A] min-h-[20rem]"
          />
        </div>
      )}
    </div>
  );
};
