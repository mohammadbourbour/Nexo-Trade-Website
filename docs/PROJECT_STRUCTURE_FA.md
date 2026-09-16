# 📁 راهنمای کامل ساختار پروژه Nexo-Trade

> این پروژه الان **فقط وبسایت فرانت‌اند** است. پوشه `supabase/` و اتصال بک‌اند حذف شده‌اند. حساب و پروفایل در مرورگر (`src/lib/demo-store.ts`) ذخیره می‌شود.

## 🎯 نمای کلی

این پروژه یک داشبورد تحلیل ارزهای دیجیتال با قابلیت‌های هوش مصنوعی و شخصی‌سازی است که با React + TypeScript + Vite ساخته شده.

---

## 📂 ساختار اصلی فایل‌ها

```
nexo-trade/
├── src/                          # کد اصلی برنامه
│   ├── components/              # کامپوننت‌های React
│   ├── pages/                   # صفحات اصلی
│   ├── hooks/                   # Custom React Hooks
│   ├── lib/                     # دموی محلی (بدون بک‌اند)
│   ├── i18n/                    # فایل‌های چندزبانه
│   ├── assets/                  # تصاویر و فایل‌های استاتیک
│   └── mocks/                   # داده نمونه داشبورد
├── public/                       # فایل‌های استاتیک عمومی
└── docs/                         # مستندات

```

---

## 🔧 فایل‌های کلیدی برای ویرایش

### 1️⃣ **صفحات اصلی (src/pages/)**

| فایل | کاربرد | ویرایش برای |
|------|---------|-------------|
| `Auth.tsx` | صفحه ورود/ثبت‌نام | تغییر فرم‌ها، اعتبارسنجی، UI احراز هویت |
| `Dashboard.tsx` | صفحه اصلی داشبورد | مدیریت روت‌ها، نمایش کامپوننت‌های اصلی |
| `Index.tsx` | صفحه لندینگ (نقطه ورود) | صفحه اول سایت |
| `Tutorials.tsx` | بخش آموزش | محتوای آموزشی نسل‌های مختلف |
| `PartnersInvestors.tsx` | صفحه شرکا | اطلاعات کسب‌وکار |

### 2️⃣ **کامپوننت‌های اصلی (src/components/)**

#### 🎨 داشبورد اصلی
- `CryptoSentimentProDashboard.tsx` - کامپوننت اصلی داشبورد، ترکیب همه بخش‌ها
- `crypto-dashboard/` - زیرکامپوننت‌های داشبورد:
  - `CoinCard.tsx` - کارت تحلیل هر ارز
  - `AggregatorPanel.tsx` - پنل ترکیب سیگنال‌ها
  - `TechnicalPanel.tsx` - تحلیل تکنیکال
  - `MarketGauge.tsx` - نمایشگر ریسک بازار
  - `NewsAnalysisSection.tsx` - تحلیل اخبار

#### 🤖 هوش مصنوعی و شخصی‌سازی
- `EnhancedAIAssistant.tsx` - دستیار هوش مصنوعی
- `AIAssistantPanel.tsx` - پنل چت AI
- `AdaptiveCoinCard.tsx` - کارت ارز انطباقی با سطح کاربر

#### 👤 مدیریت کاربر
- `Onboarding.tsx` - فرآیند خوش‌آمدگویی (نام، سن، تجربه)
- `WelcomeMessage.tsx` - پیام خوش‌آمد شخصی‌شده
- `TraderProfilePanel.tsx` - پروفایل تریدر
- `LogoutButton.tsx` - دکمه خروج

#### 🎮 گیمیفیکیشن و آموزش
- `GamificationPanel.tsx` - سیستم امتیازدهی و جوایز
- `TutorialSystem.tsx` - سیستم آموزشی هوشمند
- `AchievementPopup.tsx` - پاپ‌آپ موفقیت‌ها
- `NotificationCenter.tsx` - مرکز اعلان‌ها

#### 🌐 UI و تنظیمات
- `LanguageSwitcher.tsx` - تغییر زبان
- `NavigationDropdown.tsx` - منوی ناوبری
- `CategorySection.tsx` - دسته‌بندی محتوا

### 3️⃣ **Hooks (src/hooks/)**

