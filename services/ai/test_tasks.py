import pytest
from services.ai.tasks import generate_weekly_report, s3_client
from sqlalchemy import create_engine, text

# Mock os.environ for testing purposes
import os
os.environ["S3_BUCKET_NAME"] = "test-bucket"
os.environ["DATABASE_URL"] = "sqlite:///:memory:" # Use in-memory SQLite for testing
os.environ["AWS_ACCESS_KEY_ID"] = "test"
os.environ["AWS_SECRET_ACCESS_KEY"] = "test"
os.environ["AWS_REGION"] = "us-east-1"
os.environ["OPENAI_API_KEY"] = "test"

# Mock openai client
from unittest.mock import MagicMock, patch

# Mock s3_client directly at the module level
s3_client.put_object = MagicMock(return_value={})

@pytest.fixture(autouse=True)
def mock_all_clients():
    with patch('openai.chat.completions.create') as mock_openai_create:
        mock_openai_create.return_value.choices = [MagicMock(message=MagicMock(content="Mocked summary"))]
        with patch('sqlalchemy.create_engine') as mock_create_engine:
            # Configure the mocked engine
            mock_engine_instance = MagicMock()
            mock_engine_instance.connect.return_value.__enter__.return_value.execute.return_value = MagicMock(fetchall=MagicMock(return_value=[]))
            mock_engine_instance.connect.return_value.__enter__.return_value.commit.return_value = None
            mock_create_engine.return_value = mock_engine_instance
            yield

def test_generate_weekly_report_success():
    result = generate_weekly_report()
    assert result["message"] == "Weekly report generation initiated"
    assert "report_metadata" in result
    assert result["report_metadata"]["summary"] == "Mocked summary"
