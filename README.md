# Nexo-Trade | نکسو ترید

<div dir="auto" style="text-align: center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Supabase-2.74-3ECF8E?logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
</div>

---

## 🎯 Overview | نمای کلی

**Nexo-Trade** is a production-grade, AI-powered cryptocurrency trading analytics dashboard with **adaptive learning**, **gamification**, and **multi-generational personalization**. Built for traders of all skill levels, from beginners to experts.

**نکسو ترید** یک داشبورد تحلیل ارزهای دیجیتال حرفه‌ای با هوش مصنوعی، یادگیری تطبیقی، گیمیفیکیشن و شخصی‌سازی بر اساس نسل کاربر است که برای تریدرهای تمام سطوح طراحی شده.

---

## 🚀 Key Features | ویژگی‌های کلیدی

### 🎨 Design & UX | طراحی و تجربه کاربری
- **Dark Cyberpunk Aesthetic** - Glassmorphism UI with neon accents and smooth animations
- **RTL Support** - Full Persian (Farsi) localization with right-to-left layout
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Multi-Generational Themes** - Adaptive UI for Gen Alpha, Z, Y, and X

### 🧠 AI & Intelligence | هوش مصنوعی
- **AI-Powered Assistant** - Context-aware chatbot with generation-specific responses
- **Adaptive Content** - Charts, text complexity, and tutorials adjust to skill level
- **Sentiment Analysis** - Multi-source fundamental and technical analysis
- **Signal Aggregator** - Weighted scoring system for BUY/SELL/HOLD decisions

### 🎓 Learning & Gamification | آموزش و گیمیفیکیشن
- **Tutorial System** - Automatic triggers based on user behavior
- **Skill Scoring** - Dynamic skill level calculation from interactions
- **Achievements** - Unlock badges and rewards as you learn
- **Behavioral Tracking** - Learn from user interactions to improve experience

### 📊 Analytics | تحلیل‌ها
- **Real-time Updates** - Auto-refresh with configurable intervals (5/15/60 min)
- **Technical Analysis** - RSI, MACD, moving averages, volatility metrics
- **Market Risk Gauge** - Visual risk assessment
- **Export Capabilities** - CSV and JSON export of trading signals

### 🔐 Authentication & Profiles | احراز هویت و پروفایل
- **Secure Auth** - Email/password authentication with JWT
- **User Profiles** - Store preferences, skill level, and personality
- **Onboarding Flow** - Welcome experience for new users
- **Session Management** - Persistent login with auto-refresh

## 📊 Components

### Main Dashboard
- **Market Overview** - Risk gauge and AI summary
- **Coin Cards** - Individual sentiment analysis for BTC, ETH, XRP, SOL, DOGE
- **Technical Panel** - RSI, MACD, moving averages, volatility metrics
- **Aggregator Panel** - Combined signals with confidence scores
- **Reports Tab** - Detailed text reports with export options

### Key Metrics
- Sentiment scores (0-1 scale)
- Confidence levels with evidence weighting
- Technical analysis scores
- Historical trend visualization
- Risk index calculation

## 🛠️ Tech Stack | فناوری‌های استفاده شده

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.3 |
| **TypeScript** | Type Safety | 5.0+ |
| **Vite** | Build Tool | 5.0+ |
| **TailwindCSS** | Styling | 3.4+ |
| **Framer Motion** | Animations | 12.x |
| **Recharts** | Charts | 2.15+ |
| **React Router** | Routing | 6.30+ |
| **i18next** | Localization | 25.x |
| **Supabase** | Backend (Auth, DB, Functions) | 2.74+ |
| **React Query** | Server State | 5.83+ |
| **Zod** | Validation | 3.25+ |
| **Shadcn UI** | Component Library | Latest |

---

## 📦 Installation & Setup | نصب و راه‌اندازی

### Prerequisites | پیش‌نیازها
- Node.js 18+ and npm/yarn
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Git

### Quick Start | شروع سریع

