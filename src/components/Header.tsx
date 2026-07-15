import React from "react";
import { Sparkles, Globe, Library, BarChart3, Lightbulb } from "lucide-react";

interface HeaderProps {
  activeTab: "library" | "explore" | "dashboard" | "generator";
  setActiveTab: (tab: "library" | "explore" | "dashboard" | "generator") => void;
  onNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewProject,
}) => {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-[#1A1A1A] bg-[#F9F8F6] shrink-0">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
          <span className="text-[#F9F8F6] font-bold text-xl tracking-wider">L</span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-[#1A1A1A]">
            LaunchForge
          </h1>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/50 block -mt-1">
            Idea Hub & AI Consultant
          </span>
        </div>
      </div>

      <nav className="flex space-x-6 md:space-x-10 items-center">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center space-x-2 text-xs uppercase tracking-widest font-bold transition-all py-1 cursor-pointer ${
            activeTab === "library"
              ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
              : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>

        <button
          onClick={() => setActiveTab("generator")}
          className={`flex items-center space-x-2 text-xs uppercase tracking-widest font-bold transition-all py-1 cursor-pointer ${
            activeTab === "generator"
              ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
              : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>Idea Generator</span>
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center space-x-2 text-xs uppercase tracking-widest font-bold transition-all py-1 cursor-pointer ${
            activeTab === "dashboard"
              ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
              : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Growth</span>
        </button>

        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center space-x-2 text-xs uppercase tracking-widest font-bold transition-all py-1 cursor-pointer ${
            activeTab === "explore"
              ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
              : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Explore</span>
        </button>

        <button
          onClick={onNewProject}
          className="px-6 py-2.5 bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-bold flex items-center space-x-2 hover:bg-[#333333] transition-colors cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>New Project</span>
        </button>
      </nav>
    </header>
  );
};
