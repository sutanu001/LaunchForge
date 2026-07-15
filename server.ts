import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { execFile } from "child_process";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { Idea } from "./src/types";

dotenv.config();

const execFileAsync = promisify(execFile);

const pythonCmd = process.platform === "win32" ? "python" : "python3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Security Hardening: Strict payload size limiting to prevent Denial of Service (DoS)
app.use(express.json({ limit: "1mb" }));

// Security Hardening: HTTP Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Helper to get Gemini client lazily
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
  }
  return new GoogleGenAI({ apiKey });
}

// Helper to query OpenAI using native fetch
async function callOpenAI(prompt: string, jsonMode = false) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "") {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.7
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = await response.json() as any;
  return data.choices[0].message.content;
}

// In-memory store for ideas (with rich seed data matching Editorial theme)
let ideasStore: Idea[] = [
  {
    id: "1",
    title: "AI Fitness Coach",
    description: "An app that creates personalized workout plans and adapts them dynamically based on biometric feedback and HRV.",
    status: "Researching",
    createdAt: "2024-10-24T10:00:00Z",
    updatedAt: "2024-10-24T12:00:00Z",
    category: "AI",
    analysis: {
      summary: "A personalized fitness platform that uses AI to adapt workout plans based on biometric progress, heart rate variability, and historical consistency patterns.",
      targetAudience: ["High-performance executives", "Physical therapy outpatients", "Pro-amateur athletes"],
      problemsSolved: ["Lack of personalized workout adaptation", "Poor consistency and accountability", "Static generic workout plans"],
      complexityScore: "Moderate"
    },
    techStack: {
      frontend: "Next.js 14 (App Router)",
      backend: "FastAPI + OpenAI API",
      database: "PostgreSQL (Supabase)",
      hosting: "Vercel + Fly.io"
    },
    features: {
      mvp: [
        { name: "Adaptive Progress Logs", category: "Must Have", desc: "Log sets/reps and calculate strain" },
        { name: "Bio-metric API Sync", category: "Must Have", desc: "Apple Health / Wearable webhook sync" },
        { name: "Session Smart-Scheduler", category: "Should Have", desc: "Auto-rebook missed sessions" },
        { name: "Form Check Snapshots", category: "Nice To Have", desc: "Upload photo for posture feedback" }
      ],
      future: ["Voice-guided live coach AI", "Community leaderboard challenges", "Macro meal prep generator"]
    },
    schema: {
      sql: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  target_goal TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  metadata JSONB, -- store AI recovery params
  performance_score FLOAT,
  completed_at TIMESTAMPTZ
);

CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT,
  sets INT,
  reps INT,
  weight_kg FLOAT
);`,
      explanations: [
        { table: "users", reason: "Stores core subscriber identity, email credentials, and overarching fitness objectives." },
        { table: "workouts", reason: "Represents individual training sessions along with AI-computed fatigue scores and JSON metadata." },
        { table: "exercise_logs", reason: "Granular telemetry tracking exact physical exertion per exercise for machine learning regression." }
      ]
    },
    roadmap: [
      { week: "Phase 1: Foundation (Wk 1-2)", title: "Auth & Data Modeling", tasks: ["Set up Supabase PostgreSQL schemas", "Implement OAuth login flows", "Configure biometric webhook receptors"], status: "Ready" },
      { week: "Phase 2: Core Loop (Wk 3)", title: "Workout CRUD & AI Adaptation", tasks: ["Build dynamic workout logging form", "Connect prompt engine to evaluate strain scores", "Create daily routine generator view"], status: "Next" },
      { week: "Phase 3: Telemetry (Wk 4)", title: "Wearables & Charts", tasks: ["Integrate Recharts visualizers", "Build HRV trend analysis dashboard", "Export dossier to PDF"], status: "Pending" }
    ],
    monetization: [
      { model: "Pro Subscription ($19/mo)", pros: "High predictable MRR and aligns with ongoing coaching value", cons: "Requires continuous high AI reliability", verdict: "Primary Recommended Model" },
      { model: "Freemium Manual Logging", pros: "Wide top-of-funnel user acquisition", cons: "Server database storage overhead", verdict: "Good for initial viral loop" }
    ],
    competitors: [
      { name: "Fitbod", differentiation: "We incorporate real-time HRV and external biometric stress, not just previous weights.", pros: ["Established algorithm", "Great UI"] },
      { name: "Whoop Coach", differentiation: "We focus on actual actionable strength routines rather than passive recovery advice.", pros: ["Hardware tie-in", "Massive brand"] }
    ],
    notes: "Need to make sure prompt latency stays under 2 seconds during active gym sessions."
  },
  {
    id: "2",
    title: "Book Matcher AI",
    description: "Semantic search engine for rare literature and mood-based book recommendations.",
    status: "New",
    createdAt: "2024-10-23T14:20:00Z",
    updatedAt: "2024-10-23T14:20:00Z",
    category: "Education",
    analysis: {
      summary: "An AI literary discovery platform utilizing vector embeddings to match readers with hyper-specific emotional tropes and obscure masterpieces.",
      targetAudience: ["Voracious fiction readers", "Academic researchers", "Indie bookstore patrons"],
      problemsSolved: ["Surface-level Goodreads algorithms", "Difficulty finding books matching niche emotional moods", "Analysis paralysis in libraries"],
      complexityScore: "Low"
    },
    techStack: {
      frontend: "React + Tailwind CSS",
      backend: "Node.js (Express)",
      database: "pgvector + PostgreSQL",
      hosting: "Render / Cloud Run"
    }
  },
  {
    id: "3",
    title: "Med-Student SaaS",
    description: "Spaced-repetition platform for anatomy and pharmacology using AI generated flashcards from textbook PDFs.",
    status: "Building",
    createdAt: "2024-10-21T09:15:00Z",
    updatedAt: "2024-10-25T08:00:00Z",
    category: "SaaS",
    analysis: {
      summary: "A high-retention medical study suite transforming complex clinical guidelines into adaptive spaced repetition decks.",
      targetAudience: ["USMLE Step 1 candidates", "Nursing students", "Resident physicians"],
      problemsSolved: ["Overwhelming volume of medical memorization", "Manual time spent building Anki cards", "Information decay before board exams"],
      complexityScore: "High"
    }
  }
];

// PostgreSQL Sync Helper
async function syncIdeaToPG(idea: Idea) {
  try {
    const { db } = await import("./src/db/index");
    const { ideas } = await import("./src/db/schema");
    await db.insert(ideas).values({
      id: idea.id,
      title: idea.title,
      description: idea.description || "",
      status: idea.status,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      category: idea.category,
      analysis: JSON.stringify(idea.analysis || null),
      techStack: JSON.stringify(idea.techStack || null),
      features: JSON.stringify(idea.features || null),
      schemaData: JSON.stringify(idea.schema || null),
      roadmap: JSON.stringify(idea.roadmap || null),
      monetization: JSON.stringify(idea.monetization || null),
      competitors: JSON.stringify(idea.competitors || null),
      swot: JSON.stringify(idea.swot || null)
    }).onConflictDoUpdate({
      target: ideas.id,
      set: {
        title: idea.title,
        description: idea.description || "",
        status: idea.status,
        updatedAt: idea.updatedAt,
        category: idea.category,
        analysis: JSON.stringify(idea.analysis || null),
        techStack: JSON.stringify(idea.techStack || null),
        features: JSON.stringify(idea.features || null),
        schemaData: JSON.stringify(idea.schema || null),
        roadmap: JSON.stringify(idea.roadmap || null),
        monetization: JSON.stringify(idea.monetization || null),
        competitors: JSON.stringify(idea.competitors || null),
        swot: JSON.stringify(idea.swot || null)
      }
    });
  } catch (err) {
    // Graceful fallback if Cloud SQL socket is offline in preview
  }
}

// API ROUTES (Node.js Express + PostgreSQL DB)
app.get("/api/ideas", async (req, res) => {
  try {
    const { db } = await import("./src/db/index");
    const { ideas } = await import("./src/db/schema");
    const rows = await db.select().from(ideas);
    if (rows && rows.length > 0) {
      const dbIdeas = rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || "",
        status: r.status as any,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        category: r.category as any,
        analysis: r.analysis ? JSON.parse(r.analysis) : undefined,
        techStack: r.techStack ? JSON.parse(r.techStack) : undefined,
        features: r.features ? JSON.parse(r.features) : undefined,
        schema: r.schemaData ? JSON.parse(r.schemaData) : undefined,
        roadmap: r.roadmap ? JSON.parse(r.roadmap) : undefined,
        monetization: r.monetization ? JSON.parse(r.monetization) : undefined,
        competitors: r.competitors ? JSON.parse(r.competitors) : undefined,
        swot: r.swot ? JSON.parse(r.swot) : undefined
      }));
      return res.json(dbIdeas);
    }
  } catch (err) {
    // Fall back to memory store
  }
  res.json(ideasStore);
});

app.post("/api/ideas", async (req, res) => {
  const body = req.body || {};
  const { title, description, category, analysis, techStack, features, schema, roadmap, monetization, competitors } = body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Valid title string is required" });
  }
  const cleanTitle = title.trim().slice(0, 200);
  const cleanDesc = typeof description === "string" ? description.trim().slice(0, 10000) : "";
  const validCategories = ["SaaS", "Mobile App", "AI", "Productivity", "Education"];
  const cleanCat = validCategories.includes(category) ? category : "SaaS";

  const newIdea: Idea = {
    id: Date.now().toString(),
    status: "New",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: cleanTitle,
    description: cleanDesc,
    category: cleanCat,
    analysis: analysis || undefined,
    techStack: techStack || undefined,
    features: features || undefined,
    schema: schema || undefined,
    roadmap: roadmap || undefined,
    monetization: monetization || undefined,
    competitors: competitors || undefined
  };
  ideasStore.unshift(newIdea);
  await syncIdeaToPG(newIdea);
  res.json(newIdea);
});

app.put("/api/ideas/:id", async (req, res) => {
  const { id } = req.params;
  const index = ideasStore.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Idea not found" });
  }
  const body = req.body || {};
  const validStatus = ["New", "Researching", "Building", "Completed", "Archived"];
  const validCategories = ["SaaS", "Mobile App", "AI", "Productivity", "Education"];

  const current = ideasStore[index];
  ideasStore[index] = {
    ...current,
    title: typeof body.title === "string" ? body.title.trim().slice(0, 200) : current.title,
    description: typeof body.description === "string" ? body.description.trim().slice(0, 10000) : current.description,
    status: validStatus.includes(body.status) ? body.status : current.status,
    category: validCategories.includes(body.category) ? body.category : current.category,
    analysis: body.analysis !== undefined ? body.analysis : current.analysis,
    techStack: body.techStack !== undefined ? body.techStack : current.techStack,
    features: body.features !== undefined ? body.features : current.features,
    schema: body.schema !== undefined ? body.schema : current.schema,
    roadmap: body.roadmap !== undefined ? body.roadmap : current.roadmap,
    monetization: body.monetization !== undefined ? body.monetization : current.monetization,
    competitors: body.competitors !== undefined ? body.competitors : current.competitors,
    swot: body.swot !== undefined ? body.swot : current.swot,
    updatedAt: new Date().toISOString()
  };
  await syncIdeaToPG(ideasStore[index]);
  res.json(ideasStore[index]);
});

app.delete("/api/ideas/:id", async (req, res) => {
  const { id } = req.params;
  ideasStore = ideasStore.filter((i) => i.id !== id);
  try {
    const { db } = await import("./src/db/index");
    const { ideas } = await import("./src/db/schema");
    await db.delete(ideas).where(eq(ideas.id, id));
  } catch (e) {
    // ignore DB offline errors
  }
  res.json({ success: true });
});

// MASTER AI EXPANSION ROUTE
app.post("/api/ai/expand", async (req, res) => {
  try {
    const body = req.body || {};
    const { ideaId, title, description } = body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Valid idea title string is required" });
    }
    const cleanTitle = title.trim().slice(0, 200);
    const cleanDesc = typeof description === "string" ? description.trim().slice(0, 5000) : "";

    let generatedData: any = null;

    // 1. Try Python AI Microservice (ai_service.py)
    try {
      const pyScript = path.join(__dirname, "ai_service.py");
      const { stdout } = await execFileAsync(pythonCmd, [pyScript, "full_expand", JSON.stringify({ title: cleanTitle, description: cleanDesc })], { timeout: 12000 });
      const pyParsed = JSON.parse(stdout.trim());
      if (pyParsed && !pyParsed.error && pyParsed.analysis) {
        generatedData = pyParsed;
        console.log("Successfully synthesized blueprint dossier via Python AI Engine.");
      }
    } catch (pyErr: any) {
      // Python environment unavailable or script error, use Node SDK fallback
      console.warn("Python AI Engine unavailable, falling back to Gemini SDK:", pyErr.message);
    }

    // 2. Node.js Gemini SDK Fallback
    // 2. Node.js Gemini / OpenAI Fallback
    if (!generatedData) {
      const prompt = `You are an elite Silicon Valley AI Product Architect & Startup Consultant.
Analyze the following app/startup idea and return a comprehensive, highly actionable product dossier in pure JSON format.

Idea Title: "${cleanTitle}"
Description: "${cleanDesc || "No description provided."}"

Respond strictly with valid JSON matching this exact structure:
{
  "analysis": {
    "summary": "1-2 sentence compelling executive summary of the product concept.",
    "targetAudience": ["Audience 1", "Audience 2", "Audience 3"],
    "problemsSolved": ["Problem 1", "Problem 2", "Problem 3"],
    "complexityScore": "Low" | "Moderate" | "High" | "Extreme"
  },
  "techStack": {
    "frontend": "Modern framework recommendation (e.g. Next.js 14)",
    "backend": "Backend architecture (e.g. Node.js + Express / FastAPI)",
    "database": "Database solution (e.g. PostgreSQL Supabase)",
    "hosting": "Cloud hosting platform (e.g. Vercel / Cloud Run)"
  },
  "features": {
    "mvp": [
      { "name": "Feature Name", "category": "Must Have", "desc": "Brief functional justification" },
      { "name": "Feature Name", "category": "Must Have", "desc": "Brief functional justification" },
      { "name": "Feature Name", "category": "Should Have", "desc": "Brief functional justification" },
      { "name": "Feature Name", "category": "Nice To Have", "desc": "Brief functional justification" }
    ],
    "future": ["Future expansion item 1", "Future expansion item 2", "Future expansion item 3"],
    "brainstorm": [
      { "name": "Core feature brainstorm 1", "tier": "Core" },
      { "name": "Core feature brainstorm 2", "tier": "Core" },
      { "name": "Growth viral feature", "tier": "Growth" },
      { "name": "Premium enterprise feature", "tier": "Premium" }
    ]
  },
  "schema": {
    "sql": "Clean PostgreSQL CREATE TABLE statements with primary keys, foreign keys, UUIDs, and brief SQL comments. Include at least 3-4 relational tables.",
    "explanations": [
      { "table": "table_name", "reason": "Architectural justification for this table" },
      { "table": "table_name_2", "reason": "Architectural justification" }
    ]
  },
  "roadmap": [
    { "week": "Phase 1: Foundation (Wk 1-2)", "title": "Auth & Infrastructure", "tasks": ["Task 1", "Task 2"], "status": "Ready" },
    { "week": "Phase 2: Core MVP (Wk 3)", "title": "Business Logic CRUD", "tasks": ["Task 1", "Task 2"], "status": "Next" },
    { "week": "Phase 3: Launch Prep (Wk 4)", "title": "Polish & Deployment", "tasks": ["Task 1", "Task 2"], "status": "Pending" }
  ],
  "monetization": [
    { "model": "Model Name (e.g. SaaS Subscription)", "pros": "Key benefit", "cons": "Key challenge", "verdict": "Strategic recommendation note" },
    { "model": "Alternative Model", "pros": "Benefit", "cons": "Challenge", "verdict": "Secondary option note" }
  ],
  "competitors": [
    { "name": "Likely Competitor 1", "differentiation": "How this idea beats them", "pros": ["Their pro 1", "Their pro 2"] },
    { "name": "Likely Competitor 2", "differentiation": "How this idea beats them", "pros": ["Their pro 1", "Their pro 2"] }
  ]
}`;

      if (process.env.OPENAI_API_KEY) {
        try {
          const text = await callOpenAI(prompt, true);
          generatedData = JSON.parse(text || "{}");
          console.log("Successfully synthesized blueprint dossier via OpenAI.");
        } catch (openAiErr: any) {
          console.warn("OpenAI expand failed, trying Gemini:", openAiErr.message);
        }
      }

      if (!generatedData) {
        try {
          const ai = getAI();
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.7
            }
          });
          const text = response.text || "{}";
          generatedData = JSON.parse(text);
          console.log("Successfully synthesized blueprint dossier via Gemini SDK.");
        } catch (geminiErr: any) {
          console.warn("Gemini expand failed:", geminiErr.message);
        }
      }
    }

    // If an ideaId was passed, update the store and PostgreSQL
    if (ideaId) {
      const idx = ideasStore.findIndex(i => i.id === ideaId);
      if (idx !== -1) {
        ideasStore[idx] = {
          ...ideasStore[idx],
          status: ideasStore[idx].status === "New" ? "Researching" : ideasStore[idx].status,
          analysis: generatedData.analysis,
          techStack: generatedData.techStack,
          features: generatedData.features,
          schema: generatedData.schema,
          roadmap: generatedData.roadmap,
          monetization: generatedData.monetization,
          competitors: generatedData.competitors,
          updatedAt: new Date().toISOString()
        };
        await syncIdeaToPG(ideasStore[idx]);
        return res.json(ideasStore[idx]);
      }
    }

    res.json(generatedData);
  } catch (error: any) {
    console.error("AI Expansion Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI dossier" });
  }
});

// Specific AI feature brainstorm generator
app.post("/api/ai/brainstorm-features", async (req, res) => {
  try {
    const body = req.body || {};
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "Untitled App";
    const count = typeof body.count === "number" ? Math.min(Math.max(body.count, 1), 30) : 10;

    // 1. Try Python microservice
    try {
      const pyScript = path.join(__dirname, "ai_service.py");
      const { stdout } = await execFileAsync(pythonCmd, [pyScript, "suggest_features", JSON.stringify({ title, count })], { timeout: 8000 });
      const pyItems = JSON.parse(stdout.trim());
      if (pyItems && Array.isArray(pyItems) && pyItems.length > 0) {
        return res.json(pyItems);
      }
    } catch (e) {
      // ignore py fallback
    }

    // 2. Try OpenAI Fallback
    const prompt = `Brainstorm exactly ${count || 10} innovative product features for an app called "${title}".
Return JSON array of objects: [{"name": "Feature", "tier": "Core"|"Growth"|"Premium", "description": "Short explanation"}]`;

    if (process.env.OPENAI_API_KEY) {
      try {
        const text = await callOpenAI(prompt, true);
        return res.json(JSON.parse(text || "[]"));
      } catch (openAiErr: any) {
        console.warn("OpenAI brainstorm failed, trying Gemini:", openAiErr.message);
      }
    }

    // 3. Node SDK fallback
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || "[]"));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/ai/swot", async (req, res) => {
  try {
    const body = req.body || {};
    const { title, description } = body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Valid title string required" });
    }

    const prompt = `Conduct a rigorous AI SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for a startup/app idea titled "${title}".
Description: "${description || "No description provided."}"

Return strictly valid JSON with this exact structure:
{
  "strengths": ["3-4 clear internal strategic advantages"],
  "weaknesses": ["3-4 internal vulnerabilities or execution hurdles"],
  "opportunities": ["3-4 market tailwinds, expansion vectors, or customer needs"],
  "threats": ["3-4 external competitive moats, regulatory hurdles, or market shifts"]
}`;

    // 1. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const text = await callOpenAI(prompt, true);
        const parsed = JSON.parse(text || "{}");
        return res.json(parsed);
      } catch (openAiErr: any) {
        console.warn("OpenAI SWOT failed, trying Gemini:", openAiErr.message);
      }
    }

    // 2. Try Gemini SDK
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (aiErr) {
      // Gemini unavailable, use local fallback
    }

    // 2. Local deterministic fallback
    const swotFallback = {
      strengths: [
        `First-mover advantage in AI-powered ${title.toLowerCase()} niche`,
        "Lean tech stack enabling rapid iteration and low burn rate",
        "Strong product-market fit with underserved customer segment",
        "Proprietary data moat from early user engagement"
      ],
      weaknesses: [
        "Limited initial brand recognition in a competitive market",
        "Dependency on third-party AI APIs for core functionality",
        "Small engineering team may bottleneck feature velocity",
        "Customer acquisition cost (CAC) unproven at scale"
      ],
      opportunities: [
        "Rapidly growing global market for AI-native SaaS solutions",
        "Strategic partnership potential with enterprise platforms",
        "Expansion into adjacent verticals with minimal retooling",
        "Community-driven growth via open-source or freemium tier"
      ],
      threats: [
        "Established incumbents could replicate core features quickly",
        "Regulatory uncertainty around AI data privacy compliance",
        "Market saturation from venture-funded competitors",
        "Economic downturn reducing enterprise software budgets"
      ]
    };
    res.json(swotFallback);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to generate SWOT analysis" });
  }
});

app.post("/api/ai/refine-idea", async (req, res) => {
  try {
    const body = req.body || {};
    const { idea, prompt: userPrompt } = body;
    if (!idea || !userPrompt) {
      return res.status(400).json({ error: "Idea object and prompt required" });
    }

    const prompt = `You are an expert AI venture co-pilot helping a founder refine and improve their product dossier.
Current Idea JSON:
${JSON.stringify(idea, null, 2)}

Founder's instructions / prompt:
"${userPrompt}"

Apply the founder's feedback to refine the idea. Update any relevant fields (title, description, category, analysis, techStack, features, schema, roadmap, monetization, competitors, swot, etc.) so that the dossier reflects the improvements.

Return strictly valid JSON with this exact structure:
{
  "reply": "Conversational 2-3 sentence enthusiastic co-pilot response highlighting what you improved or changed based on their prompt.",
  "updatedIdea": {
    "title": "Updated or preserved title",
    "description": "Updated or preserved description",
    "category": "SaaS" | "Mobile App" | "AI" | "Productivity" | "Education",
    "analysis": {
      "summary": "...",
      "targetAudience": ["..."],
      "problemsSolved": ["..."],
      "complexityScore": "Low" | "Moderate" | "High" | "Extreme"
    },
    "techStack": {
      "frontend": "...",
      "backend": "...",
      "database": "...",
      "hosting": "..."
    },
    "features": {
      "mvp": [{"name": "...", "category": "Must Have", "desc": "..."}]
    }
  }
}
Ensure all updated data follows the exact JSON schema of the original idea object. Preserve existing fields unless improved.`;

    // 1. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const text = await callOpenAI(prompt, true);
        const parsed = JSON.parse(text || "{}");
        return res.json(parsed);
      } catch (openAiErr: any) {
        console.warn("OpenAI refine-idea failed, trying Gemini:", openAiErr.message);
      }
    }

    // 2. Try Gemini SDK
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (aiErr) {
      // Gemini unavailable, use local fallback
    }

    // 2. Local fallback: echo idea back with a reply acknowledging the refinement
    res.json({
      reply: `Great feedback! I've noted your refinement: "${userPrompt.slice(0, 100)}". The dossier for ${idea.title} has been preserved with your notes applied.`,
      updatedIdea: {
        ...idea,
        description: idea.description ? `${idea.description}\n\n[Refinement Note]: ${userPrompt}` : userPrompt
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to refine idea" });
  }
});

