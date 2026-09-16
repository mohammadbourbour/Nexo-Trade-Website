# 🔄 راهنمای مهاجرت به بک‌اند پایتون

> **وضعیت فعلی:** سوپابیس از این ریپو حذف شده و سایت فقط فرانت‌اند است. این سند دیگر یک راهنمای حذف Lovable Cloud نیست؛ اگر بعداً بک‌اند واقعی بخواهید، از دموی محلی (`src/lib/demo-store.ts` و `src/lib/demo-ai.ts`) شروع کنید.

## 📋 نمای کلی

این راهنما نحوه حذف Lovable Cloud (Supabase) و اتصال به بک‌اند سفارشی پایتون را توضیح می‌دهد.

---

## ⚠️ هشدار مهم

**قبل از شروع:**
1. 📦 **Backup بگیرید** - از تمام داده‌های Supabase نسخه بگیرید
2. 🔐 **احراز هویت** - باید سیستم JWT خود را پیاده‌سازی کنید
3. 🗄️ **دیتابیس** - باید جداول معادل را در دیتابیس پایتون خود ایجاد کنید
4. ⚡ **Edge Functions** - باید API endpoints معادل بسازید

**توجه:** پس از حذف Lovable Cloud، **امکان بازگشت وجود ندارد**. این تصمیم برگشت‌ناپذیر است.

---

## 🗄️ مرحله 1: بررسی ساختار دیتابیس فعلی

### جداول موجود:

#### 1. `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  preferred_name TEXT,
  age INTEGER,
  generation TEXT,
  skill_level TEXT DEFAULT 'beginner',
  skill_score INTEGER DEFAULT 1,
  personality TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**معادل Django Model:**
```python
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    SKILL_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    preferred_name = models.CharField(max_length=100, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    generation = models.CharField(max_length=20, null=True, blank=True)
    skill_level = models.CharField(max_length=20, choices=SKILL_LEVELS, default='beginner')
    skill_score = models.IntegerField(default=1)
    personality = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 2. `user_interactions`
```sql
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  section TEXT NOT NULL,
  details JSONB,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**معادل Django Model:**
```python
class UserInteraction(models.Model):
    INTERACTION_TYPES = [
        ('click', 'Click'),
        ('hover', 'Hover'),
        ('scroll', 'Scroll'),
        ('zoom', 'Zoom'),
        ('pan', 'Pan'),
        ('view', 'View'),
        ('question', 'Question'),
        ('tutorial_view', 'Tutorial View'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    section = models.CharField(max_length=100)
    details = models.JSONField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 3. `ai_conversations`
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  was_helpful BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**معادل Django Model:**
```python
class AIConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.TextField()
    response = models.TextField()
    context = models.JSONField(null=True, blank=True)
    was_helpful = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 4. `tutorial_progress`
```sql
CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tutorial_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completion_time_seconds INTEGER,
  was_helpful BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**معادل Django Model:**
```python
class TutorialProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tutorial_id = models.CharField(max_length=100)
    completed = models.BooleanField(default=False)
    completion_time_seconds = models.IntegerField(null=True, blank=True)
    was_helpful = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'tutorial_id']
```

#### 5. `dashboard_preferences`
```sql
CREATE TABLE dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  favorite_sections TEXT[],
  layout_config JSONB DEFAULT '{}',
  chart_indicators JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**معادل Django Model:**
```python
class DashboardPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_sections = models.JSONField(default=list)  # Array
    layout_config = models.JSONField(default=dict)
    chart_indicators = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 🔐 مرحله 2: پیاده‌سازی احراز هویت JWT

### بک‌اند پایتون (Django REST Framework)

#### نصب پکیج‌ها:
```bash
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

#### تنظیمات Django (`settings.py`):
```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... سایر middleware ها
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "https://yourdomain.com",  # دامین پروداکشن
]
CORS_ALLOW_CREDENTIALS = True

# JWT Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

#### API Views برای احراز هویت:
```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': str(user.id),
            'email': user.email,
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=email, password=password)
    
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=401)
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': str(user.id),
            'email': user.email,
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    return Response({
        'id': str(request.user.id),
        'email': request.user.email,
    })
