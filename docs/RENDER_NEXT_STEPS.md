# Next Steps After Choosing Web Service

## You're on the right track! ✅

Click **"New Web Service →"** to continue.

## What Happens Next

### Step 1: Connect Repository
1. Select "Public Git repository"
2. Choose your "glass" repository from GitHub
3. Click "Continue"

### Step 2: Configure Service

#### Name
```
glass-web
```

#### Region (choose closest to your users)
```
United States (Oregon)
```

#### Branch
```
main
```

#### Build Command
```bash
cd pickleglass_web && npm install && npm run build
```

#### Start Command
```bash
cd pickleglass_web && npm start
```

#### Instance Type
- **Free** for testing
- **Starter ($7/mo)** for production

#### Plan
```
Free (or Starter if you need always-on)
```

### Step 3: Add Environment Variables

Click "Add Environment Variable" for each:

#### Firebase (6 variables)
1. `NEXT_PUBLIC_FIREBASE_API_KEY` = xxxxx
2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = xxxxx
3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = xxxxx
4. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = xxxxx
5. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = xxxxx
6. `NEXT_PUBLIC_FIREBASE_APP_ID` = xxxxx

#### Firebase Admin (3 variables)
7. `FIREBASE_ADMIN_PROJECT_ID` = xxxxx
8. `FIREBASE_ADMIN_CLIENT_EMAIL` = xxxxx
9. `FIREBASE_ADMIN_PRIVATE_KEY` = xxxxx

#### Stripe (2 variables)
10. `STRIPE_SECRET_KEY` = sk_live_xxxxx
11. `STRIPE_WEBHOOK_SECRET` = whsec_xxxxx

#### PostHog (2 variables)
12. `NEXT_PUBLIC_POSTHOG_KEY` = phc_xxxxx
13. `NEXT_PUBLIC_POSTHOG_HOST` = https://app.posthog.com

#### URLs (3 variables)
14. `NEXT_PUBLIC_URL` = https://glass.onrender.com (will auto-generate)
15. `UPDATE_SERVER_URL` = https://glass.onrender.com (will auto-generate)
16. `pickleglass_API_URL` = https://glass.onrender.com (will auto-generate)

#### Node (2 variables)
17. `NODE_VERSION` = 18
18. `NODE_ENV` = production

### Step 4: Deploy

Click **"Create Web Service"**

Render will:
1. Clone your repository
2. Install dependencies (5-10 minutes)
3. Build Next.js app
4. Start the service
5. Generate SSL certificate
6. Make it live!

## After Deployment

### Your App Will Be Live At
```
https://glass.onrender.com
```
(or your custom domain if configured)

### Check Logs
In Render dashboard:
1. Click on "glass-web" service
2. Click "Logs" tab
3. Watch real-time logs

### Test Your Deployment

```bash
# Health check
curl https://glass.onrender.com

# Test API
curl https://glass.onrender.com/api/playbooks
```

## Troubleshooting

### Build Fails?
- Check logs in Render dashboard
- Verify Node version is 18
- Test locally: `cd pickleglass_web && npm run build`

### Environment Variables Not Working?
- Double-check all values are set correctly
- Redeploy after adding variables

### Slow First Request?
- Normal on free tier (cold start ~30 seconds)
- Upgrade to Starter plan ($7/mo) for always-on

## Next Steps After Deployment

1. ✅ Test web dashboard
2. ✅ Configure Stripe webhooks
3. ✅ Add custom domain (optional)
4. ✅ Build Electron app
5. ✅ Publish to GitHub

## Need Help?

- Full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- Quick start: [../RENDER_QUICKSTART.md](../RENDER_QUICKSTART.md)