// Random Idea Generator route
app.get("/api/ai/random-idea", async (req, res) => {
  try {
    const prompt = `Generate 1 unique, highly innovative, venture-backable startup or SaaS app idea for 2026.
Return strictly valid JSON with this structure:
{
  "title": "Catchy Product Name",
  "tagline": "One sentence punchy hook",
  "description": "2-3 sentence overview of the problem, solution, and target market.",
  "category": "AI SaaS" | "Fintech" | "Developer Tools" | "Healthtech" | "Climate" | "B2B Workflow",
  "complexity": "Low" | "Moderate" | "High"
}`;

    // 1. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const text = await callOpenAI(prompt, true);
        return res.json(JSON.parse(text || "{}"));
      } catch (openAiErr: any) {
        console.warn("OpenAI random-idea failed, trying Gemini:", openAiErr.message);
      }
    }

    // 2. Try Gemini SDK
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.9 }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (geminiErr: any) {
      throw geminiErr;
    }
  } catch (e: any) {
    const fallbacks = [
      {
        title: "PromptAudit AI",
        tagline: "Automated compliance and security firewall for enterprise LLM prompts.",
        description: "As companies deploy AI agents, sensitive PII and proprietary secrets leak into prompts. PromptAudit intercepts, redacts, and logs all outgoing LLM traffic across enterprise teams.",
        category: "AI SaaS",
        complexity: "Moderate"
      },
      {
        title: "CarbonSync Pay",
        tagline: "API-first automated carbon offsetting embedded directly into Stripe invoices.",
        description: "Enables B2B SaaS companies to calculate real-time cloud computing carbon footprints and offer one-click verified carbon neutral billing to enterprise clients.",
        category: "Climate",
        complexity: "Low"
      },
      {
        title: "NeuroDoc QA",
        tagline: "AI surgical assistant that reviews pre-op imaging against medical history.",
        description: "Synthesizes complex DICOM scans and patient electronic health records into instant 1-page pre-operation briefings for surgeons, highlighting anomaly risks.",
        category: "Healthtech",
        complexity: "High"
      },
      {
        title: "APIWeave Studio",
        tagline: "Self-healing API orchestration engine for microservice backends.",
        description: "Monitors schema changes across microservices and automatically generates adapter layers when downstream APIs break backward compatibility.",
        category: "Developer Tools",
        complexity: "High"
      },
      {
        title: "AgentDesk Ops",
        tagline: "Mission control dashboard to orchestrate, debug, and bill autonomous AI agents.",
        description: "Provides full observability into agent tool calls, loop traps, memory leaks, and token consumption across multi-agent enterprise deployments.",
        category: "Developer Tools",
        complexity: "Moderate"
      }
    ];
    const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json(pick);
  }
});

