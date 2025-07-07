Write-Host "Adding all changes..." -ForegroundColor Green
git add .

Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Fix TypeScript build errors and React Hook dependencies"

Write-Host "Pushing to origin..." -ForegroundColor Green
git push origin main

Write-Host "✅ Changes committed and pushed successfully!" -ForegroundColor Green
Read-Host "Press Enter to continue" 