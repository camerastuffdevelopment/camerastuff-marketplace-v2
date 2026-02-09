const { execSync } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isDatabaseSetup = !!process.env.DATABASE_URL;

if (isDatabaseSetup) {
  try {
    console.log('📊 Running database schema setup...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema is up to date!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    // Don't exit with error - the app can still start even if schema push fails
  }
} else {
  console.log('⏭️  Skipping database setup - DATABASE_URL not configured');
}
