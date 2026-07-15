import React, { useState } from "react";
import { Sparkles, Dice5, ArrowRight, CheckCircle2, Layers, Cpu, Database, Compass, Loader2, BookmarkPlus, Zap } from "lucide-react";
import { Idea } from "../types";

interface IdeaGeneratorProps {
  onSaveIdea: (newIdea: Idea, autoConsult: boolean) => void;
  onNavigatePortfolio: () => void;
}

interface RandomIdeaResponse {
  title: string;
  tagline: string;
  description: string;
  category: "SaaS" | "Mobile App" | "AI" | "Productivity" | "Education";
  complexity: "Low" | "Moderate" | "High" | "Extreme";
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onSaveIdea, onNavigatePortfolio }) => {
  const [activeMode, setActiveMode] = useState<"random" | "custom">("random");
  
  // Random Mode state
  const [randomIdea, setRandomIdea] = useState<RandomIdeaResponse | null>(null);
  const [isFetchingRandom, setIsFetchingRandom] = useState(false);
  const [isSavingRandom, setIsSavingRandom] = useState(false);

  // Custom Mode state
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customGeneratedIdea, setCustomGeneratedIdea] = useState<Idea | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchRandomIdea = async () => {
    setIsFetchingRandom(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/ai/random-idea");
      if (res.ok) {
        const data = await res.json();
        // Normalize category if needed
        const validCategories = ["SaaS", "Mobile App", "AI", "Productivity", "Education"];
        const normCategory = validCategories.includes(data.category) ? data.category : "AI";
        setRandomIdea({
          ...data,
          category: normCategory
        });
      }
    } catch (err) {
      console.error("Failed to fetch random idea:", err);
    } finally {
      setIsFetchingRandom(false);
    }
  };

  const handleSaveRandom = async () => {
    if (!randomIdea) return;
    setIsSavingRandom(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: randomIdea.title,
          description: `${randomIdea.tagline}\n\n${randomIdea.description}`,
          category: randomIdea.category,
        })
      });
      if (res.ok) {
        const created: Idea = await res.json();
        setSaveSuccess(true);
        onSaveIdea(created, true); // autoConsult = true to trigger full expansion
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSavingRandom(false);
    }
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGeneratingCustom(true);
    setCustomGeneratedIdea(null);
    setSaveSuccess(false);

    try {
      // First create a draft idea or pass directly to AI
      const titleExtract = customPrompt.split("\n")[0].slice(0, 50) || "AI Blueprint Concept";
      
      const res = await fetch("/api/ai/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleExtract,
          description: customPrompt
        })
      });

      if (res.ok) {
        const expandedData = await res.json();
        
        // Build a temporary idea object for previewing
        const previewIdea: Idea = {
          id: Date.now().toString(),
          title: expandedData.title || titleExtract,
          description: customPrompt,
          status: "Researching",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: "AI",
          analysis: expandedData.analysis,
          techStack: expandedData.techStack,
          features: expandedData.features,
          schema: expandedData.schema,
          roadmap: expandedData.roadmap,
          monetization: expandedData.monetization,
          competitors: expandedData.competitors,
        };
        setCustomGeneratedIdea(previewIdea);
      }
    } catch (err) {
      console.error("Custom generation error:", err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!customGeneratedIdea) return;
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customGeneratedIdea)
      });
      if (res.ok) {
        const saved: Idea = await res.json();
        setSaveSuccess(true);
        onSaveIdea(saved, false);
      }
    } catch (err) {
      console.error("Save custom error:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F9F8F6] select-text">
      <div className="max-w-5xl mx-auto pb-16">
        {/* HERO TITLE */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b border-[#1A1A1A] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] text-[#FFD700] text-[10px] font-bold uppercase tracking-widest mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
              <Sparkles className="w-3 h-3" />
              <span>Foundry AI v2.5 Powered</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-[#1A1A1A]">
              Idea Generator & Foundry
            </h1>
            <p className="text-sm font-serif italic text-[#1A1A1A]/70 mt-2 max-w-2xl">
              Discover breakout venture opportunities with instant random idea synthesis, or input any rough prompt to forge custom architectural roadmaps and PostgreSQL schemas.
            </p>
          </div>

          <div className="flex gap-2 mt-6 md:mt-0 justify-center">
            <button
              onClick={() => setActiveMode("random")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === "random"
                  ? "bg-[#1A1A1A] text-[#F9F8F6] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                  : "bg-white text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#F0EEEA]"
              }`}
            >
              <Dice5 className="w-4 h-4 text-[#FFD700]" />
              <span>Random Idea</span>
            </button>
            <button
              onClick={() => setActiveMode("custom")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === "custom"
                  ? "bg-[#1A1A1A] text-[#F9F8F6] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                  : "bg-white text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#F0EEEA]"
              }`}
            >
              <Zap className="w-4 h-4 text-[#FFD700]" />
              <span>Custom Prompt</span>
            </button>
          </div>
        </div>

        {/* RANDOM IDEA TAB */}
        {activeMode === "random" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 bg-white p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-base font-black uppercase tracking-tight mb-2">
                Surprise Generator
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-serif italic mb-6">
                Need inspiration? Tap the button below to trigger our Gemini reasoning model to synthesize a fresh, high-conviction SaaS or AI startup concept designed for market gaps in 2026.
              </p>
              
              <button
                onClick={fetchRandomIdea}
                disabled={isFetchingRandom}
                className="w-full py-4 bg-[#1A1A1A] text-[#FFD700] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#333] transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingRandom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Idea...</span>
                  </>
                ) : (
                  <>
                    <Dice5 className="w-4 h-4" />
                    <span>Roll Random Idea</span>
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-[#1A1A1A]/10 text-[11px] text-[#1A1A1A]/60 flex items-center justify-between">
                <span>Model: Gemini 2.5 Flash</span>
                <span className="font-mono bg-[#F0EEEA] px-2 py-0.5">Temp: 0.9</span>
              </div>
            </div>

            <div className="md:col-span-8">
              {isFetchingRandom ? (
                <div className="bg-white border border-[#1A1A1A] p-16 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-h-[360px]">
                  <div className="w-12 h-12 border-4 border-[#1A1A1A] border-t-[#FFD700] rounded-full animate-spin mb-4" />
                  <h4 className="font-black uppercase tracking-widest text-sm mb-1">Scanning 2026 Tech Trends</h4>
                  <p className="font-serif italic text-xs text-[#1A1A1A]/60">Formulating product moat and value proposition...</p>
                </div>
              ) : randomIdea ? (
                <div className="bg-white border border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all animate-in fade-in duration-300">
                  <div className="bg-[#1A1A1A] text-[#F9F8F6] p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-[#FFD700] text-[#1A1A1A] font-bold mr-3 inline-block mb-2">
                        {randomIdea.category}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 border border-white/30 text-white font-bold inline-block mb-2">
                        Complexity: {randomIdea.complexity}
                      </span>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
                        {randomIdea.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-8">
                    <h4 className="text-lg font-serif italic font-bold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-4 mb-6">
                      "{randomIdea.tagline}"
                    </h4>

                    <div className="mb-8">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/50 block mb-2">
                        Venture Overview & Thesis
                      </span>
                      <p className="text-sm text-[#1A1A1A]/80 leading-relaxed font-sans">
                        {randomIdea.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#1A1A1A]/10">
                      <button
                        onClick={handleSaveRandom}
                        disabled={isSavingRandom || saveSuccess}
                        className="flex-1 py-3.5 bg-[#1A1A1A] text-[#FFD700] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#333] transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-75"
                      >
                        {isSavingRandom ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Building Full Dossier...</span>
                          </>
                        ) : saveSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Saved & Expanded!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-4 h-4" />
                            <span>Expand Blueprint & Save to Portfolio</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={fetchRandomIdea}
                        className="px-6 py-3.5 bg-[#F0EEEA] text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-[#E2DFD9] transition-all cursor-pointer"
                      >
                        Roll Next Idea
                      </button>
                    </div>
                    {saveSuccess && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-500/30 text-emerald-800 text-xs flex items-center justify-between">
                        <span>Success! Full architecture roadmap and database schema synthesized.</span>
                        <button onClick={onNavigatePortfolio} className="font-bold underline uppercase tracking-wider text-[10px] ml-2 hover:text-emerald-950">
                          View in Library &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#1A1A1A] p-16 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-h-[360px]">
                  <Dice5 className="w-16 h-16 text-[#1A1A1A]/20 mb-4 animate-bounce" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A]/40">
                    Ready for Inspiration
                  </h3>
                  <p className="text-xs font-serif italic text-[#1A1A1A]/50 mt-1 max-w-sm">
                    Click "Roll Random Idea" on the left to generate an exclusive startup concept.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CUSTOM PROMPT TAB */}
        {activeMode === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 bg-white p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-base font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FFD700] fill-[#1A1A1A]" />
                <span>Custom AI Architect</span>
              </h3>
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-serif italic mb-6">
                Have a raw idea, problem statement, or "Give me an idea for X" prompt? Type it below. Our Gemini Product Architect will expand it into a full tech stack, MVP roadmap, and PostgreSQL database blueprint.
              </p>

              <form onSubmit={handleGenerateCustom} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-[#1A1A1A]/60">
                    Your Prompt / Rough Concept
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Give me a SaaS idea for independent coffee shops to manage local supplier orders and loyalty rewards..."
                    rows={6}
                    className="w-full p-4 border border-[#1A1A1A] bg-[#F9F8F6] text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-sans resize-none"
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="text-[#1A1A1A]/40 font-bold uppercase py-1">Quick Try:</span>
                  <button
                    type="button"
                    onClick={() => setCustomPrompt("An AI agent that automatically reads gym contracts and cancels memberships on behalf of users.")}
                    className="px-2 py-1 bg-[#F0EEEA] hover:bg-[#E2DFD9] border border-[#1A1A1A]/20 cursor-pointer text-[#1A1A1A]"
                  >
                    Gym Contract Canceler AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPrompt("A micro-marketplace for wedding photographers to sell preset editing filters and lighting guides.")}
                    className="px-2 py-1 bg-[#F0EEEA] hover:bg-[#E2DFD9] border border-[#1A1A1A]/20 cursor-pointer text-[#1A1A1A]"
                  >
                    Wedding Creator Marketplace
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingCustom || !customPrompt.trim()}
                  className="w-full py-4 bg-[#1A1A1A] text-[#FFD700] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#333] transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isGeneratingCustom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Architecting Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate Full Roadmap & Dossier</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="md:col-span-7">
              {isGeneratingCustom ? (
                <div className="bg-white border border-[#1A1A1A] p-16 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-h-[460px]">
                  <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin mb-4" />
                  <h4 className="font-black uppercase tracking-widest text-sm mb-2">Synthesizing Product Architecture</h4>
                  <div className="max-w-sm space-y-2 text-xs font-serif italic text-[#1A1A1A]/60 mt-4">
                    <p className="animate-pulse">&bull; Formulating Executive Summary & Audience Moats</p>
                    <p className="animate-pulse delay-150">&bull; Structuring Next.js + Supabase Tech Stack</p>
                    <p className="animate-pulse delay-300">&bull; Writing Relational PostgreSQL CREATE TABLE SQL</p>
                    <p className="animate-pulse delay-500">&bull; Drafting 4-Week Execution Roadmap</p>
                  </div>
                </div>
              ) : customGeneratedIdea ? (
                <div className="bg-white border border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all animate-in fade-in duration-300">
                  <div className="bg-[#1A1A1A] text-white p-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-[#FFD700] text-[#1A1A1A] font-bold mr-3 inline-block">
                        Custom AI Synthesis
                      </span>
                      <h2 className="text-2xl font-black uppercase tracking-tight mt-2">
                        {customGeneratedIdea.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
                    {/* ANALYSIS */}
                    {customGeneratedIdea.analysis && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-2 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Executive Summary</span>
                        </h4>
                        <p className="text-sm font-serif italic text-[#1A1A1A] bg-[#F9F8F6] p-4 border-l-2 border-[#1A1A1A] leading-relaxed">
                          "{customGeneratedIdea.analysis.summary}"
                        </p>
                      </div>
                    )}

                    {/* TECH STACK */}
                    {customGeneratedIdea.techStack && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Recommended Tech Stack</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                            <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/50 block">Frontend</span>
                            <span className="text-xs font-bold font-mono text-[#1A1A1A] mt-0.5 block">{customGeneratedIdea.techStack.frontend}</span>
                          </div>
                          <div className="p-3 border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                            <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/50 block">Backend</span>
                            <span className="text-xs font-bold font-mono text-[#1A1A1A] mt-0.5 block">{customGeneratedIdea.techStack.backend}</span>
                          </div>
                          <div className="p-3 border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                            <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/50 block">Database</span>
                            <span className="text-xs font-bold font-mono text-[#1A1A1A] mt-0.5 block">{customGeneratedIdea.techStack.database}</span>
                          </div>
                          <div className="p-3 border border-[#1A1A1A]/20 bg-[#F9F8F6]">
                            <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/50 block">Hosting</span>
                            <span className="text-xs font-bold font-mono text-[#1A1A1A] mt-0.5 block">{customGeneratedIdea.techStack.hosting}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MVP FEATURES */}
                    {customGeneratedIdea.features?.mvp && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Core MVP Features</span>
                        </h4>
                        <div className="space-y-2">
                          {customGeneratedIdea.features.mvp.map((feat, i) => (
                            <div key={i} className="p-3 border border-[#1A1A1A]/10 flex items-start justify-between gap-4">
                              <div>
                                <span className="text-xs font-bold text-[#1A1A1A]">{feat.name}</span>
                                <p className="text-[11px] text-[#1A1A1A]/70 mt-0.5">{feat.desc}</p>
                              </div>
                              <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 bg-[#1A1A1A] text-white shrink-0">
                                {feat.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ROADMAP PREVIEW */}
                    {customGeneratedIdea.roadmap && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Execution Roadmap</span>
                        </h4>
                        <div className="space-y-3 font-mono text-xs">
                          {customGeneratedIdea.roadmap.map((phase, i) => (
                            <div key={i} className="p-3 bg-[#1A1A1A] text-[#F9F8F6]">
                              <div className="flex justify-between items-center text-[10px] text-[#FFD700] mb-1 font-bold uppercase">
                                <span>{phase.week}</span>
                                <span>[{phase.status}]</span>
                              </div>
                              <div className="font-bold font-sans text-sm">{phase.title}</div>
                              <div className="mt-1 text-[11px] text-white/70">
                                {phase.tasks.join(" • ")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACTION FOOTER */}
                    <div className="pt-6 border-t border-[#1A1A1A] sticky bottom-0 bg-white py-4">
                      <button
                        onClick={handleSaveCustom}
                        disabled={saveSuccess}
                        className="w-full py-4 bg-[#1A1A1A] text-[#FFD700] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#333] transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                      >
                        {saveSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Saved to Your Portfolio Library!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-4 h-4" />
                            <span>Save Custom Blueprint to Portfolio</span>
                          </>
                        )}
                      </button>
                      {saveSuccess && (
                        <div className="mt-3 text-center">
                          <button onClick={onNavigatePortfolio} className="text-xs font-bold underline uppercase tracking-wider text-emerald-700 hover:text-emerald-950">
                            Open Idea Library &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#1A1A1A] p-16 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-h-[460px]">
                  <Compass className="w-16 h-16 text-[#1A1A1A]/20 mb-4 animate-spin duration-1000" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A]/40">
                    Awaiting Architect Prompt
                  </h3>
                  <p className="text-xs font-serif italic text-[#1A1A1A]/50 mt-1 max-w-sm">
                    Enter your concept or "Give me an idea" prompt on the left to forge a tailored venture roadmap.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