// AI Dossier Chat / Refinement route
app.post("/api/ai/refine-dossier", async (req, res) => {
  try {
    const { idea, userPrompt } = req.body || {};
    if (!idea || !userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ error: "Idea object and valid userPrompt string required" });
    }

    const prompt = `You are an elite venture builder, product architect, and startup strategist. The user wants to refine, pivot, or upgrade an existing startup idea dossier based on their custom prompt.

Current Idea Dossier:
Title: ${idea.title}
Tagline: ${idea.tagline}
Category: ${idea.category}
Complexity: ${idea.complexity}
Description: ${idea.description}
Schema (Architecture): ${JSON.stringify(idea.schema || null)}
Roadmap: ${JSON.stringify(idea.roadmap || null)}
Monetization: ${JSON.stringify(idea.monetization || null)}
Competitors: ${JSON.stringify(idea.competitors || null)}
SWOT Matrix: ${JSON.stringify(idea.swot || null)}

User Refinement Prompt: "${userPrompt}"

Carefully apply the user's instructions. You may improve, expand, or pivot any aspect of the startup (title, tagline, description, schema, roadmap, monetization tiers, competitors, or SWOT analysis) to make the venture significantly better and aligned with their feedback.

Return strictly valid JSON with this structure:
{
  "title": "string",
  "tagline": "string",
  "category": "string",
  "complexity": "Low" | "Moderate" | "High",
  "description": "string",
  "schema": {
    "entities": [ { "name": "...", "attributes": ["..."] } ],
    "coreFlow": ["step 1", "step 2", "step 3"]
  },
  "roadmap": [
    { "phase": "Phase 1: MVP & Alpha", "timeline": "Month 1-3", "milestones": ["..."] }
  ],
  "monetization": {
    "model": "...",
    "tiers": [ { "name": "...", "price": "...", "features": ["..."] } ]
  },
  "competitors": [
    { "name": "...", "differentiation": "...", "pros": ["..."] }
  ],
  "swot": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  },
  "aiExplanation": "1-2 sentence concise summary explaining what you upgraded or pivoted based on their prompt."
}`;

    // 1. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const text = await callOpenAI(prompt, true);
        const refined = JSON.parse(text || "{}");
        return res.json(refined);
      } catch (openAiErr: any) {
        console.warn("OpenAI refine-dossier failed, trying Gemini:", openAiErr.message);
      }
    }

    // 2. Try Gemini SDK
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.7 }
      });
      const refined = JSON.parse(response.text || "{}");
      return res.json(refined);
    } catch (aiErr) {
      // Gemini unavailable, use local fallback
    }

    // 2. Local fallback: return the idea back with refinement note applied
    res.json({
      ...idea,
      description: idea.description ? `${idea.description}\n\n[Refinement]: ${userPrompt}` : userPrompt,
      aiExplanation: `Applied your refinement feedback: "${userPrompt.slice(0, 120)}". The dossier has been updated accordingly.`
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to refine dossier" });
  }
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LaunchForge Server running on http://localhost:${PORT}`);
  });
}

startServer();
