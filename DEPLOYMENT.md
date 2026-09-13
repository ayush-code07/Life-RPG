# 🚀 Production Deployment Guide: Vercel + Render + Supabase

This guide walks you through deploying **Life RPG (Ashen Path)** to production:
1. **Supabase**: PostgreSQL Database + Authentication + RLS
2. **Render**: Node.js / Express Backend Engine API
3. **Vercel**: React / Vite Frontend SPA

---

## 🗄️ Step 1: Supabase Setup (Database & Auth)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and select your project (or create one).
2. **Run Database Migration**:
   - Go to **SQL Editor** in the left menu.
   - Paste the contents of [`backend/src/database/schema.sql`](backend/src/database/schema.sql) and click **Run**.
3. **Get Your Supabase Credentials**:
   - Go to **Project Settings** → **API**:
     - `Project URL` (e.g. `https://xyz.supabase.co`)
     - `anon / public` API Key
     - `service_role` (Secret) Key
   - Go to **Project Settings** → **Database**:
     - Copy the **URI Connection string** (Transaction pooler or direct):
       `postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres` (or port 6543 pooler)
4. **Configure Auth Redirect URLs**:
   - Go to **Authentication** → **URL Configuration**.
   - Set **Site URL** to your Vercel URL (e.g., `https://life-rpg.vercel.app`).
   - Add redirect URLs:
     - `https://life-rpg.vercel.app/**`
     - `http://localhost:5173/**` (for local testing)

---

## 🖥️ Step 2: Render Setup (Backend API)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `ayush-code07/Life-RPG`.
3. Configure the Web Service settings:
   - **Name**: `life-rpg-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables** under the **Environment** tab:
   | Variable Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `DATABASE_URL` | `postgresql://postgres:YOUR_PASSWORD@db.xyz.supabase.co:5432/postgres` | Your Supabase connection string |
   | `DATABASE_SSL` | `true` | Required for Supabase |
   | `SUPABASE_URL` | `https://xyz.supabase.co` | Your Supabase Project URL |
   | `SUPABASE_SECRET_KEY` | `your-supabase-service-role-key` | Service role key |
   | `SUPABASE_JWT_SECRET` | `your-supabase-jwt-secret` | Found in Supabase Settings → API → JWT Settings |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app,http://localhost:5173` | Your Vercel frontend URL (or `*` temporarily) |
5. Click **Create Web Service**.
6. Once deployed, copy your Render backend URL (e.g., `https://life-rpg-backend.onrender.com`).

---

## ⚡ Step 3: Vercel Setup (Frontend)

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
2. Import your GitHub repository: `ayush-code07/Life-RPG`.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add **Environment Variables**:
   | Variable Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xyz.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your-supabase-anon-key` |
   | `VITE_API_URL` | `https://life-rpg-backend.onrender.com` (Your Render Backend URL from Step 2) |
5. Click **Deploy**.

---

## 🔄 Step 4: Final Connective Check

1. In **Render Backend Settings**:
   - Make sure `CORS_ORIGIN` includes your official Vercel domain (e.g., `https://life-rpg.vercel.app`).
2. In **Supabase Authentication Settings**:
   - Ensure the Vercel domain is set as the **Site URL** so password recovery emails link directly to your production app.
3. Open your Vercel URL, create a hero account, test quest completion, and slay the world boss!