```bash
# Clone the repository | کلون کردن مخزن
git clone https://github.com/mohammadbourbour/Nexo-Trade-website.git
cd Nexo-Trade-website

# Install dependencies | نصب وابستگی‌ها
npm install

# Set up environment variables | تنظیم متغیرهای محیطی
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, and VITE_SUPABASE_PROJECT_ID

# Start development server | شروع سرور توسعه
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production | بیلد برای پروداکشن

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 📝 Usage | نحوه استفاده

### First-Time Setup | راه‌اندازی اولیه

1. **Sign Up** - Create an account at `/auth`
2. **Onboarding** - Complete the welcome flow (name, age, experience)
3. **Dashboard** - Explore the dashboard and interact with components
4. **Tutorials** - Access learning materials adapted to your level

### Using Mock Data | استفاده از داده‌های نمونه

The dashboard comes with sample data and runs immediately:

```tsx
import { CryptoSentimentProDashboard } from "@/components/CryptoSentimentProDashboard";
import mockData from "@/mocks/sample_data.json";

function App() {
  return <CryptoSentimentProDashboard data={mockData} />;
}
```

### Fetching Live Data | دریافت داده‌های لایو

To connect to a live API endpoint:

```tsx
<CryptoSentimentProDashboard apiEndpoint="/api/dashboard/latest" />
```

### Localization | تغییر زبان

The app automatically detects browser language. To manually switch:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  // Switch to Persian
  i18n.changeLanguage('fa');
  
  // Switch to English
  i18n.changeLanguage('en');
}
```

### Expected Data Format

The dashboard expects data in this structure:

```typescript
{
  fundamental: {
    metrics: {
      total_articles: number,
      articles_considered: number,
      timestamp: string
    },
    summary: string,
    coins: {
      [coinSymbol]: {
        sentiment: "Positive" | "Negative" | "Neutral",
        score: number, // 0-1
        confidence: number, // 0-1
        reason: string,
        evidence_count: number,
        top_examples: Array<{i: number, headline: string, url: string}>,
        history: number[] // Historical scores
      }
    }
  },
  technical: {
    timestamp: string,
    coins: {
      [coinSymbol]: {
        rsi: number, // 0-100
        macd_signal: "bullish" | "bearish" | "neutral",
        ma_short: number,
        ma_long: number,
        volatility: number, // 0-1
        ta_score: number, // 0-1
        history: number[]
      }
    }
  }
}
```

## ⚙️ Configuration

### Weight Customization

Adjust fundamental/technical weights via the UI or programmatically:

```tsx
const [weights, setWeights] = useState({ 
  fundamental: 0.6, 
  technical: 0.4 
});
```

### Trading Styles

Three preset configurations:
- **Short-term**: 30% fundamental, 70% technical
- **Mid-term**: 60% fundamental, 40% technical (default)
- **Long-term**: 80% fundamental, 20% technical

### Auto-refresh Intervals

Available options: Off, 5min, 15min, 60min

## 🧮 Aggregator Logic

### Final Score Calculation
```
final_score = clamp(0, 1, 
  w_fundamental * fundamental_score + 
  w_technical * technical_score
)
```

### Confidence Calculation
```
evidence_adjustment = min(1, evidence_count / 5)
final_confidence = clamp(0, 1,
  w_fundamental * fundamental_confidence * evidence_adjustment +
  w_technical * technical_confidence
)
```

### Decision Rules
- **BUY**: final_score ≥ 0.65 AND final_confidence ≥ 0.7
- **SELL**: final_score ≤ 0.35 AND final_confidence ≥ 0.7
- **HOLD**: All other cases

### Market Risk Index
```
risk_index = (volatility_component + sentiment_component) / 2
```
- Low risk: < 0.3
- Moderate risk: 0.3 - 0.6
- High risk: > 0.6

## 🎨 Design System

### Color Palette
- **Primary** (Cyan): `hsl(186 100% 44%)`
- **Secondary** (Purple): `hsl(250 83% 66%)`
- **Positive** (Green): `hsl(160 84% 39%)`
- **Negative** (Red): `hsl(0 72% 60%)`
- **Neutral** (Amber): `hsl(38 92% 50%)`

### Custom Classes
- `.glass-card` - Glassmorphism effect
- `.neon-glow` - Primary neon glow
- `.positive-glow` - Positive sentiment glow
- `.negative-glow` - Negative sentiment glow

