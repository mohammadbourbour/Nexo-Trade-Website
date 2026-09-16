# Nexo-Trade | نکسو ترید

<div dir="auto" style="text-align: center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Frontend_only-demo-8B5CF6" alt="Frontend only"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
</div>

---

## Website only | فقط وبسایت

This repository is the **Nexo-Trade website**. It is a frontend demo: **there is no backend, no live database, and no live AI API**.

Login, onboarding, profiles, behavior tracking, tutorials, and assistant replies all run in the browser with sample market data. Nothing is saved on a server.

این مخزن **فقط وبسایت نکسو ترید** است. بک‌اند، دیتابیس زنده و API هوش مصنوعی متصل نشده. ورود، آنبوردینگ، پروفایل، ردیابی رفتار، آموزش‌ها و پاسخ دستیار همگی در مرورگر و با دادهٔ نمونه اجرا می‌شوند.

---

## Adaptive experience | تجربه تطبیقی

The site changes itself from the age, generation, skill, personality, and in-browser behavior collected during onboarding and dashboard use.

سایت بر اساس سن، نسل، سطح مهارت، شخصیت و رفتار کاربر در مرورگر خودش را تطبیق می‌دهد.

### Generation themes | تم نسل‌ها

Age entered on welcome maps to a generation and restyles the whole UI:

| Generation | Typical ages | What the site does |
|---|---|---|
| **Gen Alpha** | born ~2010+ | Brighter, more playful colors, rounder cards, stronger motion |
| **Gen Z** | born ~1997–2009 | Vibrant neon, dynamic accents, casual assistant tone |
| **Gen Y** | born ~1981–1996 | Cleaner, more balanced, slightly darker workspace |
| **Gen X** | older visitors | **Darker environment**, calmer color, less glow, larger type, more formal copy |

When an older visitor (Gen X / older millennial range) completes onboarding, the workspace **goes darker**, neon is reduced, contrast goes up, and the assistant speaks more formally.

وقتی کسی از نسل قدیم‌تر وارد شود محیط **تیره‌تر** می‌شود، درخشش نئون کم می‌شود، خوانایی بالاتر می‌رود و لحن دستیار رسمی‌تر است. برای نسل‌های جوان‌تر فضا روشن‌تر، رنگی‌تر و پرتحرک‌تر است.

### Behavior adaptation | تطبیق با رفتار کاربر

The frontend also watches what the visitor actually does (clicks, section views, chart zoom/pan, questions, tutorial completion) and stores it locally. That history is used to:

- raise or lower a **skill score**
- change how dense the dashboard copy and charts feel
- show or hide beginner tutorials
- switch the assistant between casual and professional tone
- keep favorite sections and progress in this browser only

پلتفرم خودش را با خواسته‌ها و رفتار کاربر هماهنگ می‌کند: روی چه بخشی می‌ماند، چقدر با نمودار کار می‌کند، چه سوالی می‌پرسد و کدام آموزش را تمام می‌کند. امتیاز مهارت، پیچیدگی محتوا، آموزش‌ها و لحن دستیار از همین رفتار محلی به‌روز می‌شوند.

---

## 🎯 Overview | نمای کلی

**Nexo-Trade** is a production-style cryptocurrency analytics dashboard UI with generation-aware theming, adaptive learning, and gamification. It is built as a website preview for traders of different ages and skill levels.

**نکسو ترید** داشبورد تحلیلی ارز دیجیتال با تم نسلی، یادگیری تطبیقی و گیمیفیکیشن است که به‌صورت پیش‌نمایش وبسایت ارائه شده است.

### Design & UX
- Dark cyberpunk base, with generation overrides (bright for young users, darker for older users)
- Full Persian RTL + English
- Responsive desktop / tablet / mobile
- Glassmorphism cards, neon accents that quiet down for older generations

### Adaptive intelligence (frontend demo)
- Context-aware assistant replies generated in the browser (not a live model)
- Charts, text complexity, and tutorials adjust to skill
- Sample sentiment, technical, and aggregator panels
- Behavior tracking stored in `localStorage`

### Learning & gamification
- Tutorial prompts based on first visit / idle time
- Skill scoring from local interactions
- Achievements and trader XP stored locally

---

## 🛠️ Tech stack | فناوری‌ها

| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI |
| Vite | Dev server and build |
| TailwindCSS + Shadcn UI | Styling and components |
| Framer Motion | Motion (intensity follows generation) |
| Recharts | Charts from sample data |
| i18next | English / Persian |
| React Query | Client state helpers |

No backend package is required.

---

## 📦 Setup | راه‌اندازی

```bash
git clone https://github.com/mohammadbourbour/Nexo-Trade-Website.git
cd Nexo-Trade-Website
npm install
npm run dev
```

Open `http://localhost:8080`. No `.env` file is needed.

Create any email/password on `/auth` — the account stays in this browser. Complete welcome (name + age) to apply the generation theme, then use the dashboard.

```bash
npm run build
npm run preview
```

---

## How to see generation changes | دیدن تغییر نسل

1. Sign up and set a young age (for example 16) → brighter Gen Z / Alpha look, more motion, casual assistant.
2. Log out, sign up with another email, set age 50+ → **darker Gen X workspace**, calmer UI, more formal analysis copy.
3. Click around charts and tutorials → skill and content density shift in the same session.

---

## Sample data | داده نمونه

Dashboard panels read `src/mocks/sample_data.json`. Aggregator math still runs in the client (`src/lib/aggregator.ts`) so BUY / SELL / HOLD rules are visible without a server.

Local demo state lives in `localStorage` under `nexo-trade-demo-db`.

---

## Project structure | ساختار

```
nexo-trade/
├── src/
│   ├── components/           # Dashboard, assistant, tutorials, UI
│   ├── pages/                # Auth, Welcome, Dashboard, Tutorials
│   ├── hooks/                # Profile, skill, behavior, adaptive content
│   ├── lib/                  # Local demo store + in-browser assistant
│   ├── i18n/                 # EN / FA
│   └── mocks/sample_data.json
├── public/
└── README.md
```

---

## 🔐 Notes | نکته امنیتی

This is a **website demo**. Passwords are hashed in the browser and stored in `localStorage` only so the login flow can be shown. Do not use real credentials. There is no server-side auth, RLS, or production AI.

---

## 📄 License

MIT — see [LICENSE](LICENSE).
