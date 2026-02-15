# 🛡️ faya9ni.tn — Cybersecurity Awareness Platform

> AI-powered cybersecurity awareness & threat reporting platform built for Tunisia.

**faya9ni.tn** empowers Tunisian citizens to stay safe online through AI-driven phishing detection, interactive security quizzes, community threat reporting, and an encrypted password vault — all with multilingual support (English, Arabic, Tunisian Derja).

---

## ✨ Features

### 🔍 Phishing Analyzer
Analyze suspicious URLs or upload screenshots of phishing messages. The system runs heuristic checks combined with AI analysis (Groq / OpenAI) to generate a detailed risk report with red flags, key findings, recommended actions, and a safe reply template.

### 🧠 Cybersecurity Quiz
Test your security knowledge across topics like phishing, passwords, social engineering, and malware. Track daily streaks and consecutive correct-answer streaks. Questions can also be generated from real community threat reports.

### 🔐 Encrypted Password Vault
Store credentials securely with client-side master password protection. Vault uses **Argon2id** for master password hashing, **PBKDF2-SHA256** key derivation, and **AES-256-GCM** encryption. Includes a built-in password strength meter.

### 📢 Community Threat Reports
Submit and browse threat reports from across Tunisia. Filter by governorate and threat type. Upvote reports to surface the most relevant threats.

### 🗺️ Tunisia Threat Heatmap
Interactive Leaflet choropleth map showing threat report density across all 24 Tunisian governorates, with summary statistics and a regional breakdown.

### 🏆 Leaderboard
Community rankings based on streaks and total reports submitted. Top contributors are highlighted.

### 📊 Dashboard
Personal overview with phishing analysis history, quiz performance, vault status, streak tracking, and a mini threat heatmap.

### 🌐 Multilingual (i18n)
Full UI support for **English**, **Arabic**, and **Tunisian Derja** with RTL layout.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & Database | [Supabase](https://supabase.com/) (Auth + PostgreSQL) |
| AI / LLM | Groq, OpenAI |
| OCR | Tesseract.js |
| Maps | Leaflet + React-Leaflet |
| Validation | Zod |
| Encryption | Argon2, Web Crypto API (AES-256-GCM, PBKDF2) |

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # Backend API endpoints
│   │   ├── phish/        # Phishing analysis & reporting
│   │   ├── quiz/         # Quiz start, answer, finish
│   │   ├── vault/        # Encrypted vault operations
│   │   ├── reports/      # Community threat reports
│   │   ├── heatmap/      # Heatmap data aggregation
│   │   ├── leaderboard/  # User rankings
│   │   ├── dashboard/    # Dashboard summary
│   │   └── streak/       # Streak tracking
│   ├── dashboard/        # Dashboard page
│   ├── phishing/         # Phishing analyzer page
│   ├── quiz/             # Quiz page
│   ├── vault/            # Password vault page
│   ├── reports/          # Threat reports feed
│   ├── heatmap/          # Tunisia heatmap page
│   ├── leaderboard/      # Leaderboard page
│   └── login/            # Auth (login / register / magic link)
├── components/           # Reusable UI components
├── contexts/             # React contexts (Language)
├── hooks/                # Custom hooks (useUser)
└── lib/                  # Utilities, crypto, AI integrations, i18n
supabase/
└── migrations/           # SQL migration files
public/
└── geo/                  # Tunisia GeoJSON data
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn** or **pnpm**
- A [Supabase](https://supabase.com/) project (for auth & database)
- API keys for **Groq** and/or **OpenAI** (for AI-powered analysis)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shieldsup-hackathon.git
cd shieldsup-hackathon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq AI (password analysis & quiz generation)
GROQ_API_KEY=your_groq_api_key

# OpenAI (phishing analysis)
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set up the database

Run the SQL migrations in your Supabase project (via the Supabase Dashboard SQL Editor or CLI) in order:

```bash
# Using Supabase CLI
supabase db push
```

Or manually execute each file in `supabase/migrations/` sequentially.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm start
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project was built for the **ShieldsUp Hackathon**.

---

<p align="center">
  Built with ❤️ for Tunisia's cybersecurity awareness
</p>
