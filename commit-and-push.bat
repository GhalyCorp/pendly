@echo off
echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fix TypeScript build errors and React Hook dependencies"

echo Pushing to origin...
git push origin main

echo ✅ Changes committed and pushed successfully!
pause 