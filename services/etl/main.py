import os
import sentry_sdk
from celery import Celery
from celery.schedules import crontab
from prometheus_client import start_http_server
import boto3
import json

# Initialize Secrets Manager client
secrets_client = boto3.client('secretsmanager', region_name=os.environ.get("AWS_REGION"))

def get_secret(secret_name):
    try:
        response = secrets_client.get_secret_value(SecretId=secret_name)
        if 'SecretString' in response:
            return response['SecretString']
        else:
            return json.loads(response['SecretBinary'].decode('utf-8'))
    except Exception as e:
        print(f"Error retrieving secret {secret_name}: {e}")
        raise

# Load Sentry DSN from Secrets Manager
if os.environ.get("SENTRY_DSN_SECRET_NAME"):
    os.environ["SENTRY_DSN"] = get_secret(os.environ.get("SENTRY_DSN_SECRET_NAME"))

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    # Set traces_sample_rate to 1.0 to capture 100% 
    # of transactions for performance monitoring.
    traces_sample_rate=1.0,
    # Set profiles_sample_rate to 1.0 to profile every transaction. 
    # Set this to a lower number in production if you have a high volume of transactions.
    profiles_sample_rate=1.0,
)

app = Celery('etl_service', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

# Configure Celery Beat for periodic tasks
app.conf.beat_schedule = {
    'run-seoul-apartment-etl': {
        'task': 'services.etl.tasks.run_seoul_apartment_etl_pipeline',
        'schedule': crontab(hour=2, minute=0), # Run daily at 2 AM
    },
    'send-daily-etl-summary': {
        'task': 'services.etl.tasks.send_daily_etl_summary_email',
        'schedule': crontab(hour=3, minute=0), # Run daily at 3 AM, after ETL
    },
}
app.conf.timezone = 'UTC'

# Start up the server to expose the metrics.
start_http_server(8000)

@app.task
def process_data(data):
    print(f"Processing data: {data}")
    return f"Processed: {data}"