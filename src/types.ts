export interface Idea {
  id: string;
  title: string;
  description: string;
  status: "New" | "Researching" | "Building" | "Completed" | "Archived";
  createdAt: string;
  updatedAt: string;
  category: "SaaS" | "Mobile App" | "AI" | "Productivity" | "Education";
  analysis?: {
    summary: string;
    targetAudience: string[];
    problemsSolved: string[];
    complexityScore: "Low" | "Moderate" | "High" | "Extreme";
  };
  techStack?: {
    frontend: string;
    backend: string;
    database: string;
    hosting: string;
  };
  features?: {
    mvp: { name: string; category: "Must Have" | "Should Have" | "Nice To Have"; desc: string }[];
    future: string[];
    brainstorm?: { name: string; tier: "Core" | "Growth" | "Premium"; description?: string }[];
  };
  schema?: {
    sql: string;
    explanations: { table: string; reason: string }[];
  };
  roadmap?: {
    week: string;
    title: string;
    tasks: string[];
    status: "Ready" | "Next" | "Pending";
  }[];
  monetization?: {
    model: string;
    pros: string;
    cons: string;
    verdict: string;
  }[];
  competitors?: {
    name: string;
    differentiation: string;
    pros: string[];
  }[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  notes?: string;
}
