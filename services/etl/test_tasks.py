import pytest
import os

# Set environment to development mode to avoid AWS Secrets Manager calls
os.environ["NODE_ENV"] = "development"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["KREB_API_KEY"] = "test"

from tasks import fetch_data_from_api

def test_fetch_data_from_api_success():
    result = fetch_data_from_api("http://example.com/api/data")
    assert result["message"] == "Data fetched from http://example.com/api/data"
    assert result["data"] == []

def test_fetch_data_from_api_failure():
    with pytest.raises(Exception) as excinfo:
        fetch_data_from_api("http://fail.example.com")
    assert "Simulated API connection error" in str(excinfo.value)
