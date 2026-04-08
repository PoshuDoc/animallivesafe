# PashuDoc - Deployment Guide

## ধাপ ১: Supabase Database Setup

1. [Supabase](https://supabase.com) Dashboard-এ যাও
2. তোমার project খোলো: `eznxeqqlmcffeoaqqqct`
3. বাম মেনুতে **SQL Editor** ক্লিক করো
4. `supabase-setup.sql` ফাইলের সম্পূর্ণ content কপি করে paste করো
5. **Run** বাটন চাপো

সফল হলে এই result দেখাবে:
```
status              | মোট_ব্যবহারকারী | মোট_ডাক্তার | মোট_অ্যাপয়েন্টমেন্ট | মোট_রিভিউ | সাইট_কন্টেন্ট
সেটআপ সম্পন্ন!     | 9              | 5           | 5                    | 4         | 13
```

**Login তথ্য:**
| ভূমিকা   | ফোন নম্বর    | পাসওয়ার্ড |
|----------|-------------|-----------|
| অ্যাডমিন | 01700000000 | admin123  |
| ডাক্তার  | 01711111111 | doctor123 |
| কৃষক     | 01755555555 | farmer123 |

---

## ধাপ ২: Backend (API) Deploy — Railway

1. [Railway](https://railway.app) এ যাও ও account তৈরি করো
2. **New Project** → **Deploy from GitHub repo** → তোমার repo select করো
3. **Root Directory** সেট করো: `artifacts/api-server`
4. **Build Command**: `pnpm install && pnpm run build`
5. **Start Command**: `pnpm run start`
6. Environment Variables যোগ করো:
   - `DATABASE_URL` = Supabase connection string (pooler, port 6543)
   - `JWT_SECRET` = যেকোনো random long string (min 32 chars)
   - `NODE_ENV` = production
7. Deploy করো এবং URL নোট করো (e.g. `https://pashudoc-api.railway.app`)

---

## ধাপ ৩: Frontend Deploy — Vercel

1. [Vercel](https://vercel.com) এ যাও ও GitHub repo connect করো
2. **Framework Preset**: Vite
3. **Root Directory**: `artifacts/pashudoc`
4. **Build Command**: `pnpm install && pnpm run build`
5. **Output Directory**: `dist/public`
6. Environment Variables যোগ করো:
   - `VITE_API_URL` = Railway API URL (e.g. `https://pashudoc-api.railway.app`)
7. Deploy করো

---

## ধাপ ৪: Supabase-এ Pooler Connection String নাও

Railway-তে `DATABASE_URL` হিসেবে দেবে:
- Supabase Dashboard → Settings → Database
- **Connection Pooling** section → Mode: **Session**
- Port `6543` দিয়ে string টি কপি করো

```
postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```
