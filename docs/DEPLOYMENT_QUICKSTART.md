# Deployment Quick Start

## TL;DR: Deploy Glass in 3 Steps

### Step 1: Deploy Web Dashboard (5 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd pickleglass_web
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_FIREBASE_*` (Firebase config)
- `STRIPE_SECRET_KEY` (Stripe secret)
- `FIREBASE_ADMIN_*` (Firebase admin)

### Step 2: Build Electron App

```bash
# Build for all platforms
npm run build

# This creates:
# - dist/glass-0.2.5-mac.dmg
# - dist/glass-0.2.5-mac.zip
# - dist/glass-0.2.5-win.exe
# - dist/glass-0.2.5-linux.AppImage
```

### Step 3: Publish to GitHub Releases

```bash
# Automatic (with electron-builder)
npm run publish

# Or manual:
# 1. Go to GitHub → Releases
# 2. Draft new release
# 3. Upload dist/* files
```

**Done! 🎉**

Your app is now deployed:
- Web: `https://your-project.vercel.app`
- Desktop: Download from GitHub Releases
- Updates: Automatic via electron-updater

---

## Full Deployment Guide

For detailed instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete guide
- [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) - Infrastructure setup

## Environment Variables Needed

### Required (add to Vercel)

```bash
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxxxx
FIREBASE_ADMIN_PRIVATE_KEY=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# URLs
NEXT_PUBLIC_URL=https://glass.pickle.com
UPDATE_SERVER_URL=https://glass.pickle.com
pickleglass_API_URL=https://glass.pickle.com

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
```

## Quick Commands

```bash
# Deploy web
./deploy.sh

# Build Electron
npm run build

# Publish to GitHub
npm run publish

# Check status
vercel ls
```

## Troubleshooting

**Build fails?**
```bash
cd pickleglass_web
npm run build
```

**Can't deploy?**
```bash
vercel --debug
```

**Environment variables missing?**
```bash
vercel env ls
vercel env add VARIABLE_NAME production
```

## Support

Need help? Check:
- Full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Firebase: https://firebase.google.com/docs
- Vercel: https://vercel.com/docs

