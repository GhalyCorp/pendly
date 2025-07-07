const { execSync } = require('child_process');

try {
  console.log('Adding all changes...');
  execSync('git add .', { stdio: 'inherit' });
  
  console.log('Committing changes...');
  execSync('git commit -m "Fix TypeScript build errors and React Hook dependencies"', { stdio: 'inherit' });
  
  console.log('Pushing to origin...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ Changes committed and pushed successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 