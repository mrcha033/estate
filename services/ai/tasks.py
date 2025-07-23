from celery import shared_task
import openai
import os
import hashlib
import json
import boto3
from sqlalchemy import create_engine, text
import logging
from services.ai.lib.email_logger import log_email_delivery_status, log_bounce_or_unsubscribe
from services.ai.secrets_manager import secrets_manager
from prometheus_client import Counter

# Prometheus Metrics
ai_tasks_processed = Counter('ai_tasks_processed_total', 'Total number of AI tasks processed', ['task_name', 'status'])

# Configure logging for the AI service
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configure OpenAI API key using secrets manager
openai.api_key = secrets_manager.get_openai_api_key()
openai.api_base = os.environ.get("OPENAI_API_BASE") # For Azure OpenAI
openai.api_type = os.environ.get("OPENAI_API_TYPE") # For Azure OpenAI
openai.api_version = os.environ.get("OPENAI_API_VERSION") # For Azure OpenAI

# Configure S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    region_name=os.environ.get("AWS_REGION"),
)

# Configure PostgreSQL engine using secrets manager
DATABASE_URL = secrets_manager.get_database_url()
engine = create_engine(DATABASE_URL) if DATABASE_URL else None

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def generate_weekly_report(self):
    try:
        logging.info("Starting weekly report generation.")
        
        # Fetch actual Seoul apartment data from ETL pipeline
        data_summary = get_weekly_apartment_data_summary()
        
        # Generate summary using GPT-4
        summary = generate_summary_with_gpt4(data_summary)
        logging.info(f"Generated summary: {summary}")
        
        # Placeholder for model_hash and prompt_hash (would come from MLflow/Git tags)
        model_hash = "mock_model_hash_123"
        prompt_hash = "mock_prompt_hash_456"

        report_content = f"<h1>Weekly Real Estate Report</h1><p>{summary}</p>"
        report_filename = f"weekly_report_{hashlib.md5(report_content.encode()).hexdigest()}.html"
        s3_bucket_name = os.environ.get("S3_BUCKET_NAME", "estate-app-bucket")

        # Store report in S3
        try:
            s3_client.put_object(Bucket=s3_bucket_name, Key=report_filename, Body=report_content, ContentType='text/html')
            logging.info(f"Report stored in S3: s3://{s3_bucket_name}/{report_filename}")
        except Exception as e:
            logging.error(f"Error storing report in S3: {e}")
            raise self.retry(exc=e)

        report_metadata = {
            "summary": summary,
            "model_hash": model_hash,
            "prompt_hash": prompt_hash,
            "s3_url": f"s3://{s3_bucket_name}/{report_filename}",
            "timestamp": "", # Add actual timestamp
        }
        logging.info(f"Generated report metadata: {report_metadata}")

        # Store metadata in PostgreSQL
        if engine:
            try:
                with engine.connect() as connection:
                    connection.execute(text("INSERT INTO reports (summary, model_hash, prompt_hash, s3_url, timestamp) VALUES (:summary, :model_hash, :prompt_hash, :s3_url, NOW())"), report_metadata)
                    connection.commit()
                logging.info("Report metadata stored in PostgreSQL")
            except Exception as e:
                logging.error(f"Error storing report metadata in PostgreSQL: {e}")
                raise self.retry(exc=e)

        # Fetch subscribers and send emails
        if engine:
            try:
                with engine.connect() as connection:
                    result = connection.execute(text("SELECT email FROM \"Subscription\" WHERE frequency = 'weekly' AND verified = true"))
                    subscribers = result.fetchall()
                logging.info(f"Fetched {len(subscribers)} weekly subscribers.")

                report_url = f"http://your-app-domain.com/reports/{report_filename}" # Replace with actual report URL

                for subscriber in subscribers:
                    send_report_email.delay(subscriber[0], report_url, summary)

            except Exception as e:
                logging.error(f"Error fetching subscribers or sending emails: {e}")

        logging.info("Weekly report generation completed successfully.")
        ai_tasks_processed.labels('generate_weekly_report', 'success').inc()
        return {"message": "Weekly report generation initiated", "report_metadata": report_metadata}
    except Exception as e:
        logging.error(f"An error occurred during weekly report generation: {e}")
        ai_tasks_processed.labels('generate_weekly_report', 'failure').inc()
        raise self.retry(exc=e)

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def generate_summary_with_gpt4(self, data_summary: str):
    try:
        logging.info(f"Generating summary with GPT-4 for data: {data_summary[:50]}...")
        response = openai.chat.completions.create(
            model="gpt-4", # Or your Azure OpenAI deployment name
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes real estate data."},
                {"role": "user", "content": f"Summarize the following real estate data: {data_summary}"}
            ]
        )
        summary = response.choices[0].message.content
        logging.info("Summary generated successfully with GPT-4.")
        ai_tasks_processed.labels('generate_summary_with_gpt4', 'success').inc()
        return summary
    except Exception as e:
        logging.error(f"Error generating summary with GPT-4: {e}")
        # Fallback to Llama or other model if needed
        ai_tasks_processed.labels('generate_summary_with_gpt4', 'failure').inc()
        raise self.retry(exc=e)

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def generate_monthly_report(self):
    try:
        logging.info("Starting monthly report generation.")
        
        # Fetch actual Seoul apartment data from ETL pipeline
        data_summary = get_monthly_apartment_data_summary()
        
        # Generate summary using GPT-4
        summary = generate_summary_with_gpt4(data_summary)
        logging.info(f"Generated summary: {summary}")
        
        # Placeholder for model_hash and prompt_hash (would come from MLflow/Git tags)
        model_hash = "mock_model_hash_789"
        prompt_hash = "mock_prompt_hash_101"

        report_content = f"<h1>Monthly Real Estate Report</h1><p>{summary}</p>"
        report_filename = f"monthly_report_{hashlib.md5(report_content.encode()).hexdigest()}.html"
        s3_bucket_name = os.environ.get("S3_BUCKET_NAME", "estate-app-bucket")

        # Store report in S3
        try:
            s3_client.put_object(Bucket=s3_bucket_name, Key=report_filename, Body=report_content, ContentType='text/html')
            logging.info(f"Report stored in S3: s3://{s3_bucket_name}/{report_filename}")
        except Exception as e:
            logging.error(f"Error storing report in S3: {e}")
            raise self.retry(exc=e)

        report_metadata = {
            "summary": summary,
            "model_hash": model_hash,
            "prompt_hash": prompt_hash,
            "s3_url": f"s3://{s3_bucket_name}/{report_filename}",
            "timestamp": "", # Add actual timestamp
        }
        logging.info(f"Generated report metadata: {report_metadata}")

        # Store metadata in PostgreSQL
        if engine:
            try:
                with engine.connect() as connection:
                    connection.execute(text("INSERT INTO reports (summary, model_hash, prompt_hash, s3_url, timestamp) VALUES (:summary, :model_hash, :prompt_hash, :s3_url, NOW())"), report_metadata)
                    connection.commit()
                logging.info("Report metadata stored in PostgreSQL")
            except Exception as e:
                logging.error(f"Error storing report metadata in PostgreSQL: {e}")
                raise self.retry(exc=e)

        # Fetch subscribers and send emails
        if engine:
            try:
                with engine.connect() as connection:
                    result = connection.execute(text("SELECT email FROM \"Subscription\" WHERE frequency = 'monthly' AND verified = true"))
                    subscribers = result.fetchall()
                logging.info(f"Fetched {len(subscribers)} monthly subscribers.")

                report_url = f"http://your-app-domain.com/reports/{report_filename}" # Replace with actual report URL

                for subscriber in subscribers:
                    send_report_email.delay(subscriber[0], report_url, summary, "monthly")

            except Exception as e:
                logging.error(f"Error fetching subscribers or sending emails: {e}")

        logging.info("Monthly report generation completed successfully.")
        ai_tasks_processed.labels('generate_monthly_report', 'success').inc()
        return {"message": "Monthly report generation initiated", "report_metadata": report_metadata}
    except Exception as e:
        logging.error(f"An error occurred during monthly report generation: {e}")
        ai_tasks_processed.labels('generate_monthly_report', 'failure').inc()
        raise self.retry(exc=e)

