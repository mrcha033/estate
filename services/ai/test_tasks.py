import pytest
from unittest.mock import MagicMock, patch
import os

# Set environment to development mode to avoid AWS Secrets Manager calls
os.environ["NODE_ENV"] = "development"
os.environ["S3_BUCKET_NAME"] = "test-bucket"
os.environ["DATABASE_URL"] = "sqlite:///:memory:" # Use in-memory SQLite for testing
os.environ["AWS_ACCESS_KEY_ID"] = "test"
os.environ["AWS_SECRET_ACCESS_KEY"] = "test"
os.environ["AWS_REGION"] = "us-east-1"
os.environ["OPENAI_API_KEY"] = "test"

from services.ai.tasks import generate_weekly_report, s3_client

# Mock s3_client directly at the module level
s3_client.put_object = MagicMock(return_value={})

@pytest.fixture(autouse=True)
def mock_all_clients():
    with patch('openai.chat.completions.create') as mock_openai_create:
        mock_openai_create.return_value.choices = [MagicMock(message=MagicMock(content="Mocked summary"))]
        with patch('services.ai.tasks.engine') as mock_engine:
            # Configure the mocked engine connection
            mock_connection = MagicMock()
            mock_connection.execute.return_value.fetchall.return_value = []
            mock_connection.commit.return_value = None
            mock_engine.connect.return_value.__enter__.return_value = mock_connection
            mock_engine.connect.return_value.__exit__.return_value = None
            yield

def test_generate_weekly_report_success():
    result = generate_weekly_report()
    assert result["message"] == "Weekly report generation initiated"
    assert "report_metadata" in result
    assert result["report_metadata"]["summary"] == "Mocked summary"
