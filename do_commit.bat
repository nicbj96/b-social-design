@echo off
cd /d C:\Users\45536\Desktop\b-social-pages
git add source/src/pages/OpretEvent.tsx source/src/pages/EventDetail.tsx source/src/lib/email.ts source/src/App.tsx source/src/components/DesktopAppLayout.tsx source/public/robots.txt source/public/sitemap.xml supabase/functions/send-email/index.ts
git commit -m "feat: user event creation, email notifications, SEO improvements"
git push origin main
echo DONE
