# 🚀 JustSciify — Gamified Science Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/AI-Groq--Llama3-orange?style=for-the-badge&logo=google-gemini)](https://groq.com/)

JustSciify is an interactive, gamified science learning platform built for children in **Grades 3-5 (Ages 8-11)**. By merging official CBSE/ICSE science curriculum structures with rich game mechanics (XP rewards, unlockable avatar ranks, streaking, and competitive leaderboards), JustSciify transforms science education into an immersive adventure. It also includes an advanced AI-powered curriculum builder and question booster for administrators.

---

## 🌟 Core Features & Modules

### 1. 🧠 AI Syllabus & Question Generator (Admin Console)
* **Syllabus Architect (Entire Topic)**: Input a high-level topic idea (e.g., *"Gravity and solar orbits"*) to generate a full learning curriculum containing custom icons, colors, chapter titles, subtopics, and CBSE-aligned multiple-choice questions automatically.
* **Question Booster (Existing Chapters)**: Instantly seed new questions into existing chapters using **Groq Cloud (Llama 3.3 70B)** or **ChatGPT (GPT-4o mini)**.
* **Selection & Duplicate Controls**:
  * **Granular Selectors**: Checkbox selectors on the preview cards allow administrators to select exactly which generated questions get committed to the database.
  * **Client-Side Live Matching**: Instantly scans the database for existing questions and displays a pulsing warning badge (`⚠️ Already on Site`) to prevent double entries.
  * **Server-Side Verification**: The API routes enforce duplicate checking to ensure clean database indexes.

### 🏆 2. NSO Olympiad Hub (`/olympiad`)
* **Subject Focus Selection**: Let students focus their mock training on *Physics & Forces*, *Biology & Life*, *Space & Earth*, or the *Full NSO Syllabus* before starting.
* **Timed Rank Mode**: A global 120-second exam countdown timer that turns into a pulsing, glowing red indicator during the final 30 seconds to alert students.
* **Inline Exam Review**: Displays final marks, XP gains, green/red accuracy highlights for correct vs. selected answers, and an educational "Fun Fact" explaining the science behind each solution.

### 🛍️ 3. Cosmic Avatar Shop (`/shop`)
* **Unlockable Rarity Tiers**: Students trade earned XP to purchase and equip custom profile avatars. Each avatar features unique styles and glowing neon cards matching its tier:
  * `⚙️ BASE` — Default Intern (Free, Gray)
  * `✨ COMMON` — Astro Cadet (Slate Blue)
  * `✨ RARE` — Cybernetic Sage (Sky Blue)
  * `✨ EPIC` — Xenon Lifeform (Purple)
  * `✨ LEGENDARY` — Solar Monarch (Gold)
  * `✨ MYTHIC` — Blackhole Wizard (Red)

### 👑 4. Leaderboard Arena (`/leaderboard`)
* **Grade-Level Filter Tabs**: Scoring boards can be reactively toggled between `All Grades`, `Grade 3`, `Grade 4`, and `Grade 5` to view rankings.
* **Equipped Avatar Display**: Podium rankings and scoreboard lists resolve the student's equipped `avatarId` to show their purchased avatar emoji (e.g., 👽, 🤖, 🧑‍🚀) instead of generic letter initials.

### 👪 5. Parent Progress Center (`/parent`)
* **Visual Analytics**: Interactive analytics widgets detailing accuracy ratios and subject mastery percentages across Physics, Biology, and Earth Sciences.
* **Detailed Activity Logs**: A progress table showing all completed quizzes with score ratios, color-coded accuracy indicators (Green for >= 80%, Yellow for >= 50%, Red for < 50%), XP earned, and exact completion duration in minutes and seconds (e.g. `1m 15s`).

---

## 🎭 User Portal Overview

| Feature / Portal | Student Dashboard (`/dashboard`) | Parent Portal (`/parent`) | Admin Console (`/admin`) |
| :--- | :--- | :--- | :--- |
| **Primary Goal** | Play quizzes, earn XP, unlock avatars | Track student progress, view stats | Manage curriculum, generate AI content |
| **Learning Path** | View topics based on selected Grade | Check accuracy & subject mastery | Create/Edit/Delete topics & chapters |
| **Rewards** | Equips custom avatars, keeps daily streak | View quiz score logs & completion times | Manage questions & check for duplicates |