## 📦 Embedding

### React Component
```tsx
import { CryptoSentimentProDashboard } from './components/CryptoSentimentProDashboard';

<CryptoSentimentProDashboard 
  data={yourData} 
  apiEndpoint="/your-api"
/>
```

### Iframe Embedding
```html
<iframe 
  src="https://your-domain.com" 
  width="100%" 
  height="800px" 
  frameborder="0"
></iframe>
```

## 🧪 Testing

### Test Coverage Areas
- Aggregator logic (scores, decisions, confidence)
- Data validation and error handling
- Component rendering with various data states
- Responsive behavior
- Export functionality

### Sample Test
```typescript
import { aggregateSignals } from '@/lib/aggregator';

test('aggregator produces correct BUY signal', () => {
  const data = {
    fundamental: { coins: { BTC: { score: 0.85, confidence: 0.9, evidence_count: 8 } } },
    technical: { coins: { BTC: { ta_score: 0.75 } } }
  };
  const weights = { fundamental: 0.6, technical: 0.4 };
  const result = aggregateSignals(data, weights);
  
  expect(result.BTC.decision).toBe('BUY');
  expect(result.BTC.final_score).toBeGreaterThanOrEqual(0.65);
});
```

## 🔧 Development | توسعه

### Project Structure | ساختار پروژه

```
nexo-trade/
├── src/
│   ├── components/              # React components
│   │   ├── CryptoSentimentProDashboard.tsx  # Main dashboard
│   │   ├── EnhancedAIAssistant.tsx          # AI chatbot
│   │   ├── TutorialSystem.tsx               # Tutorial engine
│   │   ├── GamificationPanel.tsx            # Achievements
│   │   ├── Onboarding.tsx                   # Welcome flow
│   │   ├── crypto-dashboard/                # Dashboard subcomponents
│   │   └── ui/                              # Shadcn components
│   ├── pages/
│   │   ├── Auth.tsx             # Login/Signup
│   │   ├── Dashboard.tsx        # Main dashboard page
│   │   ├── Tutorials.tsx        # Learning section
│   │   └── Index.tsx            # Landing page
│   ├── hooks/
│   │   ├── useUserProfile.ts    # User profile management
│   │   ├── useBehaviorTracking.ts  # Interaction tracking
│   │   ├── useSkillScoring.ts   # Skill calculation
│   │   └── useAdaptiveContent.ts   # Content adaptation
│   ├── lib/
│   │   ├── aggregator.ts        # Signal aggregation logic
│   │   └── utils.ts             # Utility functions
│   ├── i18n/
│   │   ├── config.ts            # i18next setup
│   │   └── locales/
│   │       ├── en.json          # English translations
│   │       └── fa.json          # Persian translations
│   ├── integrations/
│   │   └── supabase/            # Supabase client (auto-generated)
│   ├── assets/                  # Images and static files
│   └── index.css                # Global styles & theme variables
├── supabase/
│   ├── functions/               # Edge Functions (serverless)
│   │   └── ai-assistant/
│   └── config.toml              # Supabase configuration
├── docs/
│   ├── PROJECT_STRUCTURE_FA.md  # Complete file guide (Persian)
│   └── BACKEND_MIGRATION_FA.md  # Backend migration guide
└── public/                      # Static assets
```

### Environment Variables | متغیرهای محیطی

**Automatic (Lovable Cloud):**
```env
VITE_SUPABASE_URL=<auto-generated>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-generated>
VITE_SUPABASE_PROJECT_ID=<auto-generated>
```

**Optional (Custom Backend):**
```env
VITE_API_URL=https://your-api.com
```

### Key Commands | دستورات کلیدی

```bash
# Development | توسعه
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Code Quality | کیفیت کد
npm run lint                   # Run ESLint
npm run type-check             # TypeScript check

# Testing (if configured) | تست
npm run test                   # Run tests
npm run test:coverage          # Test coverage
```

### Adding New Features | اضافه کردن ویژگی جدید

#### 1. Add a New Page | اضافه کردن صفحه جدید
```tsx
// 1. Create src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}

// 2. Add route in src/App.tsx
<Route path="/new-page" element={<NewPage />} />
```

