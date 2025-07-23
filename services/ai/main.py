import os
import sentry_sdk
from celery import Celery
from celery.schedules import crontab
from prometheus_client import start_http_server

sentry_dsn = os.environ.get("SENTRY_DSN")
if sentry_dsn and sentry_dsn not in ["aHR0cHM6Ly9leGFtcGxlQHNlbnRyeS5pbw==", "https://example@sentry.io"]:  # Skip placeholders
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

broker_url = os.environ.get("CELERY_BROKER", "redis://localhost:6379/0")
app = Celery('ai_service', broker=broker_url, backend=broker_url)

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

# Health check endpoints
from flask import Flask, jsonify

flask_app = Flask(__name__)

@flask_app.route('/health')
def health():
    return jsonify({"status": "healthy"})

@flask_app.route('/ready')
def ready():
    try:
        # Simple check that we can connect to redis
        from celery import current_app
        current_app.control.inspect().stats()
        return jsonify({"status": "ready"})
    except:
        return jsonify({"status": "not ready"}), 503

# Start up the server to expose the metrics.
start_http_server(8001)

@app.task
def analyze_data(data):
    print(f"Analyzing data: {data}")
    return f"Analyzed: {data}"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "web":
        flask_app.run(host='0.0.0.0', port=8000)
    else:
        # Default to worker mode
        app.worker_main()