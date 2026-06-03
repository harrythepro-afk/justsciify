# 🚀 JustSciify — Gamified Science Learning Platform

JustSciify is an interactive, gamified learning application designed to teach science concepts to children in Grades 3-5 (Ages 8-11). It combines CBSE/ICSE curriculum structures with game design mechanisms (XP, custom avatars, leaderboards, and grade-based ranking) and features an AI-assisted curriculum builder for administrators.

---

## 🌟 Key Features

### 1. 🧠 AI Syllabus & Question Generator (Admin Console)
* **Syllabus Architect (Entire Topic)**: Input any scientific prompt (e.g., *"Gravity and solar orbits"*) to generate a full curriculum outline containing custom topic banners, emoji icons, colors, chapters (subtopics), and CBSE-aligned multiple-choice questions.
* **Question Booster (Existing Chapters)**: Seed new questions into existing chapters dynamically using either **Groq Cloud (Llama 3.3 70B)** or **ChatGPT API (GPT-4o mini)**.
* **Granular Selectors & Duplicate Checks**:
  * Checkboxes allow admins to selectively push/save specific AI-generated questions to the database.
  * Real-time client-side checks look up existing questions and highlight duplicates with a pulsing warning badge (`Already on Site`), auto-disabling them from being committed to prevent "double" entries.
  * Server-side database constraints ensure duplicate question texts are skipped.

### 🏆 2. NSO Olympiad Hub (`/olympiad`)
* **Subject Focus Selection**: Select from Physics & Forces, Biology & Life, Space & Earth, or Full NSO syllabus focus areas before launching the exam.
* **Pulsing Timer UX**: A global 120-second exam timer countdown that flashes and pulses in bright red in the final 30 seconds.
* **Inline Exam Review Screen**: Displays final score, XP rewards, correct vs. selected answers highlighted in green/red, and educational fun facts explaining why answers are correct.

### 🛍️ 3. Cosmic Avatar Shop (`/shop`)
* **Unlockable Rarity Tiers**: Upgrade public profiles by spending study points (XP) to unlock and equip custom avatars classified into rarity tiers:
  * Default Intern: `⚙️ BASE` (Free)
  * Astro Cadet: `✨ COMMON` (Slate)
  * Cybernetic Sage: `✨ RARE` (Sky Blue)
  * Xenon Lifeform: `✨ EPIC` (Purple)
  * Solar Monarch: `✨ LEGENDARY` (Gold)
  * Blackhole Wizard: `✨ MYTHIC` (Red)
* Cards feature glowing neon borders and custom drop-shadow boxes matching their tier color.

### 👑 4. Leaderboard Arena (`/leaderboard`)
* **Grade-Level Filter Tabs**: Toggle scoreboard rankings reactively between `All Grades`, `Grade 3`, `Grade 4`, and `Grade 5`.
* **Equipped Avatar Display**: Podiums and scoreboard lists map the student's equipped `avatarId` to render their purchased avatar emoji (e.g., 👽, 🤖, 🧑‍🚀) instead of standard name initials.

### 👪 5. Parent Progress Center (`/parent`)
* **Visual Progress Analytics**: Glassmorphic analytics graphs calculating overall accuracy and subject mastery percentages for Physics, Biology, and Earth Sciences.
* **Detailed Activity Logs**: A structured log table showing all completed quizzes, including exact score ratios, colorful accuracy badges (Green/Yellow/Red), XP earned, dates, and elapsed completion time duration formatted into minutes and seconds.

---

## 🛠️ Tech Stack
* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Client & Server Components)
* **Frontend Logic & State**: React Hooks (State, Effects, Context, Ref, Memo)
* **Styling**: Tailwind CSS & Glassmorphism design system
* **Database**: MongoDB & Mongoose schemas
* **Authentication**: JWT Cookies + HTTP-only cookies
* **AI Tooling**: Groq API (Llama 3.3) & OpenAI API (GPT-4o mini)

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
│   │   ├── quiz/           # CBSE question runner (stress-free count-up timer)
│   │   ├── results/        # Quiz result & XP awards card
│   │   └── shop/           # Avatar transaction shop
│   ├── components/         # Auth guards & shared elements
│   ├── context/            # AuthContext provider
│   ├── lib/                # Database wrappers (Mongoose connection & helpers)
│   └── models/             # Mongoose Schemas (User, Topic, Subtopic, Question, QuizResult)
```

---

## 🚀 Installation & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harrythepro-afk/justsciify.git
cd justsciify
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and specify the following variables:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/justsciify
JWT_SECRET=your_jwt_signing_secret_key

# Admin AI Generation APIs (Optional, but required for AI Generator)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...
```

### 3. Clear Caching & Build
If building the production bundle, Next.js caches on Windows environments can sometimes lead to webpack path errors. To run a clean build, run:

* **In PowerShell:**
  ```powershell
  Remove-Item -Recurse -Force .next
  npm run build
  ```
* **In Command Prompt:**
  ```cmd
  rmdir /s /q .next
  npm run build
  ```

### 4. Run Locally
To run the server in development mode:
```bash
npm run dev
```

To run the compiled production build:
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🔑 Seeding the Database
To populate the site with default topics (Forces, Living Things, Water Cycle) and question pools, log into the site and access the seed route:
👉 **[http://localhost:3000/api/seed](http://localhost:3000/api/seed)**

To create a default Admin user (`admin@justsciify.com`), run the admin script:
```bash
node scripts/create-admin.js
```
