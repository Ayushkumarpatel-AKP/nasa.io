# 🔧 Email Verification Link Fix

## ❌ Problem
Email verification links are pointing to `localhost:5173` instead of `https://nasa-io.vercel.app`

```
❌ WRONG: http://localhost:5173/login?mode=verifyEmail&oobCode=...
✅ RIGHT: https://nasa-io.vercel.app/login?mode=verifyEmail&oobCode=...
```

## ✅ Solution

### Step 1: Update Vercel Environment Variables

**Go to:** https://vercel.com/dashboard → Select `nasa.io` project → Settings → Environment Variables

**Add/Update:**
```
VITE_APP_URL = https://nasa-io.vercel.app
```

**Then:** Redeploy the project

---

### Step 2: Configure Firebase Console

**Go to:** https://console.firebase.google.com → Your Project → Authentication → Settings

**Under "Authorized domains" add:**
- ✅ `localhost` (for local dev)
- ✅ `localhost:5173` (for local dev with custom port)
- ✅ `nasa-io.vercel.app` (your deployed domain)

**Screenshot:**
```
Authorized domains
├─ localhost
├─ localhost:5173
└─ nasa-io.vercel.app ← ADD THIS
```

---

### Step 3: Clear Browser Cache

On your deployed site:
1. Open DevTools (F12)
2. Settings → Storage → Clear site data
3. Refresh page
4. Try signup again

---

## 📋 What This Does

**Before Fix:**
```
1. User signs up
2. Email verification is sent with Firebase's default logic
3. Link points to: http://localhost:5173/login
4. User clicks link → Doesn't work (wrong domain)
```

**After Fix:**
```
1. User signs up
2. Email verification link sent with configured domain
3. Link points to: https://nasa-io.vercel.app/login
4. User clicks link → Works perfectly ✅
```

---

## 🚀 Deployment Instructions

### For You (Developer):

```bash
# 1. Ensure .env.local has localhost URL for development
VITE_APP_URL=http://localhost:5173

# 2. Vercel needs production URL (set via dashboard)
# Don't commit .env.local with prod URL
```

### For Vercel (Production):

1. **Vercel Dashboard** → Project → Settings → Environment Variables
2. Add: `VITE_APP_URL=https://nasa-io.vercel.app`
3. Redeploy project
4. Wait for build to complete (1-2 minutes)

### For Firebase Console:

1. **Firebase Console** → Your Project → Authentication → Settings
2. Scroll to "Authorized domains"
3. Click "+ Add domain"
4. Enter: `nasa-io.vercel.app`
5. Save

---

## ✅ Verification Checklist

After following steps above:

- [ ] VITE_APP_URL set in Vercel env vars
- [ ] nasa-io.vercel.app added to Firebase authorized domains
- [ ] Project redeployed on Vercel
- [ ] Browser cache cleared
- [ ] Try signup again → Should receive email with correct link
- [ ] Click email link → Should verify and redirect correctly

---

## 🔐 How It Works

**File:** `src/auth/AuthContext.tsx`

```typescript
// Detects if running locally or on production
const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Uses VITE_APP_URL if available, falls back to current origin
const configuredAppUrl = import.meta.env.VITE_APP_URL || "";
const appUrl = (isLocalHost ? window.location.origin : configuredAppUrl || window.location.origin);

// Passes to Firebase for email generation
const verificationActionSettings = {
  url: `${appUrl}/login`,  // ← This URL must be authorized in Firebase
  handleCodeInApp: false,
};
```

**Why it matters:**
- Firebase generates email links with the URL you provide
- The domain must be in Firebase's "Authorized domains" list
- VITE_APP_URL tells Firebase what domain to use in production

---

## 💡 For Future Reference

**Local Development:** Links use `http://localhost:5173` ✓  
**Production:** Links use `https://nasa-io.vercel.app` ✓

**Always ensure:**
1. Environment variable is set
2. Domain is authorized in Firebase
3. App is redeployed after env changes