#### 2. Add Translations | اضافه کردن ترجمه
```json
// src/i18n/locales/en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description here"
  }
}

// src/i18n/locales/fa.json
{
  "newFeature": {
    "title": "ویژگی جدید",
    "description": "توضیحات اینجا"
  }
}
```

#### 3. Create New Component | ایجاد کامپوننت جدید
```tsx
// src/components/NewComponent.tsx
import { useTranslation } from 'react-i18next';

export function NewComponent() {
  const { t } = useTranslation();
  
  return (
    <div className="glass-card p-6">
      <h2>{t('newFeature.title')}</h2>
    </div>
  );
}
```

#### 4. Add Database Table | اضافه کردن جدول دیتابیس
See `docs/PROJECT_STRUCTURE_FA.md` for database schema examples.

### Styling Guidelines | راهنمای استایل

**Use Semantic Tokens (Required):**
```tsx
// ❌ Bad - Direct colors
<div className="bg-blue-500 text-white">

// ✅ Good - Semantic tokens
<div className="bg-primary text-primary-foreground">
```

**Theme Variables (index.css):**
```css
:root {
  --primary: 186 100% 44%;      /* Cyan */
  --secondary: 250 83% 66%;     /* Purple */
  --positive: 160 84% 39%;      /* Green */
  --negative: 0 72% 60%;        /* Red */
}
```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## 📚 Documentation | مستندات

- **[Complete Project Structure Guide (Persian)](docs/PROJECT_STRUCTURE_FA.md)** - راهنمای کامل فایل‌ها و ویرایش
- **[Backend Migration Guide (Persian)](docs/BACKEND_MIGRATION_FA.md)** - راهنمای مهاجرت به بک‌اند پایتون
- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🗄️ Database Schema | ساختار دیتابیس

### Tables | جداول

1. **user_profiles** - User profile data (name, age, skill level, generation)
2. **user_interactions** - Behavioral tracking (clicks, scrolls, hovers)
3. **ai_conversations** - AI chat history
4. **tutorial_progress** - Learning progress tracking
5. **dashboard_preferences** - Dashboard settings and favorites

See `docs/PROJECT_STRUCTURE_FA.md` for complete schema details.

---

## 🔐 Security | امنیت

- **Row Level Security (RLS)** - All tables protected with RLS policies
- **JWT Authentication** - Secure token-based auth
- **Auto-refresh Tokens** - Seamless session management
- **Environment Variables** - Secrets stored securely

---

## 🚀 Deployment | دیپلوی

### Lovable Cloud (Recommended)
Click "Publish" button in Lovable editor - automatic deployment with zero configuration.

### Custom Deployment
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy to custom server
# Upload dist/ folder to your server
```

---

## 🤝 Contributing | مشارکت

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Use semantic commit messages

---

## 📄 License | مجوز

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments | قدردانی

- Inspired by **Glassnode**, **Santiment**, and **TradingView**
- Built with modern React and TypeScript best practices
- UI components from **Shadcn UI**
- Powered by **Lovable** and **Supabase**

---

## 📞 Support | پشتیبانی

### For Users | برای کاربران
- 📧 Email: support@nexo-trade.com
- 💬 Discord: [Join Community](https://discord.gg/nexotrade)

### For Developers | برای توسعه‌دهندگان
- 🐛 Report bugs: [GitHub Issues](https://github.com/mohammadbourbour/Nexo-Trade-website/issues)
- 💡 Feature requests: [GitHub Discussions](https://github.com/mohammadbourbour/Nexo-Trade-website/discussions)
- 📖 Documentation: See `docs/` folder

---

## 🌟 Roadmap | نقشه راه

- [x] Multi-language support (English, Persian)
- [x] AI-powered assistant
- [x] Adaptive learning system
- [x] Gamification
- [ ] Real-time price alerts
- [ ] Mobile app (React Native)
- [ ] Trading bot integration
- [ ] Social trading features
- [ ] Portfolio management
- [ ] Advanced charting tools

---

<div align="center">
  
**Built with ❤️ using [Lovable](https://lovable.dev)**

**ساخته شده با ❤️ توسط [لاوابل](https://lovable.dev)**

</div>
