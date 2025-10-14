# Crypto Sentiment Pro Dashboard

A production-grade, AI-powered cryptocurrency trading analytics dashboard featuring fundamental analysis, technical indicators, and intelligent signal aggregation. Built with React, TailwindCSS, Framer Motion, and Recharts.

## 🚀 Features

- **Dark Cyberpunk Aesthetic** - Modern glassmorphism UI with neon accents
- **Multi-Source Analysis** - Combines fundamental sentiment and technical indicators
- **Intelligent Signal Aggregator** - Weighted scoring system for BUY/SELL/HOLD decisions
- **Real-time Updates** - Auto-refresh capabilities with configurable intervals
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile
- **Export Capabilities** - CSV and JSON export of trading signals
- **Comprehensive Reporting** - Detailed AI-generated market analysis

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

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Modern browser with ES6 support

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd crypto-sentiment-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:8080`

## 📝 Usage

### Using Mock Data (Default)

The dashboard comes with sample data and runs immediately:

```tsx
import { CryptoSentimentProDashboard } from "@/components/CryptoSentimentProDashboard";
import mockData from "@/mocks/sample_data.json";

function App() {
  return <CryptoSentimentProDashboard data={mockData} />;
}
```

### Fetching Live Data

To connect to a live API endpoint:

```tsx
<CryptoSentimentProDashboard apiEndpoint="/api/dashboard/latest" />
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

## 🔧 Development

### File Structure
```
src/
├── components/
│   ├── CryptoSentimentProDashboard.tsx
│   ├── crypto-dashboard/
│   │   ├── CoinCard.tsx
│   │   ├── MarketGauge.tsx
│   │   ├── TechnicalPanel.tsx
│   │   ├── AggregatorPanel.tsx
│   │   ├── ReportsTab.tsx
│   │   └── RefreshControl.tsx
│   └── ui/ (shadcn components)
├── lib/
│   └── aggregator.ts
├── mocks/
│   └── sample_data.json
└── pages/
    └── Index.tsx
```

### Environment Variables

No environment variables required for basic usage. Optional for API integration:

```env
VITE_API_ENDPOINT=https://your-api.com/dashboard
VITE_API_KEY=your-api-key
```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Designed for professional trading analytics
- Inspired by Glassnode, Santiment, and TradingView
- Built with modern React best practices

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Contact: support@example.com

---

**Built with ❤️ using Lovable**
