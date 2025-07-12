from celery import Celery
from celery.schedules import crontab

app = Celery('etl_service', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

# Configure Celery Beat for periodic tasks
app.conf.beat_schedule = {
    'run-daily-etl': {
        'task': 'services.etl.tasks.fetch_data_from_api',
        'schedule': crontab(hour=0, minute=0), # Run daily at midnight
        'args': ('http://example.com/api/data',)
    },
}
app.conf.timezone = 'UTC'

@app.task
def process_data(data):
    print(f"Processing data: {data}")
    return f"Processed: {data}"