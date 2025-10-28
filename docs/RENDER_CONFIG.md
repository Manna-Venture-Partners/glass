# Render Configuration for Glass

## Required Changes

### 1. Root Directory ⚠️ IMPORTANT

**Current**: (empty)  
**Change to**: `pickleglass_web`

This tells Render where your Next.js app lives in the monorepo.

---

### 2. Build Command ⚠️ NEEDS UPDATE

**Current**: `$ npm install`  
**Change to**: 
```bash
cd pickleglass_web && npm install && npm run build
```

This installs dependencies and builds the Next.js app.

---

### 3. Start Command ⚠️ NEEDS UPDATE

**Current**: `$ node src/index.js`  
**Change to**:
```bash
cd pickleglass_web && npm start
```

This starts the Next.js production server.

---

### 4. Instance Type

**Recommended**: 
- **Free** for testing ($0/month) - may spin down after 15min
- **Starter** for production ($7/month) - always running

---

### 5. Environment Variables ⚠️ ADD THESE

Click "+ Add Environment Variable" and add all of these:

#### Firebase Public (6 variables)
```
NEXT_PUBLIC_FIREBASE_API_KEY = [your firebase api key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = [your auth domain]
NEXT_PUBLIC_FIREBASE_PROJECT_ID = [your project id]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = [your storage bucket]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = [your sender id]
NEXT_PUBLIC_FIREBASE_APP_ID = [your app id]
```

#### Firebase Admin (3 variables)
```
FIREBASE_ADMIN_PROJECT_ID = [same as NEXT_PUBLIC_FIREBASE_PROJECT_ID]
FIREBASE_ADMIN_CLIENT_EMAIL = firebase-adminsdk-xxxxx@xxxxx.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...
```

#### Stripe (2 variables)
```
STRIPE_SECRET_KEY = sk_live_xxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxx
```

#### PostHog (2 variables)
```
NEXT_PUBLIC_POSTHOG_KEY = phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com
```

#### Node Version (1 variable)
```
NODE_VERSION = 18
```

#### Environment (1 variable)
```
NODE_ENV = production
```

---

## After Configuration

### Click "Deploy Web Service"

Render will:
1. Clone your repo
2. Install dependencies (10-15 minutes)
3. Build Next.js app
4. Start the service
5. Generate SSL
6. Go live!

### Your App Will Be At

After deployment, you'll get a URL like:
```
https://glass.onrender.com
```

### Check Deployment

In Render dashboard:
1. Click on "glass" service
2. Go to "Logs" tab
3. Watch the build process

### Test After Deploy

```bash
curl https://glass.onrender.com
# Should return your Next.js app
```

---

## Quick Reference

### Where to Find Your Keys

**Firebase:**
- Firebase Console → Project Settings → General
- Copy all the config values

**Firebase Admin:**
- Firebase Console → Project Settings → Service Accounts
- Generate new private key

**Stripe:**
- Stripe Dashboard → Developers → API Keys
- Use live keys (not test)

**PostHog:**
- PostHog → Project Settings → API Keys

---

## Troubleshooting

**Build fails?**
- Check Root Directory is "pickleglass_web"
- Check Build Command has "npm run build"
- Check logs in Render dashboard

**Start command fails?**
- Should be: `cd pickleglass_web && npm start`
- Not: `node src/index.js`

**Environment variables not working?**
- Redeploy after adding variables
- Check names match exactly
- No extra spaces

