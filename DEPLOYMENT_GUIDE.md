# AdvokatAI - Ishlab Chiqarishga (Production) Chiqarish Boʻyicha Toʻliq Qoʻllanma
# Complete Production Deployment Guide

Bu qoʻllanma **AdvokatAI** loyihasini **Render** (yoki **Railway**) platformasiga eng oson, ishonchli va xavfsiz usulda joylashtirish (deploy qilish) hamda mavjud **Supabase** loyihangiz (`gkztwgxxcahwmzwvimzi`) bilan bogʻlash bosqichlarini tushuntiradi.

---

## 1. Tavsiya etilgan Arxitektura: Bitta Yagona Xizmat (Unified Full-Stack)

* **Nima uchun Render Web Service?**
  * Frontend (React 19 + Vite 7) va Backend (Express 5 + RAG) **bitta xizmatda va bitta domenda** (`https://sizning-saytingiz.onrender.com`) ishlaydi.
  * CORS xatoliklari, alohida domenlar orasidagi aloqa muammolari butunlay yoʻqoladi.
  * Foydalanuvchi saytga kirganda (`/`, `/chat`, `/login`, `/templates`, `/pricing`), Express toʻgʻridan-toʻgʻri `dist/index.html` ni koʻrsatadi. `/api/*` soʻrovlari esa ichki API orqali bajariladi.
  * Render doimiy bepul tarifga (Free Tier) ega va GitHub bilan avtomatik yangilanishni (Auto-Deploy) qoʻllab-quvvatlaydi.

---

## 2. 1-QADAM: Supabase Maʼlumotlar Bazasini Tayyorlash (1 daqiqa)

Loyihangizda xavfsiz, maʼlumotlarni oʻchirib yubormaydigan (`IF NOT EXISTS`) SQL migratsiya fayli tayyorlandi: [`supabase/schema.sql`](supabase/schema.sql).

