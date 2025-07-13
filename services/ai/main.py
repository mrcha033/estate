import sentry_sdk
from celery import Celery
from celery.schedules import crontab
from prometheus_client import start_http_server

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

app = Celery('ai_service', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

# Configure Celery Beat for periodic tasks
app.conf.beat_schedule = {
    'generate-weekly-report': {
        'task': 'services.ai.tasks.generate_weekly_report',
        'schedule': crontab(day_of_week='monday', hour=9, minute=0), # Run every Monday at 9:00 AM
    },
    'generate-monthly-report': {
        'task': 'services.ai.tasks.generate_monthly_report',
        'schedule': crontab(day_of_month='1', hour=10, minute=0), # Run on the 1st of every month at 10:00 AM
    },
}
app.conf.timezone = 'UTC'

# Start up the server to expose the metrics.
start_http_server(8001)

@app.task
def analyze_data(data):
    print(f"Analyzing data: {data}")
    return f"Analyzed: {data}"