| فایل | کاربرد |
|------|---------|
| `useUserProfile.ts` | مدیریت پروفایل کاربر (نام، سن، نسل، تجربه) |
| `useTraderProfile.ts` | مدیریت پروفایل تریدینگ |
| `useBehaviorTracking.ts` | ردیابی رفتار کاربر (کلیک، اسکرول، hover) |
| `useSkillScoring.ts` | محاسبه امتیاز مهارت کاربر |
| `useAdaptiveContent.ts` | تطبیق محتوا با سطح کاربر |
| `use-toast.ts` | نمایش پیام‌های Toast |
| `use-mobile.tsx` | تشخیص موبایل |

### 4️⃣ **ترجمه و چندزبانگی (src/i18n/)**

| فایل | کاربرد |
|------|---------|
| `config.ts` | تنظیمات i18next |
| `locales/en.json` | متن‌های انگلیسی |
| `locales/fa.json` | متن‌های فارسی |

**نحوه اضافه کردن ترجمه جدید:**
```json
// در fa.json یا en.json
{
  "کلید_شما": "متن شما",
  "dashboard": {
    "title": "عنوان داشبورد"
  }
}
```

**استفاده در کامپوننت:**
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

### 5️⃣ **لاجیک و توابع کمکی (src/lib/)**

| فایل | کاربرد |
|------|---------|
| `aggregator.ts` | الگوریتم ترکیب سیگنال‌های BUY/SELL/HOLD |
| `utils.ts` | توابع کمکی عمومی (cn، clsx) |

### 6️⃣ **استایل‌ها**

| فایل | کاربرد |
|------|---------|
| `src/index.css` | استایل‌های گلوبال، متغیرهای CSS، تم‌ها |
| `tailwind.config.ts` | تنظیمات Tailwind CSS |

**تغییر رنگ‌های تم:**
```css
/* در index.css */
:root {
  --primary: 186 100% 44%;  /* رنگ اصلی (HSL) */
  --secondary: 250 83% 66%; /* رنگ ثانویه */
}
```

### 7️⃣ **بک‌اند (supabase/)**

| فایل | کاربرد |
|------|---------|
| `functions/ai-assistant/index.ts` | Edge Function برای AI چت |
| `functions/ai-chat/index.ts` | Edge Function دیگر برای چت |
| `config.toml` | تنظیمات Supabase و JWT |

---

## 🗄️ ساختار دیتابیس (Supabase)

### جداول اصلی:

1. **`user_profiles`** - پروفایل کاربران
   ```sql
   - id, user_id (UUID)
   - preferred_name (text)
   - age (integer)
   - generation (text)
   - skill_level (enum: beginner/intermediate/advanced)
   - skill_score (integer 1-10)
   - personality (text)
   ```

2. **`user_interactions`** - ردیابی رفتار
   ```sql
   - user_id, interaction_type
   - section, details (jsonb)
   - duration_seconds
   ```

3. **`ai_conversations`** - تاریخچه گفتگوهای AI
   ```sql
   - user_id, question, response
   - context (jsonb)
   - was_helpful (boolean)
   ```

4. **`tutorial_progress`** - پیشرفت آموزشی
   ```sql
   - user_id, tutorial_id
   - completed (boolean)
   - completion_time_seconds
   ```

5. **`dashboard_preferences`** - تنظیمات داشبورد
   ```sql
   - user_id, layout_config (jsonb)
   - favorite_sections (array)
   - chart_indicators (jsonb)
   ```

---

## 🎨 سیستم تم‌بندی

### تم‌های نسلی (در index.css):
- `.theme-genAlpha` - نسل آلفا (رنگ‌های شاد، انیمیشن زیاد)
- `.theme-genZ` - نسل Z (مدرن، نئون)
- `.theme-genY` - نسل Y (حرفه‌ای، متعادل)
- `.theme-genX` - نسل X (کلاسیک، ساده)

### کلاس‌های سفارشی:
```css
.glass-card         /* افکت شیشه‌ای */
.neon-glow          /* درخشش نئونی */
.positive-glow      /* درخشش مثبت (سبز) */
.negative-glow      /* درخشش منفی (قرمز) */
```

---

## 🔐 احراز هویت

**فلوی فعلی:**
1. کاربر وارد `/auth` می‌شود
2. فرم login/signup نمایش داده می‌شود
3. Supabase احراز هویت را انجام می‌دهد
4. JWT در localStorage ذخیره می‌شود
5. هدایت به `/dashboard`

