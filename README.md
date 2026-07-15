# LaunchForge 🚀 — AI Startup Blueprint & Architectural Engine

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white&style=flat-square)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](#)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)](#)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white&style=flat-square)](#)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45-C5F74F?logo=drizzle&logoColor=black&style=flat-square)](#)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5--Flash-4285F4?logo=google-gemini&logoColor=white&style=flat-square)](#)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?logo=openai&logoColor=white&style=flat-square)](#)

**LaunchForge** is a premium, AI-powered Startup & App Idea Development Platform designed with a bold, high-contrast, neobrutalist/editorial aesthetic. It serves as an interactive incubator where founders, product leads, and hackers can transform raw product descriptions into production-ready software architecture plans.

---

## 🎨 Key Features & Functional Modules

1. **AI Startup Blueprinting (Incubator Engine)**
   * Synthesize raw product concepts into deep, structured startup dossiers.
   * Generates Postgres DDL database blueprints, MVP task tables, 4-week roadmap phases, target audience profiles, monetization models, and competitive differentiators.
2. **Resilient Failover & Multi-Engine AI Architecture**
   * **Tier 1 (CLI CLI Microservice)**: Executes local Python algorithms to construct instant schema, feature, and roadmap drafts with zero cloud API latency.
   * **Tier 2 (OpenAI Chat Completions)**: Leverages `gpt-4o-mini` for advanced prompt processing and json-mode structure generation when configured.
   * **Tier 3 (Google Gemini SDK)**: Integrates the `@google/genai` Node client utilizing `gemini-2.5-flash` for native multi-modal operations.
   * **Tier 4 (Offline Templates)**: Gracefully falls back to high-conviction deterministic drafts and SWOT metrics in the absence of valid keys, preventing server crashes.
3. **Interactive Analytics Portfolio Dashboard**
   * Visualizes venture health using interactive **Recharts** models.
   * Tracks total aggregate concepts, lifecycle status distribution (New, Researching, Building, Completed), and vertical industry representation (AI, SaaS, Mobile, Education).
4. **Community Explore Hub**
   * Search and filter public startup blueprints by industry vertical.
   * Promotes collaborative blueprint sharing and direct library cloning.

---

## 🏗️ Architecture & System Flow

LaunchForge leverages a decoupled React frontend and Node.js backend. In addition to relational database syncing, it operates an advanced failover logic block for API requests.

```mermaid
graph TD
    subgraph Client Layer (React 19 SPA)
        App[App.tsx]
        App --> Hub[ExploreHub.tsx]
        App --> Dash[PortfolioDashboard.tsx]
        App --> Detail[IdeaDetail.tsx]
        App --> Gen[IdeaGenerator.tsx]
    end

    subgraph Server Layer (Express + Node.js)
        API[/api/ideas]
        AIExpand[/api/ai/expand]
        Drizzle[(Drizzle ORM Connection)]
    end

    subgraph Storage & Cloud APIs
        PG[(PostgreSQL)]
        PyEngine[ai_service.py Subprocess]
        OpenAI[OpenAI Chat API]
        Gemini[Google Gemini API]
    end

    App -->|Requests| API
    App -->|Requests| AIExpand
    API --> Drizzle
    Drizzle -->|Resilient Sync / Memory Fallback| PG
    AIExpand -->|1. Run Local CLI| PyEngine
    AIExpand -->|2. Try OpenAI| OpenAI
    AIExpand -->|3. Try Gemini SDK| Gemini
```

---

## 📂 Project Structure

```bash
LaunchForge/
├── src/
│   ├── components/            # Interactive UI modules
│   │   ├── ExploreHub.tsx         # Public blueprint catalog
│   │   ├── Header.tsx             # Main header & navigation controls
│   │   ├── IdeaDetail.tsx         # Active dossier overview, SWOT refinement, & notes
│   │   ├── IdeaGenerator.tsx      # Random concepts & custom prompt blueprints
│   │   ├── NewProjectModal.tsx    # Dossier creation modal
│   │   ├── PortfolioDashboard.tsx # Recharts-powered metrics board
│   │   └── Sidebar.tsx            # Left rail dossier catalog
│   ├── db/                    # Relational data layer
│   │   ├── index.ts               # pg pool & Drizzle ORM client initialization
│   │   ├── schema.ts              # pgTable definitions for Idea dossiers
│   │   └── drizzle.config.ts      # Drizzle migrations configuration
│   ├── App.tsx                # App state manager & view router
│   ├── main.tsx               # Client entrypoint
│   └── types.ts               # Strict TypeScript definitions
├── ai_service.py              # CLI Python AI Engine microservice
├── server.ts                  # Express API Server & Vite HMR proxy
├── vite.config.ts             # Bundler configuration
├── package.json               # System dependencies & build scripts
└── tsconfig.json              # TypeScript engine configurations
```

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js**: `v18.x` or later (tested on `v24.x`)
* **Python**: `v3.x` (required for local AI CLI subprocesses)
* **PostgreSQL** *(Optional)*: Local database connection for persistence. Falls back automatically to memory storage if offline.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yourusername/LaunchForge.git
cd LaunchForge
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder of the project:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
OPENAI_API_KEY="your_openai_api_key_here"
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
```
*(Note: If you leave `DATABASE_URL` empty, LaunchForge will run in demo mode, utilizing an in-memory database store populated with rich mock startup concepts).*

### 3. Start Development Server
```bash
npm run dev
```
The server will boot up and bind to **`http://localhost:3000`**. Open this address in your browser to view the application.

---

## 🔬 Core Technologies & Implementation Details

* **Neobrutal Styling System**: Structured with Tailwind CSS v4. Standardizes layout configurations through hard-coded solid offsets, flat shadows, thick charcoal borders (`border-[#1A1A1A]`), and sharp sans-to-serif contrast configurations.
* **Resilient Connection Handling**: To ensure high availability, database calls (`syncIdeaToPG`) are wrapped in connection-failure catch blocks. If a server is booted without a working database socket, it triggers immediate fallback mode, ensuring offline usage in sandbox settings.
* **TypeScript Security Headers**: The backend Express server injects standard HTTP security headers (e.g., `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`) and constrains JSON request payload sizes to 1MB to prevent Denial of Service (DoS) attacks.
