import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
}