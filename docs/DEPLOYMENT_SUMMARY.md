# Deployment Summary for Glass

## What You're Deploying

Glass consists of:
1. **Next.js Web Dashboard** → Vercel (recommended)
2. **Electron Desktop App** → GitHub Releases
3. **Firebase Backend** → Already live
4. **Stripe Integration** → Webhook endpoint
5. **PostHog Analytics** → Already configured

## Quick Start (Choose One)

### Option 1: Vercel (Easiest) ✅

```bash
# 1. Deploy web dashboard
cd pickleglass_web
vercel --prod

# 2. Add environment variables in Vercel dashboard
# (See DEPLOYMENT_GUIDE.md for list)

# 3. Build Electron app
cd ..
npm run build

# 4. Publish to GitHub
npm run publish
```

**Time**: ~15 minutes  
**Cost**: Free tier available  
**Difficulty**: ⭐ Easy

### Option 2: Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

**Time**: ~20 minutes  
**Cost**: $5/mo  
**Difficulty**: ⭐⭐ Medium

### Option 3: Self-Hosted (AWS/DO)

```bash
# 1. Setup server (Ubuntu 20.04)
# 2. Install Node.js 20
# 3. Clone repo
# 4. Install PM2
npm install -g pm2

# 5. Deploy
cd pickleglass_web
npm run build
pm2 start npm --name "glass" -- start

# 6. Setup nginx reverse proxy
# 7. Configure SSL with Let's Encrypt
```

**Time**: ~1 hour  
**Cost**: $10-20/mo  
**Difficulty**: ⭐⭐⭐ Advanced

## Required Services

### ✅ Already Setup
- **Firebase** (Database, Auth, Storage)
- **PostHog** (Analytics)

### 🆕 Need to Configure
- **Vercel** (Web hosting)
- **GitHub Releases** (Desktop app distribution)
- **Stripe** (Payments)

## Environment Variables

### For Vercel

```bash
# Firebase (you should already have these)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxxxx
FIREBASE_ADMIN_PRIVATE_KEY=xxxxx
GOOGLE_APPLICATION_CREDENTIALS_JSON=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# URLs
NEXT_PUBLIC_URL=https://your-domain.com
UPDATE_SERVER_URL=https://your-domain.com
pickleglass_API_URL=https://your-domain.com
```

## Deployment Checklist

- [ ] Deploy Next.js to Vercel
- [ ] Add environment variables
- [ ] Test web dashboard
- [ ] Build Electron app
- [ ] Create GitHub release
- [ ] Upload desktop builds
- [ ] Configure Stripe webhooks
- [ ] Test checkout flow
- [ ] Test auto-updates
- [ ] Test authentication
- [ ] Monitor logs

## Testing Your Deployment

### 1. Web Dashboard
```bash
curl https://your-domain.com
# Should return 200 OK
```

### 2. API Health
```bash
curl https://your-domain.com/api/health
```

### 3. Stripe Webhooks
```bash
# Use Stripe CLI to test
stripe listen --forward-to https://your-domain.com/api/webhooks/stripe
```

### 4. Electron Updates
- Install old version
- Check for updates
- Verify new version downloads

## Cost Breakdown

### Free Tier (Personal/Small Scale)
- **Vercel**: Free (hobby)
- **Firebase**: Free tier (generous limits)
- **Stripe**: 2.9% + $0.30 per transaction
- **PostHog**: Free (1M events/month)
- **GitHub**: Free

**Total**: $0/month (just transaction fees)

### Production (Recommended)
- **Vercel Pro**: $20/mo
- **Firebase**: ~$25/mo (pay as you go)
- **Stripe**: 2.9% + $0.30 per transaction
- **PostHog**: $20/mo
- **Total**: ~$65/mo + transaction fees

### Scale (Enterprise)
- **Vercel Pro**: $20/mo
- **Firebase**: ~$100-500/mo
- **Stripe**: 2.9% + $0.30 per transaction
- **PostHog**: Custom pricing
- **Total**: ~$500-1000/mo + transaction fees

## Common Issues

### Issue: Build fails on Vercel

**Solution:**
```bash
# Check build logs
vercel logs

# Test locally
cd pickleglass_web
npm run build
```

### Issue: Environment variables not working

**Solution:**
```bash
# Check vars are set
vercel env ls

# Redeploy
vercel --prod
```

### Issue: Stripe webhooks not receiving events

**Solution:**
1. Check webhook endpoint URL in Stripe dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Test with Stripe CLI

### Issue: Electron updates not working

**Solution:**
1. Verify GitHub release exists
2. Check `UPDATE_SERVER_URL` environment variable
3. Test update endpoint: `curl https://your-domain.com/updates`

## Next Steps After Deployment

1. **Custom Domain**
   - Add in Vercel dashboard
   - Configure DNS
   - Wait for SSL (automatic)

2. **Code Signing** (Optional)
   - Get Apple Developer ID
   - Get Windows code signing cert
   - Add to build configuration

3. **Monitoring**
   - Setup Vercel analytics
   - Configure PostHog dashboards
   - Monitor Firebase usage

4. **Marketing**
   - Update download links
   - Share release announcement
   - Update documentation

## Support & Resources

- **Full Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Start**: [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
- **Vercel Docs**: https://vercel.com/docs
- **Electron Builder**: https://www.electron.build/
- **Firebase**: https://firebase.google.com/docs

## Success! 🎉

Once deployed, your app is:
- ✅ Live on the web
- ✅ Downloadable for desktop
- ✅ Auto-updating
- ✅ Tracked with analytics
- ✅ Processing payments

Happy deploying! 🚀

