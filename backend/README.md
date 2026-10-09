# AdvokatAI Backend ⚖️⚙️

High-precision Legal AI & RAG Engine for Uzbekistan legislation, powered by **Node.js**, **Express 5**, and **Google Gemini API**.

Designed for deployment on **Render** (as a Web Service or Docker Container).

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (v20+)
* **Server Framework:** Express 5
* **AI Provider:** Google Gemini API (`@google/genai`, `gemini-3.5-flash-lite`)
* **RAG Knowledge Base:** 4,449 official articles indexed from Lex.uz (Labor, Civil, Criminal, Administrative Codes & Constitution)
* **Database & Auth:** Supabase PostgreSQL (`@supabase/supabase-js` with service role)
* **Containerization:** Docker multi-stage & Render native runtime

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck: memory heap, uptime, node version, RAG count |
| `POST` | `/api/chat` | Legal AI consultation with citation verification & anti-hallucination |
| `GET` | `/api/laws` | Search official law articles with pagination |
| `GET` | `/api/templates` | Legal document templates catalog |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User authentication & JWT issuance |
| `POST` | `/api/feedback` | User response ratings and telemetry |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=production

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Supabase Server Configuration (Private Service Role)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security Keys
ADMIN_API_KEY=your_admin_secret_key
JWT_SECRET=your_secret_session_token_key

# Allowed Frontend Origins for CORS
FRONTEND_URL=https://advokatai.vercel.app
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run automated legal relevance and grounding test suite
npm test

# Start production server
npm start
```

---

## 🌐 Deploy to Render

### Option A: Render Blueprint (One-Click)
Use [`render.yaml`](render.yaml) directly in Render Dashboard:
1. In [Render Dashboard](https://render.com), click **New + ➔ Blueprint**.
2. Connect this repository. Render automatically reads `render.yaml`.
3. Provide your `GEMINI_API_KEY` and click **Apply**.

### Option B: Manual Web Service
1. In Render Dashboard, click **New + ➔ Web Service**.
2. Select your repository.
3. Configure settings:
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node index.js`
   * **Health Check Path:** `/api/health`
4. Set environment variables from the table above.
5. Click **Create Web Service**.
