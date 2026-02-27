#!/bin/bash
# Deploy Luma Vitae site to production
# Usage: ./deploy.sh

set -e

INFRA_DIR="$HOME/dev/infra"
SITE_DIR="$INFRA_DIR/sites/luma/public"

echo "==> Copying site files to infra..."
cp index.html "$SITE_DIR/"
cp logo-*.svg "$SITE_DIR/"

echo "==> Committing and pushing..."
cd "$INFRA_DIR"
git add sites/luma/public/
git commit -m "Update Luma Vitae site"
git push

echo "==> Deploying to server..."
./scripts/deploy-remote.sh

echo "==> Done! Site live at https://pilateslumavitae.com"
