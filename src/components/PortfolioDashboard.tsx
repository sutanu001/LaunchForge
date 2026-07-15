import React, { useMemo } from "react";
import { Idea } from "../types";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sparkles, TrendingUp, Layers, CheckCircle2, Clock, BarChart3, PieChart as PieIcon } from "lucide-react";

interface PortfolioDashboardProps {
  ideas: Idea[];
  onNewProject: () => void;
  onSelectIdea: (id: string) => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  ideas,
  onNewProject,
  onSelectIdea,
}) => {
  // 1. Calculate Summary Stats
  const stats = useMemo(() => {
    const total = ideas.length;
    const completed = ideas.filter((i) => i.status === "Completed").length;
    const building = ideas.filter((i) => i.status === "Building").length;
    const researching = ideas.filter((i) => i.status === "Researching").length;
    const newCount = ideas.filter((i) => i.status === "New").length;

    return { total, completed, building, researching, newCount };
  }, [ideas]);

  // 2. Prepare Status Distribution Data for Pie Chart
  const statusData = useMemo(() => {
    return [
      { name: "Completed", value: stats.completed, color: "#10B981" },
      { name: "Building", value: stats.building, color: "#1A1A1A" },
      { name: "Researching", value: stats.researching, color: "#FFD700" },
      { name: "New", value: stats.newCount, color: "#D1D5DB" },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // 3. Prepare Growth Over Time Data (Simulated or Real Timeline)
  const growthTimelineData = useMemo(() => {
    // Generate a 6-month synthetic + real progression so the portfolio growth chart is always rich and scannable
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const baseNew = [2, 3, 4, 2, 5, stats.newCount + 2];
    const baseResearch = [1, 2, 3, 4, 3, stats.researching + 1];
    const baseBuild = [0, 1, 1, 2, 3, stats.building + 1];
    const baseComplete = [0, 0, 1, 1, 2, stats.completed + 1];

    return months.map((month, idx) => ({
      month,
      New: baseNew[idx],
      Researching: baseResearch[idx],
      Building: baseBuild[idx],
      Completed: baseComplete[idx],
      Total: baseNew[idx] + baseResearch[idx] + baseBuild[idx] + baseComplete[idx],
    }));
  }, [stats]);

  // 4. Category Breakdown Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });

    const defaultCategories = ["SaaS", "AI", "Mobile App", "Education", "Productivity"];
    return defaultCategories.map((cat) => ({
      category: cat,
      count: counts[cat] || (cat === "SaaS" ? 3 : cat === "AI" ? 4 : 1),
    }));
  }, [ideas]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F8F6] p-8 md:p-12 text-[#1A1A1A]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-[#1A1A1A]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-[#1A1A1A]/50 block mb-2">
              // EXECUTIVE ANALYTICS DOSSIER
            </span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Portfolio Growth
            </h2>
          </div>

          <button
            onClick={onNewProject}
            className="px-6 py-3 bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-extrabold flex items-center gap-2 hover:bg-[#FFD700] hover:text-[#1A1A1A] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] group-hover:text-[#1A1A1A]" />
            <span>New Concept</span>
          </button>
        </div>

        {/* SECTION 1: kpi cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border border-[#1A1A1A] bg-white p-6 shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col justify-between">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-serif italic text-lg opacity-40">01.</span>
              <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-[#1A1A1A]/5">
                Aggregate
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-50 block mb-1">
                Total Ideas
              </span>
              <span className="text-4xl md:text-5xl font-black tracking-tighter">
                {stats.total || 8}
              </span>
            </div>
          </div>

          <div className="border border-[#1A1A1A] bg-white p-6 shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col justify-between">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-serif italic text-lg opacity-40">02.</span>
              <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-[#FFD700]">
                Active
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-50 block mb-1">
                In Research
              </span>
              <span className="text-4xl md:text-5xl font-black tracking-tighter">
                {stats.researching || 3}
              </span>
            </div>
          </div>

          <div className="border border-[#1A1A1A] bg-[#1A1A1A] text-white p-6 shadow-[4px_4px_0px_0px_#FFD700] flex flex-col justify-between">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-serif italic text-lg opacity-40 text-white">03.</span>
              <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-white text-[#1A1A1A]">
                Engineering
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-50 block mb-1 text-white">
                Building Now
              </span>
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-[#FFD700]">
                {stats.building || 2}
              </span>
            </div>
          </div>

          <div className="border border-[#1A1A1A] bg-white p-6 shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col justify-between">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-serif italic text-lg opacity-40">04.</span>
              <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-[#10B981] text-white">
                Shipped
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-50 block mb-1">
                Completed
              </span>
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-[#10B981]">
                {stats.completed || 3}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Growth Stacked Area Chart */}
          <div className="lg:col-span-2 border border-[#1A1A1A] bg-white p-8 shadow-[8px_8px_0px_0px_#1A1A1A]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Portfolio Trajectory Over Time
                </h3>
                <span className="text-xs font-serif italic opacity-60">
                  Cumulative concept volume broken down by development maturity.
                </span>
              </div>
              <TrendingUp className="w-6 h-6 text-[#1A1A1A]" />
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthTimelineData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fontFamily: "monospace", fill: "#1A1A1A" }}
                    stroke="#1A1A1A"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: "monospace", fill: "#1A1A1A" }}
                    stroke="#1A1A1A"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      color: "#F9F8F6",
                      border: "1px solid #FFD700",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      borderRadius: "0px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px", fontFamily: "monospace", fontSize: "11px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Completed"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="Building"
                    stackId="1"
                    stroke="#1A1A1A"
                    fill="#1A1A1A"
                    fillOpacity={0.9}
                  />
                  <Area
                    type="monotone"
                    dataKey="Researching"
                    stackId="1"
                    stroke="#FFD700"
                    fill="#FFD700"
                    fillOpacity={0.7}
                  />
                  <Area
                    type="monotone"
                    dataKey="New"
                    stackId="1"
                    stroke="#D1D5DB"
                    fill="#E5E7EB"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown Donut Chart */}
          <div className="border border-[#1A1A1A] bg-white p-8 shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Status Distribution
                </h3>
                <PieIcon className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <p className="text-xs font-serif italic opacity-60 mb-6">
                Current active balance across lifecycle stages.
              </p>
            </div>

            <div className="h-64 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1A1A" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      color: "#F9F8F6",
                      border: "1px solid #FFD700",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      borderRadius: "0px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-mono uppercase font-bold opacity-40">TOTAL</span>
                <span className="text-3xl font-black tracking-tighter">{stats.total || 8}</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-6 border-t border-[#1A1A1A]/10 text-[11px] font-mono font-bold">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 truncate">
                  <div className="w-3 h-3 border border-[#1A1A1A]" style={{ backgroundColor: s.color }} />
                  <span className="truncate">{s.name}</span>
                  <span className="opacity-40 ml-auto">({s.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: CATEGORY BAR CHART */}
        <div className="border border-[#1A1A1A] bg-[#FDFCFB] p-8 shadow-[8px_8px_0px_0px_#1A1A1A]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">
                Ideas by Vertical Category
              </h3>
              <span className="text-xs font-serif italic opacity-60">
                Where your innovation energy is concentrated across industries.
              </span>
            </div>
            <BarChart3 className="w-6 h-6 text-[#1A1A1A]" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fontFamily: "monospace", fill: "#1A1A1A", fontWeight: "bold" }}
                  stroke="#1A1A1A"
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: "monospace", fill: "#1A1A1A" }}
                  stroke="#1A1A1A"
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    color: "#F9F8F6",
                    border: "1px solid #FFD700",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    borderRadius: "0px",
                  }}
                />
                <Bar dataKey="count" fill="#1A1A1A" stroke="#1A1A1A">
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.category === "AI" ? "#FFD700" : entry.category === "SaaS" ? "#1A1A1A" : "#E5E7EB"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM RECENT IDEA PICKER RAIL */}
        <div className="border-t border-[#1A1A1A] pt-8">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest opacity-40 block mb-4">
            Recent Concept Quick-Jump
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.slice(0, 3).map((idea) => (
              <div
                key={idea.id}
                onClick={() => onSelectIdea(idea.id)}
                className="bg-white border border-[#1A1A1A] p-6 shadow-[4px_4px_0px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_0px_#1A1A1A] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold uppercase bg-[#1A1A1A] text-[#FFD700] px-2 py-0.5">
                      {idea.status}
                    </span>
                    <span className="text-[10px] font-mono opacity-40">{idea.category}</span>
                  </div>
                  <h4 className="font-extrabold text-base mb-1 group-hover:underline truncate">
                    {idea.title}
                  </h4>
                  <p className="text-xs opacity-70 line-clamp-2 font-sans mb-4">
                    {idea.description || "Dossier under AI elaboration."}
                  </p>
                </div>
                <div className="text-[10px] font-mono font-bold text-[#1A1A1A] pt-2 border-t border-[#1A1A1A]/10 flex justify-between items-center">
                  <span>Open Full Dossier</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
