#!/bin/bash

# 1. Fix potential nested git repository issue
echo "🔧 Fixing Git repository structure..."
git rm --cached frontend 2>/dev/null
rm -rf frontend/.git
git add .
git commit -m "Fix: Remove embedded frontend git and standardize repo" 2>/dev/null || echo "Nothing to commit"

# 2. Ensure main branch and remote
git branch -M main
git remote add origin git@github.com:aanandak15-maker/scheme_saathi.git 2>/dev/null || echo "Remote already exists"

# 3. Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

# 4. Deploy to Vercel
echo "▲ Deploying to Vercel..."
echo "NOTE: If you want to switch accounts, run 'npx vercel logout' first, then 'npx vercel login'."
npx vercel deploy --prod
