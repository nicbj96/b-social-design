@echo off
cd /d C:\Users\45536\Desktop\b-social-pages
git add source/src/pages/Feed.tsx source/src/pages/Udforsk.tsx
git commit -m "fix: remove tag pill walls - tags are background logic not foreground UI"
git push origin main
echo DONE
