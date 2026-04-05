@echo off
echo ============================================
echo  B-Social: Deploy Edge Function (one-time)
echo ============================================
echo.
echo Step 1: Login to Supabase (opens browser)...
cd /d C:\Users\45536\Desktop\b-social-pages
npx supabase@2.84.10 login
echo.
echo Step 2: Set VAPID private key secret...
npx supabase@2.84.10 secrets set VAPID_PRIVATE_KEY=JCpwTfvrfM64B0XvLbZlS7AGqYCMBtrLtcXvjXJdqV0 --project-ref rbengtfrthqdfbcdcugp
echo.
echo Step 3: Deploy send-push-notifications function...
npx supabase@2.84.10 functions deploy send-push-notifications --project-ref rbengtfrthqdfbcdcugp --no-verify-jwt
echo.
echo Done! Future deploys happen automatically via GitHub Actions.
pause
