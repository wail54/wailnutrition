# WailNutrition — Fitness & Nutrition Tracker

A **Mobile-First PWA** built with **Next.js 14, Tailwind CSS & Supabase** for complete nutrition and workout tracking.

---

## ✨ Features

### 🥗 Nutrition Module
- Custom food library with calories, protein, carbs & fat per serving
- Daily calorie gauge vs. 1800 kcal goal
- Quick-log meals: select food, input quantity → auto-calculated calories
- Daily & weekly history with calorie balance charts
- Macro breakdown (Protein / Carbs / Fat) dashboard

### 💪 Training Module
- Custom exercise library
- Calendar view for session planning
- Workout journal: log sets × reps × weight
- **RPG-style gamification**: visual "Level Up!" when you beat a personal record
- Progress charts per exercise (weight & reps over time)

### 🏆 Gamification
- Daily **streak** counter with fire emoji
- Personal record badges on each exercise
- Animated "NEW RECORD" celebration on achievements

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` → `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You'll find these in **Supabase → Project Settings → API**.

### 3. Set up the database
Run the SQL schema in **Supabase → SQL Editor**:

```sql
-- Copy the full content of supabase/schema.sql
```

(Or open `supabase/schema.sql` and paste it directly into the Supabase SQL editor)

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `foods` | Food library (name, serving size, kcal, macros) |
| `meal_logs` | Recorded meals per day |
| `exercises` | Exercise library (name, muscle group, type) |
| `workout_sessions` | Training sessions with date |
| `workout_sets` | Sets × reps × weight per exercise per session |
| `user_settings` | Daily calorie goal, user preferences |

---

## ☁️ Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add the environment variables in **Vercel → Project → Settings → Environment Variables**.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms | React Hook Form |
| Icons | Lucide React |
| PWA | next-pwa |
