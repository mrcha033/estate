import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set development mode to avoid AWS Secrets Manager calls in tests
process.env.NODE_ENV = 'development';

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
}

// Set default secrets for testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.AWS_SES_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID || 'test-ses-key';
process.env.AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY || 'test-ses-secret';
process.env.SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY || 'test-segment-key';