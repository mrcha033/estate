import boto3
import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class SecretsManager:
    def __init__(self):
        self.region = os.environ.get('AWS_REGION', 'ap-northeast-2')
        self.client = boto3.client('secretsmanager', region_name=self.region)
        self._secrets_cache: Dict[str, str] = {}
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        """Retrieve a secret from AWS Secrets Manager with caching."""
        if secret_name in self._secrets_cache:
            return self._secrets_cache[secret_name]
        
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            secret_value = response.get('SecretString')
            if secret_value:
                self._secrets_cache[secret_name] = secret_value
                return secret_value
            else:
                logger.error(f"Secret {secret_name} is empty")
                return None
        except Exception as e:
            logger.error(f"Error retrieving secret {secret_name}: {e}")
            return None
    
    def get_database_url(self) -> Optional[str]:
        """Get database URL from secrets manager."""
        if os.environ.get('NODE_ENV') == 'production':
            return self.get_secret('estate/database/url')
        else:
            return os.environ.get('DATABASE_URL', 'postgresql://test:test@localhost:5432/test_db')
    
    def get_openai_api_key(self) -> Optional[str]:
        """Get OpenAI API key from secrets manager."""
        if os.environ.get('NODE_ENV') == 'production':
            return self.get_secret('estate/openai/api_key')
        else:
            return os.environ.get('OPENAI_API_KEY', 'test-key')

# Global instance
secrets_manager = SecretsManager()