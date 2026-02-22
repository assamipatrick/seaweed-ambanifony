#!/bin/bash
# SEAFARM MONITOR - Quick Deployment Script
# Use this script to deploy the optimized build to Firebase Hosting

set -e

echo "🚀 SEAFARM MONITOR - Deployment Script"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1/4: Installing dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}🔨 Step 2/4: Building optimized production bundle...${NC}"
npm run build

echo ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "📊 Build output:"
ls -lh dist/assets/*.{js,css} 2>/dev/null | awk '{print "  " $9 " : " $5}'

echo ""
echo -e "${YELLOW}🌐 Step 3/4: Preparing Firebase deployment...${NC}"

# Check if firebase-tools is available
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found globally. Using npx..."
    FIREBASE_CMD="npx firebase-tools"
else
    FIREBASE_CMD="firebase"
fi

echo ""
echo -e "${YELLOW}🔐 Step 4/4: Deploying to Firebase Hosting...${NC}"
echo ""
echo "Note: You will be prompted to login if not already authenticated."
echo ""

# Login check
$FIREBASE_CMD login:list 2>&1 | grep -q "No users signed in" && {
    echo "Please login to Firebase:"
    $FIREBASE_CMD login
}

# Deploy
echo ""
echo "Deploying to Firebase Hosting..."
$FIREBASE_CMD deploy --only hosting

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "🔗 Your app should now be available at:"
echo "   https://seafarm-mntr.web.app"
echo "   https://seafarm-mntr.firebaseapp.com"
echo ""
echo "📝 Next steps:"
echo "   1. Visit the URL above"
echo "   2. Open DevTools (F12) and check the Console"
echo "   3. Verify no ApiError appears (only Gemini warning is OK)"
echo "   4. Test the CRUD operations (Settings → Types d'algues)"
echo "   5. Refresh the page to verify data persistence"
echo ""
echo "🎉 Happy coding!"
