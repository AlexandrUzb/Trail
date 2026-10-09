# AdvokatAI Frontend ⚖️💻

Modern Legal Tech Single-Page Application (SPA) built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

Designed for deployment on **Vercel** with worldwide Edge CDN delivery.

---

## 🛠️ Tech Stack

* **UI Framework:** React 19 + TypeScript
* **Build Tool:** Vite 7
* **Styling:** Tailwind CSS 4
* **Routing:** React Router v7
* **BaaS & Auth:** Supabase (`@supabase/supabase-js`)
* **Document Generation:** `docx` (Word contract & petition exporter)
* **Hosting:** Vercel (Edge Network)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# Supabase Configuration (Safe for browser / client)
VITE_SUPABASE_URL=https://gkztwgxxcahwmzwvimzi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0
VITE_SUPABASE_ANON_KEY=sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0

# Backend API URL (leave blank for local development to use Vite /api proxy)
# For production on Vercel, set to your Render backend URL:
VITE_API_BASE_URL=https://advokatai-api.onrender.com
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server on http://localhost:5173
npm run dev

# Type check TypeScript without emitting files
npm run typecheck

# Build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deploy to Vercel

1. In [Vercel Dashboard](https://vercel.com), click **Add New... ➔ Project**.
2. Select your repository.
3. In **Project Settings**:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Add Environment Variables:
   * `VITE_API_BASE_URL`: `https://advokatai-api.onrender.com` *(Your Render backend URL)*
   * `VITE_SUPABASE_URL`: `https://gkztwgxxcahwmzwvimzi.supabase.co`
   * `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0`
5. Click **Deploy**. SPA routing and security headers are automatically configured via [`vercel.json`](vercel.json).