**فایل‌های مرتبط:**
- `src/pages/Auth.tsx` - UI احراز هویت
- `src/integrations/supabase/client.ts` - کلاینت Supabase (خودکار)

---

## 🚀 چگونه تغییرات خود را اعمال کنیم؟

### 1. تغییر متن‌ها
→ ویرایش `src/i18n/locales/fa.json` یا `en.json`

### 2. تغییر UI کامپوننت
→ ویرایش فایل `.tsx` مربوطه در `src/components/`

### 3. تغییر لاجیک داشبورد
→ ویرایش `src/components/CryptoSentimentProDashboard.tsx`

### 4. اضافه کردن صفحه جدید
1. ایجاد `src/pages/NewPage.tsx`
2. افزودن route در `src/App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

### 5. تغییر رنگ‌ها و تم
→ ویرایش `src/index.css` و `tailwind.config.ts`

### 6. اضافه کردن Edge Function جدید
1. ایجاد `supabase/functions/function-name/index.ts`
2. افزودن در `supabase/config.toml`:
```toml
[functions.function-name]
verify_jwt = true
```

---

## 📦 وابستگی‌های مهم

| پکیج | کاربرد |
|------|---------|
| `react-router-dom` | مسیریابی (روتینگ) |
| `@supabase/supabase-js` | ارتباط با بک‌اند |
| `@tanstack/react-query` | مدیریت state سرور |
| `recharts` | نمودارها |
| `framer-motion` | انیمیشن‌ها |
| `i18next` | چندزبانگی |
| `zod` | اعتبارسنجی فرم‌ها |
| `lucide-react` | آیکون‌ها |

---

## 🐛 دیباگ و لاگ‌ها

### مشاهده لاگ‌های بک‌اند:
1. Developer Tools > Console
2. فیلتر روی `[AI Assistant]` یا `[Supabase]`

### مشاهده لاگ‌های Edge Functions:
- در Lovable: کلیک روی "View Backend" → Edge Functions Logs

### دیباگ مشکلات احراز هویت:
```tsx
// در هر کامپوننتی:
import { supabase } from '@/integrations/supabase/client';

const checkAuth = async () => {
  const { data } = await supabase.auth.getUser();
  console.log('Current user:', data);
};
```

---

## 📝 نکات مهم

1. ⚠️ **هرگز این فایل‌ها را دستی ویرایش نکنید:**
   - `src/integrations/supabase/types.ts` (خودکار تولید می‌شود)
   - `src/integrations/supabase/client.ts` (خودکار تولید می‌شود)
   - `.env` (توسط Lovable Cloud مدیریت می‌شود)

2. ✅ **همیشه از semantic tokens استفاده کنید:**
   ```tsx
   // ❌ اشتباه
   <div className="bg-blue-500">
   
   // ✅ درست
   <div className="bg-primary">
   ```

3. 🌐 **برای RTL:**
   - فایل `src/i18n/config.ts` به صورت خودکار `dir="rtl"` را اعمال می‌کند
   - Tailwind RTL-aware است

4. 🔒 **امنیت:**
   - همه جداول دارای Row Level Security (RLS) هستند
   - فقط کاربر لاگین شده به داده‌های خود دسترسی دارد

---

## 🎯 سناریوهای متداول

### سناریو 1: اضافه کردن یک ویژگی جدید به داشبورد
```tsx
// 1. ایجاد کامپوننت جدید
// src/components/NewFeature.tsx
export function NewFeature() {
  return <div>ویژگی جدید</div>;
}

// 2. اضافه به داشبورد
// src/components/CryptoSentimentProDashboard.tsx
import { NewFeature } from './NewFeature';
// ... در JSX:
<NewFeature />
```

### سناریو 2: تغییر الگوریتم امتیازدهی
→ ویرایش `src/hooks/useSkillScoring.ts`

### سناریو 3: اضافه کردن یک زبان جدید
1. ایجاد `src/i18n/locales/ar.json` (مثلاً عربی)
2. افزودن در `src/i18n/config.ts`:
```tsx
resources: {
  en: { translation: en },
  fa: { translation: fa },
  ar: { translation: ar }, // جدید
}
```

---

## 📞 پشتیبانی

برای سوالات بیشتر:
- مستندات Lovable: https://docs.lovable.dev
- مستندات Supabase: https://supabase.com/docs
- مستندات React: https://react.dev

---

**آخرین بروزرسانی:** 2025
**نسخه پروژه:** 2.0.0
