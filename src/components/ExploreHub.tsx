import React, { useState } from "react";
import { Idea } from "../types";
import { Search, Sparkles, ArrowRight, Layers, Cpu, Compass } from "lucide-react";

interface ExploreHubProps {
  ideas: Idea[];
  onSelectIdea: (id: string) => void;
  onNewProject: () => void;
}

export const ExploreHub: React.FC<ExploreHubProps> = ({
  ideas,
  onSelectIdea,
  onNewProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", "SaaS", "Mobile App", "AI", "Productivity", "Education"];

  const filtered = ideas.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F8F6] p-12 text-[#1A1A1A]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Banner */}
        <div className="border border-[#1A1A1A] bg-white p-12 shadow-[8px_8px_0px_0px_#1A1A1A] relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-[#1A1A1A]/50 block mb-2">
              // COMMUNITY BLUEPRINT REPOSITORY
            </span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none mb-4">
              Explore Ideas
            </h2>
            <p className="font-serif italic text-xl text-[#1A1A1A]/70 mb-8 leading-relaxed">
              Discover production-ready startup blueprints, generated database schemas,
              and 4-week execution roadmaps shared by the LaunchForge community.
            </p>
            <button
              onClick={onNewProject}
              className="px-8 py-3 bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-extrabold flex items-center gap-3 hover:bg-[#FFD700] hover:text-[#1A1A1A] hover:border hover:border-[#1A1A1A] transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <Sparkles className="w-4 h-4 text-[#FFD700] group-hover:text-[#1A1A1A]" />
              <span>Submit New Idea Blueprint</span>
            </button>
          </div>
          <Compass className="w-80 h-80 absolute -right-16 -bottom-16 text-[#1A1A1A]/5 stroke-[0.5] pointer-events-none" />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1A1A1A] pb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-bold font-mono border cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                    : "bg-white text-[#1A1A1A]/70 border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#1A1A1A]/40" />
            <input
              type="text"
              placeholder="FILTER PUBLIC BLUEPRINTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#1A1A1A] pl-10 pr-4 py-2 text-xs font-mono placeholder:text-[#1A1A1A]/30 focus:outline-none shadow-[2px_2px_0px_0px_#1A1A1A]"
            />
          </div>
        </div>

        {/* Grid of Public Blueprints */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onSelectIdea(item.id)}
              className="border border-[#1A1A1A] bg-white p-8 shadow-[6px_6px_0px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_0px_#1A1A1A] hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between cursor-pointer group min-h-[18rem]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1A1A1A] text-[#FFD700] uppercase font-bold tracking-widest">
                    {item.category}
                  </span>
                  <span className="text-xs font-serif italic text-[#1A1A1A]/40 font-bold">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:underline">
                  {item.title}
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-sans line-clamp-3 mb-6">
                  {item.description || item.analysis?.summary || "Startup idea under synthesis."}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] font-mono font-bold">
                <div className="flex items-center gap-1.5 opacity-60">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{item.analysis?.complexityScore || "Pending"} Score</span>
                </div>
                <div className="flex items-center gap-1 text-[#1A1A1A] group-hover:translate-x-1 transition-transform">
                  <span>View Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