1. [Supabase Dashboard](https://supabase.com/dashboard) ga kiring va loyihangizni tanlang (`gkztwgxxcahwmzwvimzi`).
2. Chap menyudan **SQL Editor** boʻlimiga oʻting.
3. **+ New query** tugmasini bosing.
4. [`supabase/schema.sql`](supabase/schema.sql) faylining barcha kodini nusxalab (copy), SQL Editor oynasiga qoʻying (paste).
5. **Run** (yoki `Ctrl+Enter`) tugmasini bosing.
6. Natijada `users`, `payments`, `plans`, `template_actions`, `feedback`, `analytics`, `usage`, `settings` jadvallari, indekslar va xavfsizlik qoidalari (RLS) xatolarsiz yaratiladi.

> [!NOTE]
> Ushbu SQL skript mavjud jadvallarni oʻchirmaydi (`DROP TABLE` qilinmaydi) va maʼlumotlaringizni toʻliq asrab qoladi.

---

## 3. 2-QADAM: Kodni GitHub ga Yuklash

Loyiha ildizida maxfiy `.env` fayllari, API kalitlar va `node_modules` ni GitHub ga chiqib ketishidan himoyalovchi `.gitignore` fayli yaratildi.

Terminalda buyruqlarni bajaring:
```bash
git add .
git commit -m "Prepare unified full-stack production deployment with Supabase integration"
git push origin main
```

---

## 4. 3-QADAM: Render da Saytni Ishga Tushirish (2 daqiqa)

### Variant A: Eng Oson Usul (render.yaml Blueprint orqali)
Loyiha ichida tayyor [`render.yaml`](render.yaml) mavjud boʻlib, u Render ga barcha sozlamalarni avtomatik oʻrgatadi:
1. [Render.com](https://render.com) ga kiring va GitHub hisobingiz bilan tizimga kiring.
2. Yuqori oʻng burchakdagi **New +** tugmasini bosing va **Blueprint** ni tanlang.
3. AdvokatAI GitHub repozitoriysini tanlang.
4. Render loyiha nomi, build va start buyruqlarini avtomatik toʻldiradi.
5. Maxfiy oʻzgaruvchilar oynasida `GEMINI_API_KEY` va `ADMIN_API_KEY` qiymatlarini kiriting.
6. **Apply** tugmasini bosing. Sayt 1-2 daqiqada jonli efirga chiqadi!

---

### Variant B: Qoʻlda Web Service Yaratish (Manual Web Service)
Agar Blueprint ishlatmasdan qoʻlda yaratmoqchi boʻlsangiz:
1. Render Dashboard da **New +** → **Web Service** ni bosing.
2. GitHub repozitoriysini ulang.
3. Quyidagi parametrlarni kiriting:
   * **Name**: `advokatai` (yoki xohlagan nom)
   * **Region**: `Frankfurt (EU Central)` (Oʻzbekistonga eng yaqin server)
   * **Runtime**: `Node`
   * **Branch**: `main`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`
4. **Environment Variables** boʻlimida quyidagi oʻzgaruvchilarni kiriting:

| Oʻzgaruvchi Nomi | Qiymati | Izoh |
|---|---|---|
| `GEMINI_API_KEY` | *(sizning Gemini kalitingiz)* | Sunʼiy intellekt javoblari uchun |
| `ADMIN_API_KEY` | `advokatai_admin_secret_2025` | `/admin` paneliga kirish kaliti |
| `JWT_SECRET` | *(ixtiyoriy 32 ta belgili matn)* | Sessiyalarni xavfsiz shifrlash uchun |
| `PAYMENT_CARD_NUMBER` | `4466 1369 5151 4448` | Toʻlov sahifasida koʻrinuvchi karta |
| `PAYMENT_CARD_HOLDER` | `Zokirov Zafar` | Karta egasi ismi |
| `PAYMENT_BANK_NAME` | `Humo / Uzcard / Visa` | Bank nomi |
| `VITE_SUPABASE_URL` | `https://gkztwgxxcahwmzwvimzi.supabase.co` | Supabase URL (Vite brauzer uchun) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0` | Supabase ochiq kaliti (Vite brauzer uchun) |
| `SUPABASE_URL` | `https://gkztwgxxcahwmzwvimzi.supabase.co` | Supabase URL (Server/Serverless uchun) |
| `SUPABASE_SERVICE_ROLE_KEY` | *(maxfiy kalit)* | Supabase dashboard Project Settings → API dan olingan maxfiy kalit (Faqat Server) |

5. **Create Web Service** tugmasini bosing.

---

## 5. 4-QADAM: Supabase dagi Muhim Sozlama (Authentication)

Foydalanuvchilar roʻyxatdan oʻtganda email tasdiqlash xati kutib oʻtirmasdan darhol tizimga kirishlari uchun:
1. Supabase Dashboard ga kiring.
2. Chap menyudan **Authentication** → **Providers** boʻlimiga oʻting.
3. **Email** provayderini bosing.
4. **"Confirm email"** tugmachasini oʻchirib qoʻying (`OFF` qiling). *(Agar oʻz SMTP serveringiz boʻlmasa, bu sozlama foydalanuvchilarning toʻsiqsiz kirishini taʼminlaydi).*
5. **Save** tugmasini bosing.

---

## 6. Railway da Ishga Tushirish (Muqobil Variant / Alternative)

Agar Render oʻrniga Railway ishlatishni afzal koʻrsangiz:
1. [Railway.app](https://railway.com) ga kiring va **New Project** → **Deploy from GitHub repo** ni tanlang.
2. AdvokatAI repozitoriysini tanlang.
3. Loyiha ichidagi tayyor [`Dockerfile`](Dockerfile) ni Railway avtomatik aniqlaydi.
4. **Variables** boʻlimiga yuqoridagi jadvaldagi oʻzgaruvchilarni qoʻshing.
5. **Settings** → **Networking** → **Generate Domain** tugmasini bosing (masalan: `advokatai-production.up.railway.app`).
6. Sayt tayyor!

---

## 7. Saytni Tekshirish (Tekshiruv Roʻyxati)

Deploy tugagach, berilgan havola orqali tekshirib chiqing:
* [x] **Bosh sahifa**: Ochilishi va barcha tugmalar ishlashi (`/`).
* [x] **AI Maslahat**: Savol berilganda tezkor va qonuniy javob qaytarishi (`/chat`).
* [x] **Roʻyxatdan oʻtish**: Yangi hisob ochilishi (`/register`).
* [x] **Kirish**: Yangi hisob bilan tizimga kirilishi (`/login`).
* [x] **Sahifani yangilash (F5)**: `/chat`, `/templates`, `/pricing` sahifalarida F5 bosilganda 404 xatosi chiqmasligi.
* [x] **Hujjatlar**: Shablonlarni koʻrish va yuklab olish (`/templates`).
* [x] **Toʻlov**: Karta maʼlumotlari va chek topshirish (`/payment`).
* [x] **Admin panel**: `/admin` sahifasida maxfiy kalit bilan kirib tahlillarni koʻrish.
