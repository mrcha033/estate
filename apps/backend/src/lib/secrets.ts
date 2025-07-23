import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

interface AppSecrets {
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  AWS_SES_ACCESS_KEY_ID?: string;
  AWS_SES_SECRET_ACCESS_KEY?: string;
  SEGMENT_WRITE_KEY?: string;
}

let appSecrets: AppSecrets = {};
let secretsLoaded = false;

const secretsManagerClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });

async function getSecret(secretName: string): Promise<string> {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await secretsManagerClient.send(command);
    if ('SecretString' in data && data.SecretString) {
      return data.SecretString;
    } else if (data.SecretBinary) {
      return Buffer.from(data.SecretBinary as Uint8Array).toString('ascii');
    }
    throw new Error('Secret not found or empty');
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw error;
  }
}

export async function loadSecrets(): Promise<void> {
  if (secretsLoaded) {
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    try {
      appSecrets.DATABASE_URL = await getSecret('estate/database/url');
      appSecrets.JWT_SECRET = await getSecret('estate/jwt/secret');
      appSecrets.AWS_SES_ACCESS_KEY_ID = await getSecret('estate/ses/access_key_id');
      appSecrets.AWS_SES_SECRET_ACCESS_KEY = await getSecret('estate/ses/secret_access_key');
      appSecrets.SEGMENT_WRITE_KEY = await getSecret('estate/segment/write_key');
      secretsLoaded = true;
      console.log('Secrets loaded successfully from AWS Secrets Manager.');
    } catch (error) {
      console.error('Failed to load secrets from AWS Secrets Manager:', error);
      process.exit(1);
    }
  } else {
    // For development, load from .env or use hardcoded defaults
    appSecrets.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydb';
    appSecrets.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
    appSecrets.AWS_SES_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID || 'mock_ses_access_key';
    appSecrets.AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY || 'mock_ses_secret_key';
    appSecrets.SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY || 'mock_segment_write_key';
    secretsLoaded = true;
    console.log('Secrets loaded from .env or defaults.');
  }
}

export function getSecrets(): AppSecrets {
  if (!secretsLoaded) {
    throw new Error('Secrets not loaded. Call loadSecrets() first.');
  }
  return appSecrets;
}
