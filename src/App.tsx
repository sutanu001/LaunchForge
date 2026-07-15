/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Idea } from "./types";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { IdeaDetail } from "./components/IdeaDetail";
import { ExploreHub } from "./components/ExploreHub";
import { PortfolioDashboard } from "./components/PortfolioDashboard";
import { NewProjectModal } from "./components/NewProjectModal";
import { IdeaGenerator } from "./components/IdeaGenerator";

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeHubTab, setActiveHubTab] = useState<"library" | "explore" | "dashboard" | "generator">("library");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial ideas on load
  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ideas");
      if (res.ok) {
        const data: Idea[] = await res.json();
        setIdeas(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load project dossiers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIdea = (updated: Idea) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
    fetch(`/api/ideas/${id}`, { method: "DELETE" }).catch(console.error);
  };

  const handleProjectCreated = async (newIdea: Idea, autoConsult: boolean) => {
    setIsModalOpen(false);
    setIdeas((prev) => [newIdea, ...prev]);
    setSelectedId(newIdea.id);
    setActiveHubTab("library");

    if (autoConsult) {
      try {
        const res = await fetch("/api/ai/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId: newIdea.id,
            title: newIdea.title,
            description: newIdea.description,
          }),
        });
        if (res.ok) {
          const expanded = await res.json();
          handleUpdateIdea(expanded);
        }
      } catch (err) {
        console.error("Auto consult error:", err);
      }
    }
  };

  const selectedIdea = ideas.find((i) => i.id === selectedId) || null;
  const selectedIdx = ideas.findIndex((i) => i.id === selectedId);

  return (
    <div className="flex flex-col h-screen w-full bg-[#F9F8F6] text-[#1A1A1A] font-sans overflow-hidden select-text">
      {/* HEADER */}
      <Header
        activeTab={activeHubTab}
        setActiveTab={setActiveHubTab}
        onNewProject={() => setIsModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center font-serif italic text-lg text-[#1A1A1A]/50">
            Loading LaunchForge Startup Dossiers...
          </div>
        ) : activeHubTab === "library" ? (
          <>
            {/* LEFT SIDEBAR: IDEA LIST */}
            <Sidebar
              ideas={ideas}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              onNewProject={() => setIsModalOpen(true)}
            />

            {/* MAIN CONTENT: IDEA DETAIL */}
            <IdeaDetail
              idea={selectedIdea}
              index={Math.max(0, selectedIdx)}
              onUpdate={handleUpdateIdea}
              onDelete={handleDeleteIdea}
            />
          </>
        ) : activeHubTab === "dashboard" ? (
          /* PORTFOLIO DASHBOARD */
          <PortfolioDashboard
            ideas={ideas}
            onNewProject={() => setIsModalOpen(true)}
            onSelectIdea={(id) => {
              setSelectedId(id);
              setActiveHubTab("library");
            }}
          />
        ) : activeHubTab === "generator" ? (
          /* IDEA GENERATOR */
          <IdeaGenerator
            onSaveIdea={handleProjectCreated}
            onNavigatePortfolio={() => setActiveHubTab("library")}
          />
        ) : (
          /* EXPLORE HUB */
          <ExploreHub
            ideas={ideas}
            onSelectIdea={(id) => {
              setSelectedId(id);
              setActiveHubTab("library");
            }}
            onNewProject={() => setIsModalOpen(true)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="p-4 border-t border-[#1A1A1A] bg-white flex justify-between items-center px-8 shrink-0 select-none">
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          LaunchForge Studio — AI Venture Blueprint & Architecture Engine
        </div>
        <div className="flex space-x-6">
          <button
            onClick={() => {
              if (selectedIdea) {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedIdea, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `${selectedIdea.title.toLowerCase().replace(/\s+/g, "_")}_dossier.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }
            }}
            className="text-[10px] uppercase tracking-widest font-bold italic underline cursor-pointer hover:text-[#FFD700] transition-colors"
          >
            Export Dossier
          </button>
          <button
            onClick={() => setActiveHubTab("generator")}
            className="text-[10px] uppercase tracking-widest font-bold italic underline cursor-pointer hover:text-[#FFD700] transition-colors text-emerald-600"
          >
            GENERATE IDEAS
          </button>
        </div>
      </footer>

      {/* MODAL */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}