---

## 🛠️ Technology Stack
* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Client & Server Components)
* **Styling**: Tailwind CSS & Glassmorphism Design
* **Database**: MongoDB (Mongoose Schema Driver)
* **Authentication**: JWT Cookies + HTTP-Only token storage
* **AI Tooling**: Groq API (Llama 3.3 70B) & OpenAI API (GPT-4o mini)

---

## 📂 Project Directory Structure

```
├── public/                 # Static assets & public images
├── scripts/                # Database utilities & admin creator script
├── src/
│   ├── app/                # Next.js pages & API routes
│   │   ├── admin/          # Admin CRUD & AI Generator portal
│   │   ├── api/            # Server endpoints (auth, quiz, shop, topics)
│   │   ├── dashboard/      # Kid's main activity deck and statistics
│   │   ├── leaderboard/    # Grade-filtered Scoreboards
│   │   ├── olympiad/       # Timed mock exam center
│   │   ├── parent/         # Parent progress metrics & log grids
│   │   ├── quiz/           # CBSE question runner (count-up timer)
│   │   ├── results/        # Quiz result & XP awards card
│   │   └── shop/           # Avatar transaction shop
│   ├── components/         # Auth guards & shared layout elements
│   ├── context/            # AuthContext provider
│   ├── lib/                # Database wrappers (Mongoose connection & helpers)
│   └── models/             # Mongoose Schemas (User, Topic, Subtopic, Question, QuizResult)
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
Ensure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/harrythepro-afk/justsciify.git
cd justsciify
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and specify the following variables:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/justsciify
JWT_SECRET=justsciify_super_secret_session_key_2026

# Admin AI Generation APIs (Optional, but required for AI Generator)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...
```

### 4. Running the Development Server
To launch the server in development mode:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🔑 Seeding the Database & Accounts

### 1. Registering the Administrator
To create a default Admin user (`admin@justsciify.com`), run the admin script:
```bash
node scripts/create-admin.js
```

### 2. Seeding Default Science Curriculum
To populate the database with default science topics (Forces, Living Things, Water Cycle) and question pools:
1. Log into the site as the Admin user (`admin@justsciify.com`).
2. Navigate in your browser to: **[http://localhost:3000/api/seed](http://localhost:3000/api/seed)**.
3. You will receive a success JSON message, and all default chapters will load!

### 3. Student Credentials (For Testing)
If you want to log in as a student to test the learning path, you can use these existing database student accounts:
* **Student Account A**:
  * **Email**: `hemantkumar6626@gmail.com`
* **Student Account B**:
  * **Email**: `justsciify@admin.com`
* *Alternatively, click "Create Free Account" on the login screen to register a new student account instantly.*

---

## 🔧 Troubleshooting Guide

### 1. Next.js Windows Symlink / Webpack Lock (`EBUSY` or `EINVAL`)
On Windows environments, file-watchers sometimes lock Next.js caching directories, causing errors like:
`Error: EBUSY: resource busy or locked, open '.../.next/types/app/layout.ts'` or `readlink export-marker.json`.

**How to solve:**
1. Stop your terminal development server by pressing **`Ctrl + C`**.
2. Run the command to remove the `.next` directory completely:
   * **In PowerShell (PS):**
     ```powershell
     Remove-Item -Recurse -Force .next
     ```
   * **In Command Prompt (cmd):**
     ```cmd
     rmdir /s /q .next
     ```
3. Restart the server with **`npm run dev`**. Next.js will rebuild a fresh, clean cache.

### 2. Mongoose CastError on Quiz Results Fetch
If a user completed a mock NSO Olympiad exam, it saved a custom string (e.g. `"National Science Olympiad (NSO) Mock"`) inside `subtopicId`. Because the schema connects `subtopicId` with a ref lookup on the `Subtopic` model, standard Mongoose queries using `.populate('subtopicId')` threw `CastErrors` when trying to convert that string to a 24-character `ObjectId`. This crashed the dashboard API.

**Resolution:**
The system now queries the results first and separates valid ObjectIds from custom NSO strings using `mongoose.Types.ObjectId.isValid()`, executing `.populate()` on the ObjectId subset. The frontend handles the string fallback gracefully without breaking database connections.
