from celery import Celery
from celery.schedules import crontab

app = Celery('ai_service', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

# Configure Celery Beat for periodic tasks
app.conf.beat_schedule = {
    'generate-weekly-report': {
        'task': 'services.ai.tasks.generate_weekly_report',
        'schedule': crontab(day_of_week='monday', hour=0, minute=0), # Run every Monday at midnight
    },
}
app.conf.timezone = 'UTC'

@app.task
def analyze_data(data):
    print(f"Analyzing data: {data}")
    return f"Analyzed: {data}"