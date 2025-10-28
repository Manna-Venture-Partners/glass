#!/bin/bash

# Glass Deployment Script
# This script helps you deploy Glass to production

set -e

echo "🚀 Glass Deployment Script"
echo "=========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI found"
fi

# Navigate to web directory
cd pickleglass_web

echo ""
echo "📦 Building Next.js app..."
npm run build

echo ""
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "Visit: https://$(vercel ls | grep -o '[^ ]*.vercel.app' | head -1)"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Add custom domain"
echo "3. Test deployment"
echo "4. Build and publish Electron app"
echo ""
echo "See docs/DEPLOYMENT_GUIDE.md for full instructions"

