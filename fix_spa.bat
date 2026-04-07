@echo off
cd /d C:\Users\45536\Desktop\b-social-pages
git add source/public/_worker.js
git commit -m "fix: SPA routing fallback in _worker.js"
git push origin main
echo DONE
