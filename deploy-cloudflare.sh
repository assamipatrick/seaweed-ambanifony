#!/bin/bash
set -e

echo "🚀 Déploiement manuel sur Cloudflare Pages..."
echo ""

# Rebuild pour être sûr
echo "📦 Building optimized bundle..."
npm run build

echo ""
echo "✅ Build terminé !"
echo ""
echo "📊 Tailles des bundles :"
ls -lh dist/assets/*.js | awk '{print "  " $9 " : " $5}'
ls -lh dist/assets/*.css | awk '{print "  " $9 " : " $5}'

echo ""
echo "🌐 Déploiement vers Cloudflare Pages..."
echo ""

# Deploy avec npx wrangler
npx wrangler pages deploy dist \
  --project-name=seaweed-ambanifony \
  --branch=genspark_ai_developer \
  --commit-message="Manual optimized deployment - Bundle reduced 23.5%" \
  --commit-hash="9f7ae980"

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🔗 URL : https://seaweed-ambanifony.pages.dev"
echo ""
