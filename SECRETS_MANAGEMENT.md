# AWS Secrets Manager Integration

This document describes the AWS Secrets Manager integration implemented to secure all application secrets and credentials.

## Overview

All production secrets are now stored in AWS Secrets Manager instead of being hardcoded in the application or stored as plain text in Kubernetes secrets. This provides:

- Centralized secret management
- Automatic rotation capabilities
- Fine-grained access control via IAM
- Audit logging for secret access
- Encryption at rest and in transit

## Architecture

### Terraform Infrastructure

The Secrets Manager resources are defined in `infrastructure/terraform/secrets-manager.tf`:

- **RDS Password**: `estate/rds/password`
- **JWT Secret**: `estate/jwt/secret`
- **AWS SES Credentials**: `estate/ses/access_key_id`, `estate/ses/secret_access_key`
- **Segment Write Key**: `estate/segment/write_key`
- **OpenAI API Key**: `estate/openai/api_key`
- **KREB API Key**: `estate/kreb/api_key`
- **Database URL**: `estate/database/url` (constructed from RDS instance details)

### IAM Permissions

The `estate-secrets-manager-access` IAM policy grants EKS services access to retrieve secrets. This policy is attached to the EKS node group role, allowing all pods to access secrets.

## Service Integration

### Backend Service (Node.js)

Location: `apps/backend/src/lib/secrets.ts`

The backend service uses the AWS SDK for JavaScript to retrieve secrets:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Secrets are loaded on application startup
await loadSecrets();

// Retrieved secrets are available via getSecrets()
const secrets = getSecrets();
```

**Environment-based behavior:**
- **Production**: Retrieves secrets from AWS Secrets Manager
- **Development**: Uses environment variables or defaults

### AI Service (Python)

Location: `services/ai/secrets_manager.py`

The AI service uses boto3 to retrieve secrets with caching:

```python
from services.ai.secrets_manager import secrets_manager

# Get database URL
database_url = secrets_manager.get_database_url()

# Get OpenAI API key  
openai_key = secrets_manager.get_openai_api_key()
```

### ETL Service (Python)

Location: `services/etl/secrets_manager.py`

Similar to the AI service, with additional KREB API key support:

```python
from services.etl.secrets_manager import secrets_manager

database_url = secrets_manager.get_database_url()
kreb_key = secrets_manager.get_kreb_api_key()
```

## Kubernetes Configuration

All Kubernetes deployments have been updated to:

1. Set `NODE_ENV=production` to enable secrets manager integration
2. Set `AWS_REGION=ap-northeast-2` for the secrets manager client
3. Remove hardcoded secret references (DATABASE_URL, API keys, etc.)
4. Keep only SENTRY_DSN as a Kubernetes secret (for error reporting)

Updated files:
- `k8s/ai-deployment.yaml`
- `k8s/ai-worker-deployment.yaml`
- `k8s/etl-deployment.yaml`
- `k8s/etl-cronjob.yaml`

## Security Benefits

1. **No Hardcoded Secrets**: All sensitive values removed from code and config files
2. **Least Privilege Access**: IAM policies restrict access to specific secrets
3. **Audit Trail**: All secret retrievals are logged in CloudTrail
4. **Encryption**: Secrets encrypted at rest using AWS KMS
5. **Rotation Ready**: Infrastructure supports automatic secret rotation

## Development Workflow

### Local Development

For local development, services fall back to environment variables:

```bash
# Set these in your .env file
DATABASE_URL=postgresql://user:password@localhost:5432/estate_db
JWT_SECRET=your-local-jwt-secret
OPENAI_API_KEY=your-openai-key
# etc...
```

### Testing

Test files use mock credentials:
- AI service: `services/ai/test_tasks.py`
- ETL service: `services/etl/test_tasks.py`
- Backend: `apps/backend/src/test-setup.ts`

## Deployment

### Prerequisites

1. Apply Terraform configuration:
   ```bash
   cd infrastructure/terraform
   terraform plan
   terraform apply
   ```

2. Populate secrets in AWS Secrets Manager (via AWS Console or CLI):
   ```bash
   aws secretsmanager put-secret-value --secret-id estate/jwt/secret --secret-string "your-jwt-secret"
   aws secretsmanager put-secret-value --secret-id estate/openai/api_key --secret-string "your-openai-key"
   # etc...
   ```

3. Deploy services:
   ```bash
   kubectl apply -f k8s/
   ```

### Verification

Check that services start successfully and can retrieve secrets:

```bash
# Check pod logs
kubectl logs -f deployment/estate-backend
kubectl logs -f deployment/estate-ai
kubectl logs -f deployment/estate-etl

# Look for "Secrets loaded successfully from AWS Secrets Manager"
```

## Troubleshooting

### Common Issues

1. **"Secrets not loaded" error**
   - Ensure `NODE_ENV=production` is set
   - Verify IAM permissions
   - Check AWS region configuration

2. **"Secret not found" error**
   - Verify secret exists in AWS Secrets Manager
   - Check secret name matches code expectations
   - Ensure proper IAM permissions

3. **"Access denied" error**
   - Verify EKS node group has proper IAM role
   - Check `estate-secrets-manager-access` policy attachment
   - Ensure secret ARNs are correct in IAM policy

### Debugging

Enable debug logging to troubleshoot secret retrieval:

```typescript
// Backend (add to secrets.ts)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AWS_REGION:', process.env.AWS_REGION);
```

```python
# Python services (add to secrets_manager.py)
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Migration from Hardcoded Secrets

This implementation replaces the following hardcoded values:

- `supersecretjwtkey` → AWS Secrets Manager
- `postgresql://user:password@localhost:5432/mydb` → AWS Secrets Manager
- Hardcoded API keys → AWS Secrets Manager
- Kubernetes secrets (except SENTRY_DSN) → AWS Secrets Manager

All development fallbacks remain functional for local testing.

## Future Enhancements

1. **Automatic Rotation**: Configure automatic rotation for database passwords
2. **Cross-Region Replication**: Replicate secrets to additional regions for DR
3. **Secret Versioning**: Implement blue/green deployments with secret versions
4. **Monitoring**: Add CloudWatch alerts for secret access failures