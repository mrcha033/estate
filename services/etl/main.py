import os
import sentry_sdk
from celery import Celery
from celery.schedules import crontab

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
    'run-daily-etl': {
        'task': 'services.etl.tasks.fetch_data_from_api',
        'schedule': crontab(hour=0, minute=0), # Run daily at midnight
        'args': ('http://example.com/api/data',)
    },
    'send-daily-etl-summary': {
        'task': 'services.etl.tasks.send_daily_etl_summary_email',
        'schedule': crontab(hour=1, minute=0), # Run daily at 1 AM, after ETL
    },
}
app.conf.timezone = 'UTC'

@app.task
def process_data(data):
    print(f"Processing data: {data}")
    return f"Processed: {data}"