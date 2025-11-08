#!/bin/bash
# AutoPulse Website Deployment Script

echo "🚀 AutoPulse Website Deployment"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the website directory"
    echo "   Run: cd /home/rocketeers/vehicle_diagnostic_system/website"
    exit 1
fi

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    sudo npm install -g vercel
fi

echo "📦 Step 1: Building website locally to test..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Step 2: Deploying to Vercel..."
echo ""
echo "Follow the prompts:"
echo "  - Set up and deploy? → Y"
echo "  - Link to existing project? → N"
echo "  - Project name? → autopulse (or your choice)"
echo "  - Directory? → Press Enter"
echo "  - Override settings? → N"
echo ""
read -p "Press Enter to continue with deployment..."

vercel

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add environment variables:"
    echo "   vercel env add REACT_APP_SUPABASE_URL production"
    echo "   vercel env add REACT_APP_SUPABASE_ANON_KEY production"
    echo "   vercel env add REACT_APP_API_URL production"
    echo ""
    echo "2. Redeploy with environment variables:"
    echo "   vercel --prod"
    echo ""
    echo "3. Your website will be live! 🌐"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
