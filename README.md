# AdvokatAI ⚖️🤖

[![CI](https://github.com/AlexandrUzb/Trail/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexandrUzb/Trail/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-20+-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-7-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4-38B2AC.svg)](https://tailwindcss.com)
[![Render](https://img.shields.io/badge/backend-Render-46E3B7.svg)](https://render.com)
[![Vercel](https://img.shields.io/badge/frontend-Vercel-000000.svg)](https://vercel.com)

**AdvokatAI** is a production-grade AI-powered legal technology platform specifically engineered for the legislation of the Republic of Uzbekistan. It provides conversational legal advice grounded in **4,449+ official Lex.uz statutory articles**, interactive document generation (DOCX / PDF contracts & court petitions), and automated compliance auditing with zero-hallucination guardrails.

---

## 🏗️ System Architecture

The project employs an industry-standard **Decoupled Dual-Hosting Architecture**:

* **Frontend on Vercel:** High-performance React 19 Single-Page Application delivered worldwide through Vercel's global Edge CDN network with 0ms cold-start.
* **Backend on Render:** Scalable Node.js Express 5 Web Service hosting the RAG knowledge base (Lex.uz index), semantic query router, and Gemini API inference engine.
* **Database & Auth on Supabase:** PostgreSQL database with Row-Level Security (RLS) policies for user sessions, chat history, and quota entitlements.

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│         USER BROWSER           │       │          SUPABASE BAAS         │
│  (Desktop, Tablet, or Mobile)  │       │   (PostgreSQL + Auth + RLS)    │
└───────┬────────────────────────┘       └───────▲────────────────▲───────┘
        │                                        │                │
        │ 1. Assets & Routing                    │ Direct Read/   │ Service Role
        ▼                                        │ Write Session  │ Telemetry
┌────────────────────────────────┐               │                │
│       VERCEL EDGE CDN          │               │                │
│    (frontend/ - React 19)      ├───────────────┘                │
└───────┬────────────────────────┘                                │
        │                                                         │
        │ 2. REST API Requests (VITE_API_BASE_URL)                │
        ▼                                                         │
┌────────────────────────────────┐                                │
│       RENDER WEB SERVICE       │                                │
│    (backend/ - Express 5)      ├────────────────────────────────┘
└───────┬────────────────────────┘
        │
        │ 3. Grounded Prompts + 29 Strict Legal Directives
        ▼
┌────────────────────────────────┐
│      GOOGLE GEMINI API         │
│    (gemini-3.5-flash-lite)     │
└────────────────────────────────┘
```

---

## 📁 Repository Structure

```
advokatai/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated CI: Typecheck, Build, and Tests
│       └── deploy.yml             # GitHub Pages automated deployment
│
├── frontend/                      # Hosted on VERCEL (Client Layer)
│   ├── src/                       # React 19 UI, pages, components, and utils
│   ├── public/                    # Static assets, branding, and icons
│   ├── vercel.json                # Vercel SPA route rewrites & security headers
│   ├── vite.config.ts             # Vite bundler config with /api proxy
│   ├── tsconfig.json              # Strict TypeScript configuration
│   ├── package.json               # Frontend dependencies & scripts
│   ├── .env.example               # Frontend environment template
│   └── README.md                  # Frontend development documentation
│
├── backend/                       # Hosted on RENDER (API & AI Service Layer)
│   ├── data/                      # 4,449 official Lex.uz legal documents index
│   ├── middleware/                # JWT Authentication & security filters
│   ├── routes/                    # REST endpoints (/api/chat, /api/laws, etc.)
│   ├── services/                  # Gemini AI, RAG retrieval, Legal Validator
│   ├── tests/                     # Automated legal test suite (Grounding)
│   ├── utils/                     # Transliteration & helper utilities
│   ├── Dockerfile                 # Standalone production container definition
│   ├── render.yaml                # Render Blueprint specification
│   ├── app.js                     # Express app, CORS, and security headers
│   ├── index.js                   # Server entrypoint with graceful shutdown
│   ├── package.json               # Backend dependencies & scripts
│   ├── .env.example               # Backend environment template
│   └── README.md                  # Backend development documentation
│
├── supabase/
│   └── schema.sql                 # PostgreSQL DDL, indices, and RLS policies
│
├── .gitignore                     # Monorepo ignore rules (secrets, dist, logs)
├── render.yaml                    # Root Render blueprint specification
├── vercel.json                    # Root Vercel deployment specification
└── package.json                   # Root monorepo workspace orchestration
```

---

## 🚀 Quick Start (Local Monorepo)

### 1. Install Dependencies
Install dependencies across all workspaces using npm workspaces:
```bash
npm install
```

### 2. Configure Environment Files
Copy example environment templates for both frontend and backend:
```bash
# Frontend configuration
cp frontend/.env.example frontend/.env

# Backend configuration
cp backend/.env.example backend/.env
```

Fill in your `GEMINI_API_KEY` in `backend/.env`.

### 3. Run Development Servers
Start both Frontend and Backend concurrently with colored terminal logs:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`
* **API Health Check:** `http://localhost:5000/api/health`

Alternatively, you can run them in separate terminals:
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## 🌐 Production Deployment (Two Separate Hosts)

### Step 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://render.com) and click **New + ➔ Web Service**.
2. Connect this repository and set:
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node index.js`
   * **Health Check Path:** `/api/health`
3. Add Environment Variables:
   * `PORT`: `5000`
   * `NODE_ENV`: `production`
   * `GEMINI_API_KEY`: *(Your Google Gemini API key)*
   * `SUPABASE_URL`: *(Your Supabase project URL)*
   * `SUPABASE_SERVICE_ROLE_KEY`: *(Your Supabase service role key)*
   * `ADMIN_API_KEY`: *(Your secret admin API key)*
   * `JWT_SECRET`: *(A secure random 32-character string)*
   * `FRONTEND_URL`: `https://your-frontend.vercel.app`
4. Click **Create Web Service**. You will receive a URL such as `https://advokatai-api.onrender.com`.

### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New... ➔ Project**.
2. Select your repository and configure:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. Add Environment Variables:
   * `VITE_API_BASE_URL`: `https://advokatai-api.onrender.com` *(From Step 1)*
   * `VITE_SUPABASE_URL`: `https://gkztwgxxcahwmzwvimzi.supabase.co`
   * `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0`
4. Click **Deploy**. Your frontend is live with automatic SSL and global CDN delivery!

---

## 🧪 Testing & Code Quality

```bash
# Run backend legal grounding & relevance gating test suite
npm run test:backend

# Typecheck frontend TypeScript without emitting files
npm run typecheck

# Build frontend production bundle
npm run build
```

---

## 📜 License

Proprietary — Developed for AdvokatAI Legal Technologies. All rights reserved.