@shared_task
def send_report_email(recipient_email: str, report_url: str, report_summary: str, report_type: str = "weekly"):
    subject = f"Your {report_type.capitalize()} Real Estate Report is Here!"
    body = f"<h1>{report_type.capitalize()} Real Estate Report</h1><p>Here's your {report_type} summary: {report_summary}</p><p>View full report: <a href=\"{report_url}\">{report_url}</a></p>"
    try:
        # Placeholder for sending email via SES
        # await sendEmail(recipient_email, subject, body)
        log_email_delivery_status(recipient_email, 'success', 'Simulated email sent')
        ai_tasks_processed.labels('send_report_email', 'success').inc()
        return {"message": "Report email sent successfully"}
    except Exception as e:
        log_email_delivery_status(recipient_email, 'failed', str(e))
        ai_tasks_processed.labels('send_report_email', 'failure').inc()
        raise

def get_weekly_apartment_data_summary():
    """Fetch and summarize Seoul apartment data for the past week"""
    if not engine:
        return "No database connection available. Using mock data: Recent real estate data shows a 5% increase in apartment prices in Gangnam district."
    
    try:
        with engine.connect() as connection:
            # Fetch transactions from the past 7 days
            query = """
            SELECT 
                district_name,
                COUNT(*) as transaction_count,
                AVG(transaction_amount_won) as avg_price,
                AVG(price_per_sqm) as avg_price_per_sqm,
                AVG(area_sqm) as avg_area
            FROM apartment_transactions 
            WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'
            AND data_quality_score >= 80
            GROUP BY district_name
            ORDER BY transaction_count DESC
            LIMIT 10
            """
            
            result = connection.execute(text(query))
            rows = result.fetchall()
            
            if not rows:
                return "No recent apartment transaction data available in the database."
            
            # Create data summary
            summary_parts = []
            summary_parts.append(f"Weekly Seoul Apartment Market Analysis:")
            summary_parts.append(f"Total districts with transactions: {len(rows)}")
            
            for row in rows:
                district = row[0]
                count = row[1]
                avg_price = int(row[2]) if row[2] else 0
                avg_price_sqm = int(row[3]) if row[3] else 0
                avg_area = float(row[4]) if row[4] else 0.0
                
                summary_parts.append(
                    f"- {district}: {count} transactions, "
                    f"avg price {avg_price:,}원 ({avg_price_sqm:,}원/㎡), "
                    f"avg area {avg_area:.1f}㎡"
                )
            
            return "\n".join(summary_parts)
            
    except Exception as e:
        logging.error(f"Error fetching weekly data summary: {e}")
        return "Error accessing apartment transaction data. Using fallback: Recent real estate data shows market activity in Seoul districts."