```

#### URLs:
```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('auth/signup', views.signup),
    path('auth/login', views.login),
    path('auth/user', views.get_user),
    # ... سایر endpoints
]
```

---

## 🔌 مرحله 3: ایجاد لایه سرویس جدید در فرانت‌اند

### ایجاد کلاینت API جدید:

```typescript
// src/lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AuthTokens {
  access: string;
  refresh: string;
}

class APIClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // بارگذاری توکن‌ها از localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async refreshAccessToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: this.refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Session expired');
    }

    const data = await response.json();
    this.setTokens(data.access, this.refreshToken!);
    return data.access;
  }

  private setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // اگر توکن منقضی شده، refresh کن
    if (response.status === 401 && this.refreshToken) {
      const newAccessToken = await this.refreshAccessToken();
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async signup(email: string, password: string) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data.access, data.refresh);
    return data.user;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data.access, data.refresh);
    return data.user;
  }

  async getUser() {
    return this.request('/auth/user');
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Profile methods
  async getUserProfile() {
    return this.request('/profiles/me');
  }

  async updateUserProfile(data: any) {
    return this.request('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Interactions
  async trackInteraction(data: any) {
    return this.request('/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Conversations
  async sendAIMessage(message: string, context: any) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }
}

export const apiClient = new APIClient();
```

---

## 🔄 مرحله 4: جایگزینی فراخوانی‌های Supabase

### قبل (با Supabase):
```typescript
// src/hooks/useUserProfile.ts
import { supabase } from "@/integrations/supabase/client";

const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

### بعد (با API پایتون):
```typescript
// src/hooks/useUserProfile.ts
import { apiClient } from "@/lib/api-client";

const profile = await apiClient.getUserProfile();
```

---

## 🗑️ مرحله 5: حذف وابستگی‌های Supabase

### 1. حذف فایل‌ها:
```bash
# حذف فولدر Supabase
rm -rf supabase/

# حذف فایل‌های integration
rm -rf src/integrations/supabase/
```

### 2. حذف پکیج:
```bash
npm uninstall @supabase/supabase-js
```

### 3. حذف تنظیمات محیطی:
```bash
# حذف یا کامنت کردن در .env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...

# اضافه کردن URL بک‌اند جدید
VITE_API_URL=http://localhost:8000/api
```

### 4. بروزرسانی فایل‌های کد:

#### `src/pages/Auth.tsx`:
```typescript
// قبل:
import { supabase } from "@/integrations/supabase/client";

const { error } = await supabase.auth.signUp({
  email,
  password,
});

// بعد:
import { apiClient } from "@/lib/api-client";

try {
  await apiClient.signup(email, password);
  navigate('/dashboard');
} catch (error) {
  toast.error('خطا در ثبت‌نام');
}
```

#### `src/hooks/useUserProfile.ts`:
```typescript
// جایگزینی کامل فایل با نسخه‌ای که از apiClient استفاده می‌کند
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiClient.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... بقیه توابع

  return { userProfile, loading, /* ... */ };
}
```

#### `src/hooks/useBehaviorTracking.ts`:
```typescript
// قبل:
import { supabase } from '@/integrations/supabase/client';

await supabase.from('user_interactions').insert({
  user_id: user.id,
  interaction_type: type,
  section,
  details,
});

// بعد:
import { apiClient } from '@/lib/api-client';

await apiClient.trackInteraction({
  interaction_type: type,
  section,
  details,
});
```

---

## 🤖 مرحله 6: جایگزینی Edge Functions

### فانکشن AI Assistant فعلی:
```typescript
// supabase/functions/ai-assistant/index.ts
// این فایل حذف می‌شود
```

### API Endpoint معادل در Django:
```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import openai  # یا google.generativeai برای Gemini

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    message = request.data.get('message')
    context = request.data.get('context', {})
    
    # ساخت system prompt
    system_prompt = build_system_prompt(context)
    
    # فراخوانی AI (مثال با OpenAI)
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
    )
    
    ai_response = response.choices[0].message.content
    
    # ذخیره در دیتابیس
    AIConversation.objects.create(
        user=request.user,
        question=message,
        response=ai_response,
        context=context,
    )
    
    return Response({'response': ai_response})

def build_system_prompt(context):
    skill_level = context.get('skillLevel', 'beginner')
    tone = context.get('tone', 'friendly')
    
    prompt = 'You are a helpful cryptocurrency trading assistant. '
    
    if tone == 'casual':
        prompt += 'Be friendly and use emojis. '
    
    if skill_level == 'beginner':
        prompt += 'Explain concepts simply without jargon. '
    
    return prompt
```

### بروزرسانی فرانت‌اند:
```typescript
// src/components/EnhancedAIAssistant.tsx
// قبل:
const response = await supabase.functions.invoke('ai-assistant', {
  body: { message, context },
});

// بعد:
const response = await apiClient.sendAIMessage(message, context);
```

---

## 📋 چک‌لیست مهاجرت کامل

- [ ] 1. تمام Models Django ایجاد شده‌اند
- [ ] 2. سیستم احراز هویت JWT پیاده‌سازی شده
- [ ] 3. CORS به درستی تنظیم شده
- [ ] 4. کلاینت API جدید (`api-client.ts`) ساخته شده
- [ ] 5. همه فراخوانی‌های `supabase` جایگزین شده‌اند
- [ ] 6. Edge Functions به API endpoints تبدیل شده‌اند
- [ ] 7. پکیج `@supabase/supabase-js` حذف شده
- [ ] 8. فولدر `supabase/` و `src/integrations/supabase/` حذف شده‌اند
- [ ] 9. متغیرهای محیطی بروز شده‌اند
- [ ] 10. تست کامل (signup, login, profile, interactions, AI chat)

---

## 🧪 تست پس از مهاجرت

### 1. تست احراز هویت:
```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234!"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234!"}'

# Get User (با توکن)
curl -X GET http://localhost:8000/api/auth/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. تست پروفایل:
```bash
curl -X GET http://localhost:8000/api/profiles/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. تست AI Chat:
```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Bitcoin?", "context": {}}'
```

---

## 🚀 دیپلوی بک‌اند پایتون

### گزینه 1: Heroku
```bash
# نصب Heroku CLI
# ایجاد Procfile
echo "web: gunicorn yourproject.wsgi" > Procfile

# دیپلوی
heroku create
git push heroku main
```

### گزینه 2: Railway
```bash
# نصب Railway CLI
railway login
railway init
railway up
```

### گزینه 3: AWS EC2
```bash
# SSH به سرور
ssh ubuntu@your-ec2-ip

# نصب وابستگی‌ها
sudo apt update
sudo apt install python3-pip nginx

# نصب پروژه
git clone your-repo
cd your-project
pip3 install -r requirements.txt

# تنظیم Nginx و Gunicorn
# (راهنمای کامل در مستندات Django)
```

---

## 🔒 نکات امنیتی

1. **SECRET_KEY**: حتماً در پروداکشن SECRET_KEY قوی استفاده کنید
```python
# settings.py
import os
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
```

2. **HTTPS**: همیشه در پروداکشن از HTTPS استفاده کنید

3. **Rate Limiting**: برای جلوگیری از حملات:
```python
# نصب django-ratelimit
pip install django-ratelimit

# استفاده
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m')
@api_view(['POST'])
def login(request):
    # ...
```

4. **Environment Variables**: هرگز secret keys را در کد commit نکنید
```bash
# .env
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://...
ALLOWED_HOSTS=yourdomain.com
```

---

## 📞 پشتیبانی

اگر در هر مرحله‌ای به مشکل خوردید:
1. مستندات Django REST Framework: https://www.django-rest-framework.org/
2. مستندات JWT: https://django-rest-framework-simplejwt.readthedocs.io/
3. React + Django integration: https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react

---

**موفق باشید! 🚀**
