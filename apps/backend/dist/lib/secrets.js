"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSecrets = loadSecrets;
exports.getSecrets = getSecrets;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
let appSecrets = {};
let secretsLoaded = false;
const secretsManagerClient = new client_secrets_manager_1.SecretsManagerClient({ region: process.env.AWS_REGION });
async function getSecret(secretName) {
    try {
        const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: secretName });
        const data = await secretsManagerClient.send(command);
        if ('SecretString' in data && data.SecretString) {
            return data.SecretString;
        }
        else if (data.SecretBinary) {
            return Buffer.from(data.SecretBinary).toString('ascii');
        }
        throw new Error('Secret not found or empty');
    }
    catch (error) {
        console.error(`Error fetching secret ${secretName}:`, error);
        throw error;
    }
}
async function loadSecrets() {
    if (secretsLoaded) {
        return;
    }
    if (process.env.NODE_ENV === 'production') {
        try {
            appSecrets.DATABASE_URL = await getSecret('DATABASE_URL'); // Replace with your actual secret name
            appSecrets.JWT_SECRET = await getSecret('JWT_SECRET'); // Replace with your actual secret name
            appSecrets.AWS_SES_ACCESS_KEY_ID = await getSecret('AWS_SES_ACCESS_KEY_ID'); // Replace with your actual secret name
            appSecrets.AWS_SES_SECRET_ACCESS_KEY = await getSecret('AWS_SES_SECRET_ACCESS_KEY'); // Replace with your actual secret name
            appSecrets.SEGMENT_WRITE_KEY = await getSecret('SEGMENT_WRITE_KEY'); // Replace with your actual secret name
            secretsLoaded = true;
            console.log('Secrets loaded successfully from AWS Secrets Manager.');
        }
        catch (error) {
            console.error('Failed to load secrets from AWS Secrets Manager:', error);
            process.exit(1);
        }
    }
    else {
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
function getSecrets() {
    if (!secretsLoaded) {
        throw new Error('Secrets not loaded. Call loadSecrets() first.');
    }
    return appSecrets;
}