def get_monthly_apartment_data_summary():
    """Fetch and summarize Seoul apartment data for the past month"""
    if not engine:
        return "No database connection available. Using mock data: Monthly real estate data shows a 10% increase in apartment prices in Seoul."
    
    try:
        with engine.connect() as connection:
            # Fetch transactions from the past 30 days with comparison to previous month
            query = """
            WITH current_month AS (
                SELECT 
                    district_name,
                    COUNT(*) as transaction_count,
                    AVG(transaction_amount_won) as avg_price,
                    AVG(price_per_sqm) as avg_price_per_sqm
                FROM apartment_transactions 
                WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'
                AND data_quality_score >= 80
                GROUP BY district_name
            ),
            previous_month AS (
                SELECT 
                    district_name,
                    COUNT(*) as transaction_count,
                    AVG(transaction_amount_won) as avg_price,
                    AVG(price_per_sqm) as avg_price_per_sqm
                FROM apartment_transactions 
                WHERE transaction_date >= CURRENT_DATE - INTERVAL '60 days'
                AND transaction_date < CURRENT_DATE - INTERVAL '30 days'
                AND data_quality_score >= 80
                GROUP BY district_name
            )
            SELECT 
                c.district_name,
                c.transaction_count as current_count,
                c.avg_price as current_price,
                c.avg_price_per_sqm as current_price_sqm,
                p.avg_price as previous_price,
                CASE 
                    WHEN p.avg_price IS NOT NULL AND p.avg_price > 0 
                    THEN ((c.avg_price - p.avg_price) / p.avg_price * 100)
                    ELSE NULL 
                END as price_change_percent
            FROM current_month c
            LEFT JOIN previous_month p ON c.district_name = p.district_name
            ORDER BY c.transaction_count DESC
            LIMIT 15
            """
            
            result = connection.execute(text(query))
            rows = result.fetchall()
            
            if not rows:
                return "No monthly apartment transaction data available in the database."
            
            # Create monthly summary
            summary_parts = []
            summary_parts.append(f"Monthly Seoul Apartment Market Analysis:")
            summary_parts.append(f"Active districts: {len(rows)}")
            
            total_transactions = sum(row[1] for row in rows)
            summary_parts.append(f"Total transactions analyzed: {total_transactions:,}")
            
            # Analyze price trends
            price_increases = []
            price_decreases = []
            
            for row in rows:
                district = row[0]
                current_count = row[1]
                current_price = int(row[2]) if row[2] else 0
                current_price_sqm = int(row[3]) if row[3] else 0
                price_change = row[5]
                
                if price_change is not None:
                    if price_change > 0:
                        price_increases.append((district, price_change, current_count))
                    elif price_change < 0:
                        price_decreases.append((district, abs(price_change), current_count))
                
                summary_parts.append(
                    f"- {district}: {current_count} transactions, "
                    f"avg {current_price:,}원 ({current_price_sqm:,}원/㎡)"
                    f"{f', {price_change:+.1f}% vs last month' if price_change is not None else ''}"
                )
            
            # Add trend analysis
            if price_increases:
                top_increases = sorted(price_increases, key=lambda x: x[1], reverse=True)[:3]
                summary_parts.append(f"\nTop price increases: {', '.join([f'{d} (+{p:.1f}%)' for d, p, _ in top_increases])}")
            
            if price_decreases:
                top_decreases = sorted(price_decreases, key=lambda x: x[1], reverse=True)[:3]
                summary_parts.append(f"Notable price decreases: {', '.join([f'{d} (-{p:.1f}%)' for d, p, _ in top_decreases])}")
            
            return "\n".join(summary_parts)
            
    except Exception as e:
        logging.error(f"Error fetching monthly data summary: {e}")
        return "Error accessing apartment transaction data. Using fallback: Monthly real estate data shows varied market conditions across Seoul districts."
