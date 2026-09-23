# AdvokatAI ⚖️🤖

AdvokatAI is a modern legal tech web platform providing AI-powered legal document generation, case law research, and interactive legal assistance.

## 🚀 Features

- **Legal Document Generator**: Automatically generate and download legal documents, contracts, and court petitions (PDF & DOCX).
- **Extensive Document Catalog**: Built-in legal templates covering civil, commercial, labor, and family law.
- **AI Legal Assistant**: Context-aware legal question answering powered by Google Gemini.
- **Supabase Cloud Integration**: Robust backend data persistence for users, documents, and chat history.
- **Single Page Application**: Fast, responsive React 19 + Vite + Tailwind CSS interface.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, React Router v7
- **Backend / API**: Node.js, Express, `@google/genai`, docx
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **Deployment**: GitHub Pages (Automated via GitHub Actions)

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase configuration:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start with both frontend and backend API:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🌐 Deploying to GitHub Pages

This repository is configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically build and deploy the frontend to GitHub Pages whenever changes are pushed to `main`.

### Setup Instructions for GitHub Pages:
1. Push this repository to GitHub: `https://github.com/AlexandrUzb/Trail.git`
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. (Optional) Under **Settings** > **Secrets and variables** > **Actions**, add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. On push, GitHub Actions will automatically run the build and publish the live site to:
   `https://AlexandrUzb.github.io/Trail/`

---

## 📦 Scripts

- `npm run dev`: Run both frontend and backend concurrently
- `npm run client`: Run Vite frontend dev server
- `npm run server`: Run Express backend server
- `npm run build`: Build production SPA bundle into `dist/`
- `npm run build:gh-pages`: Build bundle specifically tailored for GitHub Pages
- `npm run preview`: Preview production build locally
