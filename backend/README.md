# ⚔️ Life RPG Backend Engine (Supabase-Optimized)

A production-ready, zero-crash backend service for the **Life RPG** gamification platform. Built with **Node.js, Express, TypeScript, and PostgreSQL (Supabase)**, featuring a strictly normalized 3NF database schema, local Supabase JWT verification, automated daily streak tracking triggers, and an atomic non-linear JRPG progression engine.

---

## 🌟 Architecture Highlights

1. **Supabase-Optimized 3NF Data Model**:
   - `profiles.id` is a `UUID` foreign key directly mirroring `auth.users(id)`.
   - `total_xp` is the cumulative source of truth; `current_level` is a cached state recomputed dynamically.
   - Composite-key junction tables (`profile_attributes`, `task_attribute_rewards`, `inventory`, `streak_activities`) eliminate 2NF/3NF anomalies.
2. **Automated UTC Day Streak Tracking Trigger**:
   - Database trigger `public.update_streak()` on `task_completions` guarantees streak updates are idempotent per UTC day.
   - 5 task completions in a single calendar day increment `completions_count` on `streak_activities` without inflating `current_streak`.
   - Next-day completions increment the streak, while gaps of 2+ days reset `current_streak` to 1 while preserving `longest_streak`.
3. **Atomic Non-Linear JRPG Progression Engine**:
   - Curve: `TotalXPForLevel(L) = floor(100 * (L - 1) ^ 1.4)`.
   - Atomic multi-level cascading via `applyXPGain(...)` with `SELECT ... FOR UPDATE` row locks inside PostgreSQL transactions to prevent race conditions.
4. **Local Supabase JWT Authentication**:
   - Verifies incoming `Bearer <token>` locally using `SUPABASE_JWT_SECRET` via `jsonwebtoken` (HS256). Zero network latency overhead per request.
   - Maps user UUID directly from the JWT `sub` claim.
5. **Zero-Crash Tolerance**:
   - Centralized global error handling middleware maps database constraints (unique violations, foreign key conflicts, malformed UUIDs, connection timeouts) to standard HTTP status codes without crashing the Node process or leaking stack traces in production.
6. **Container & Cloud Ready**:
   - Multi-stage `Dockerfile`, `docker-compose.yml`, and comprehensive `.env.example` ready for deployment on **Railway**, **Render**, or **Fly.io**.

---

## 📐 PostgreSQL Schema Overview (3NF)

```mermaid
erDiagram
    auth_users ||--|| profiles : "mirrors (UUID)"
    profiles ||--o{ profile_attributes : "has stats"
    attributes ||--o{ profile_attributes : "defines"
    profiles ||--o{ tasks : "owns"
    tasks ||--o{ task_attribute_rewards : "grants stat XP"
    attributes ||--o{ task_attribute_rewards : "rewarded"
    profiles ||--o{ task_completions : "completes"
    tasks ||--o{ task_completions : "history"
    profiles ||--o{ inventory : "holds"
    items ||--o{ inventory : "catalog item"
    profiles ||--o{ streak_activities : "daily log"
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ & npm
- PostgreSQL (Local or Supabase Project)

### 2. Installation
```bash
# Clone the repository and install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database credentials and Supabase JWT Secret:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
DATABASE_SSL=true
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-from-dashboard
```

### 4. Database Initialization & Seeding
```bash
# Execute schema, triggers, and performance indexes
npm run db:init

# Seed core attributes (Strength, Intellect, Discipline...) and starter items
npm run db:seed
```

### 5. Run Progression Unit Tests
```bash
npm test
```

### 6. Start the Server
```bash
# Development Mode (Hot Reload via tsx)
npm run dev

# Production Build & Run
npm run build
npm start
```

---

## 🌐 RESTful API Reference

All protected endpoints require `Authorization: Bearer <SUPABASE_JWT_TOKEN>`.

### 👤 Profile
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/profile/me` | Get authenticated user profile & XP progress | ✅ |
| `PATCH` | `/api/profile/me` | Update username | ✅ |
| `GET` | `/api/profile/me/streak` | Get streak stats & last 30 days activity log | ✅ |

### 📊 Attributes
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/attributes` | Public catalog of all attribute definitions | ❌ |
| `GET` | `/api/profile/me/attributes` | Get user's attribute values & XP | ✅ |
| `POST` | `/api/profile/me/attributes` | Initialize/seed attribute rows for profile | ✅ |

### 📜 Tasks & Quest Engine
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/profile/me/tasks` | List tasks (supports `?status=pending`) | ✅ |
| `POST` | `/api/profile/me/tasks` | Create a new task with optional attribute rewards | ✅ |
| `GET` | `/api/tasks/:taskId` | Get single task detail *(ownership verified)* | ✅ |
| `PATCH` | `/api/tasks/:taskId` | Edit task *(ownership verified)* | ✅ |
| `DELETE` | `/api/tasks/:taskId` | Delete task *(ownership verified)* | ✅ |
| `POST` | `/api/tasks/:taskId/complete` | **★ Complete task atomically:** cascades XP, updates level, feeds attributes, triggers streak | ✅ |
| `GET` | `/api/profile/me/history` | Paginated task completions audit feed | ✅ |

#### Task Completion Response Example (`POST /api/tasks/:taskId/complete`):
```json
{
  "success": true,
  "message": "🎉 Level Up! You advanced 1 level(s) to Level 3!",
  "task": {
    "task_id": 14,
    "title": "Complete System Architecture Spec",
    "xp_awarded": 350
  },
  "profile": {
    "id": "7b8f9e61-9c32-4e4b-9e4a-2f4cf7135e89",
    "current_level": 3,
    "total_xp": 450,
    "levels_gained": 1,
    "progress_xp": 185,
    "xp_needed_for_next": 220,
    "current_streak": 4,
    "longest_streak": 7,
    "last_activity_date": "2026-09-12"
  },
  "attribute_advancements": [
    {
      "attribute_id": 2,
      "attribute_name": "Intellect",
      "xp_gained": 150,
      "new_value": 2,
      "new_xp": 150
    }
  ]
}
```

### 🎒 Inventory & Items
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/items` | Public catalog of all items | ❌ |
| `GET` | `/api/items/:itemId` | Single catalog item detail | ❌ |
| `GET` | `/api/profile/me/inventory` | List owned items and quantities | ✅ |
| `POST` | `/api/profile/me/inventory` | Add item to inventory (loot drop/reward) | ✅ |
| `PATCH` | `/api/inventory/:inventoryId` | Update quantity (consume/use) *(ownership verified)* | ✅ |
| `DELETE` | `/api/inventory/:inventoryId` | Remove inventory item *(ownership verified)* | ✅ |

---

## 🐳 Docker & Cloud Deployment

### Run with Docker Compose
```bash
docker compose up --build
```

### Deploy to Railway / Render
1. Connect your GitHub repository to Railway or Render.
2. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `DATABASE_SSL`: `true`
   - `SUPABASE_JWT_SECRET`: Your Supabase project JWT Secret.
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
3. Build Command: `npm run build`
4. Start Command: `npm start`
