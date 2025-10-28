# Deploy to Render - Quick Start

## 3-Step Deployment to Render

### Step 1: Connect Repository (2 minutes)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select "glass" repository
5. Click "Create Web Service"

### Step 2: Configure Settings (1 minute)

Render will auto-detect the setup. Just verify:

**Build Command:**
```bash
cd pickleglass_web && npm install && npm run build
```

**Start Command:**
```bash
cd pickleglass_web && npm start
```

**Node Version:** 18

### Step 3: Add Environment Variables (5 minutes)

Click "Environment" and add these variables:

```bash
# Copy from your .env file or Firebase dashboard

# Firebase Public Keys
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxxxx
FIREBASE_ADMIN_PRIVATE_KEY=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# URLs (update after deployment)
NEXT_PUBLIC_URL=https://glass.onrender.com
UPDATE_SERVER_URL=https://glass.onrender.com
pickleglass_API_URL=https://glass.onrender.com

# Node
NODE_VERSION=18
NODE_ENV=production
```

### Step 4: Deploy!

Click "Create Web Service" and wait for build (5-10 minutes).

✅ Done! Your app is live at `https://glass.onrender.com`

---

## Next Steps

### 1. Add Custom Domain (Optional)

```bash
# In Render: Settings → Custom Domains
# Add: glass.pickle.com
# Then update environment variables:
NEXT_PUBLIC_URL=https://glass.pickle.com
UPDATE_SERVER_URL=https://glass.pickle.com
pickleglass_API_URL=https://glass.pickle.com
```

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add: `https://glass.onrender.com/api/webhooks/stripe`
3. Copy signing secret
4. Add to Render: `STRIPE_WEBHOOK_SECRET`

### 3. Test Deployment

```bash
# Health check
curl https://glass.onrender.com

# Should return: 200 OK
```

## Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Verify Node version is 18
- Test locally: `cd pickleglass_web && npm run build`

**Environment variables not working?**
- Double-check all values are set
- Redeploy after adding variables

**Slow first request?**
- Normal on free tier (cold start)
- Upgrade to $7/mo for always-on

## See Also

- Full guide: [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)
- Render docs: https://render.com/docs

## Cost

- **Free tier**: $0/month (15min spin-down)
- **Starter**: $7/month (always on)
- **Recommended**: Starter for production

---

**Happy deploying! 🚀**

