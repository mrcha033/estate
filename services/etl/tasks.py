from celery import shared_task
from sqlalchemy import create_engine, text
import logging
import hashlib
import json
import sentry_sdk
import os
from prometheus_client import Counter
import boto3

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

# Prometheus Metrics
etl_tasks_processed = Counter('etl_tasks_processed_total', 'Total number of ETL tasks processed', ['task_name', 'status'])

# Configure main logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configure a dedicated logger for ETL alerts
etl_alert_logger = logging.getLogger('etl_alerts')
etl_alert_logger.setLevel(logging.ERROR)
alert_handler = logging.FileHandler('etl_alerts.log')
alert_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
alert_handler.setFormatter(alert_formatter)
etl_alert_logger.addHandler(alert_handler)

@shared_task(bind=True, max_retries=3, default_retry_delay=300) # Retry after 5 minutes
def fetch_data_from_api(self, api_url):
    try:
        # Placeholder for data fetching logic
        logging.info(f"Fetching data from: {api_url}")
        # In a real scenario, this would make an API call and return data
        # For demonstration, simulate a potential failure
        if api_url == "http://fail.example.com":
            raise ConnectionError("Simulated API connection error")
        etl_tasks_processed.labels('fetch_data_from_api', 'success').inc()
        return {"message": f"Data fetched from {api_url}", "data": []}
    except ConnectionError as e:
        logging.error(f"Connection error fetching data from {api_url}: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Connection error in fetch_data_from_api for {api_url}: {e}")
        etl_tasks_processed.labels('fetch_data_from_api', 'failure').inc()
        raise self.retry(exc=e)
    except Exception as e:
        logging.error(f"An unexpected error occurred during data fetching from {api_url}: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Unexpected error in fetch_data_from_api for {api_url}: {e}")
        etl_tasks_processed.labels('fetch_data_from_api', 'failure').inc()
        raise self.retry(exc=e)

@shared_task
def normalize_data(raw_data):
    try:
        # Placeholder for data normalization logic
        logging.info(f"Normalizing data: {raw_data}")
        # In a real scenario, this would normalize fields like address, complex, size, price, deed date
        etl_tasks_processed.labels('normalize_data', 'success').inc()
        return {"message": f"Data normalized: {raw_data}", "normalized_data": raw_data}
    except Exception as e:
        logging.error(f"An error occurred during data normalization: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during data normalization: {e}")
        etl_tasks_processed.labels('normalize_data', 'failure').inc()
        raise

@shared_task
def deduplicate_records(normalized_data):
    try:
        # Placeholder for deduplication logic
        logging.info(f"Deduplicating data: {normalized_data}")
        # In a real scenario, this would use hash keys and windowing logic for deduplication
        etl_tasks_processed.labels('deduplicate_records', 'success').inc()
        return {"message": f"Data deduplicated: {normalized_data}", "deduplicated_data": normalized_data}
    except Exception as e:
        logging.error(f"An error occurred during data deduplication: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during data deduplication: {e}")
        etl_tasks_processed.labels('deduplicate_records', 'failure').inc()
        raise

@shared_task
def store_data_in_postgresql(deduplicated_data):
    try:
        # Placeholder for storing data in PostgreSQL
        logging.info(f"Storing data in PostgreSQL: {deduplicated_data}")
        # In a real scenario, this would connect to PostgreSQL and insert data
        # Example using SQLAlchemy (replace with actual connection string and table)
        # engine = create_engine('postgresql://user:password@host:port/database')
        # with engine.connect() as connection:
        #     connection.execute(text("INSERT INTO your_table (data) VALUES (:data)"), data=deduplicated_data)
        etl_tasks_processed.labels('store_data_in_postgresql', 'success').inc()
        return {"message": f"Data stored in PostgreSQL: {deduplicated_data}"}
    except Exception as e:
        logging.error(f"An error occurred during data storage in PostgreSQL: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during data storage in PostgreSQL: {e}")
        etl_tasks_processed.labels('store_data_in_postgresql', 'failure').inc()
        raise

@shared_task
def add_checksum_and_audit_log(data):
    try:
        # Calculate checksum
        data_str = json.dumps(data, sort_keys=True)
        checksum = hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        logging.info(f"Calculated checksum: {checksum} for data: {data}")

        # Placeholder for audit logging
        audit_log_entry = {
            "timestamp": "", # Add actual timestamp
            "event": "data_processed",
            "data_checksum": checksum,
            "data_summary": str(data)[:100], # Log a summary or hash of data
            "user": "system", # Or actual user if applicable
            "status": "success"
        }
        logging.info(f"Audit log entry: {audit_log_entry}")
        etl_tasks_processed.labels('add_checksum_and_audit_log', 'success').inc()
        return {"message": "Checksum calculated and audit log entry created", "checksum": checksum, "audit_log": audit_log_entry}
    except Exception as e:
        logging.error(f"An error occurred during checksum calculation or audit logging: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during checksum calculation or audit logging: {e}")
        etl_tasks_processed.labels('add_checksum_and_audit_log', 'failure').inc()
        raise

@shared_task
def send_daily_etl_summary_email():
    log_file_path = 'etl_alerts.log'
    summary = "Daily ETL Log Summary:\n\n"
    if os.path.exists(log_file_path):
        with open(log_file_path, 'r') as f:
            lines = f.readlines()
            if not lines:
                summary += "No errors logged today."
            else:
                summary += "Errors logged today:\n"
                for line in lines:
                    summary += f"- {line.strip()}\n"
        # Clear the log file after reading
        open(log_file_path, 'w').close()
    else:
        summary += "ETL alert log file not found."

    # In a real scenario, you would send this summary via email or Slack.
    # For now, we'll just log it.
    logging.info(summary)
    # TODO: Call backend endpoint to send email
    etl_tasks_processed.labels('send_daily_etl_summary_email', 'success').inc()
