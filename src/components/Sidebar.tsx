import React, { useState } from "react";
import { Idea } from "../types";
import { Search, Filter, Plus, Clock } from "lucide-react";

interface SidebarProps {
  ideas: Idea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  ideas,
  selectedId,
  onSelect,
  onNewProject,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ? true : idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Idea["status"]) => {
    switch (status) {
      case "Researching":
        return (
          <span className="text-[10px] py-0.5 px-2 bg-[#FFD700] text-[#1A1A1A] uppercase font-bold tracking-wider">
            Researching
          </span>
        );
      case "New":
        return (
          <span className="text-[10px] py-0.5 px-2 bg-[#E0E0E0] text-[#1A1A1A] uppercase font-bold tracking-wider">
            New
          </span>
        );
      case "Building":
        return (
          <span className="text-[10px] py-0.5 px-2 bg-[#1A1A1A] text-white uppercase font-bold tracking-wider">
            Building
          </span>
        );
      case "Completed":
        return (
          <span className="text-[10px] py-0.5 px-2 bg-[#10B981] text-white uppercase font-bold tracking-wider">
            Completed
          </span>
        );
      case "Archived":
        return (
          <span className="text-[10px] py-0.5 px-2 bg-[#D1D5DB] text-[#4B5563] uppercase font-bold tracking-wider line-through">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <aside className="w-80 border-r border-[#1A1A1A] bg-[#F3F2EE] flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-6 border-b border-[#1A1A1A] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">
            Dossiers ({ideas.length})
          </span>
          <button
            onClick={onNewProject}
            className="p-1 hover:bg-[#1A1A1A]/10 transition-colors rounded cursor-pointer"
            title="Create New Project"
          >
            <Plus className="w-4 h-4 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1A1A1A]/40" />
          <input
            type="text"
            placeholder="SEARCH IDEAS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A] pl-8 pr-3 py-1.5 text-xs font-mono placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["All", "New", "Researching", "Building", "Completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border shrink-0 cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A]"
                  : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/30 hover:border-[#1A1A1A]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#1A1A1A]">
        {filteredIdeas.length === 0 ? (
          <div className="p-8 text-center text-xs opacity-50 font-serif italic">
            No startup dossiers match your search.
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const isSelected = idea.id === selectedId;
            return (
              <div
                key={idea.id}
                onClick={() => onSelect(idea.id)}
                className={`p-6 transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-white shadow-[inset_4px_0px_0px_0px_#1A1A1A]"
                    : "hover:bg-white/60 bg-[#F3F2EE]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(idea.status)}
                  <span className="text-[10px] font-mono opacity-40 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(idea.updatedAt || idea.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/50 bg-[#1A1A1A]/5 px-1.5 py-0.5">
                    {idea.category}
                  </span>
                  <h3 className="font-extrabold text-sm text-[#1A1A1A] truncate">
                    {idea.title}
                  </h3>
                </div>
                <p className="text-xs text-[#1A1A1A]/65 leading-relaxed line-clamp-2 font-sans">
                  {idea.description ||
                    idea.analysis?.summary ||
                    "No description provided yet."}
                </p>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
