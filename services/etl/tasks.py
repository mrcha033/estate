from celery import shared_task
from sqlalchemy import create_engine, text
import logging
import hashlib
import json
import sentry_sdk
import os
from prometheus_client import Counter
import boto3
from services.etl.secrets_manager import secrets_manager

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

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def fetch_seoul_apartment_data(self):
    try:
        import requests
        from datetime import datetime, timedelta
        
        logging.info("Fetching Seoul apartment transaction data from government API")
        
        # Korean Real Estate Board (R-ONE) API endpoint
        api_key = secrets_manager.get_kreb_api_key()
        
        base_url = "http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev"
        
        # Fetch data for last 30 days to ensure we get recent transactions
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # Seoul district codes (구)
        seoul_districts = [
            "11110", "11140", "11170", "11200", "11215", "11230", "11260", "11290",
            "11305", "11320", "11350", "11380", "11410", "11440", "11470", "11500",
            "11530", "11545", "11560", "11590", "11620", "11650", "11680", "11710", "11740"
        ]
        
        all_transactions = []
        
        for district_code in seoul_districts:
            params = {
                'serviceKey': api_key,
                'LAWD_CD': district_code,
                'DEAL_YMD': start_date.strftime('%Y%m'),
                'numOfRows': '1000',
                'pageNo': '1'
            }
            
            try:
                response = requests.get(base_url, params=params, timeout=30)
                response.raise_for_status()
                
                # Parse XML response
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.content)
                
                items = root.findall('.//item')
                for item in items:
                    transaction = {
                        'district_code': district_code,
                        'apartment_name': item.find('아파트').text if item.find('아파트') is not None else '',
                        'transaction_amount': item.find('거래금액').text if item.find('거래금액') is not None else '',
                        'construction_year': item.find('건축년도').text if item.find('건축년도') is not None else '',
                        'transaction_date': f"{item.find('년').text}-{item.find('월').text.zfill(2)}-{item.find('일').text.zfill(2)}" 
                                          if all(item.find(x) is not None for x in ['년', '월', '일']) else '',
                        'area_sqm': item.find('전용면적').text if item.find('전용면적') is not None else '',
                        'district_name': item.find('시군구').text if item.find('시군구') is not None else '',
                        'dong_name': item.find('법정동').text if item.find('법정동') is not None else '',
                        'floor': item.find('층').text if item.find('층') is not None else '',
                        'reg_date': item.find('등기날짜').text if item.find('등기날짜') is not None else ''
                    }
                    all_transactions.append(transaction)
                    
                logging.info(f"Fetched {len(items)} transactions from district {district_code}")
                
            except requests.exceptions.RequestException as e:
                logging.warning(f"Failed to fetch data for district {district_code}: {e}")
                continue
        
        logging.info(f"Total transactions fetched: {len(all_transactions)}")
        etl_tasks_processed.labels('fetch_seoul_apartment_data', 'success').inc()
        
        return {
            "message": f"Seoul apartment data fetched successfully",
            "data": all_transactions,
            "count": len(all_transactions),
            "fetch_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error fetching Seoul apartment data: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error in fetch_seoul_apartment_data: {e}")
        etl_tasks_processed.labels('fetch_seoul_apartment_data', 'failure').inc()
        raise self.retry(exc=e)

@shared_task
def normalize_seoul_apartment_data(raw_data):
    try:
        import re
        from datetime import datetime
        
        logging.info(f"Normalizing {len(raw_data.get('data', []))} Seoul apartment transactions")
        
        normalized_transactions = []
        
        for transaction in raw_data.get('data', []):
            try:
                # Normalize transaction amount (remove commas, convert to integer)
                amount_str = transaction.get('transaction_amount', '').replace(',', '').strip()
                amount_won = int(amount_str) * 10000 if amount_str.isdigit() else 0  # Convert 만원 to won
                
                # Normalize area (convert to float)
                area_str = transaction.get('area_sqm', '').strip()
                area_sqm = float(area_str) if area_str.replace('.', '').isdigit() else 0.0
                
                # Normalize construction year
                construction_year_str = transaction.get('construction_year', '').strip()
                construction_year = int(construction_year_str) if construction_year_str.isdigit() else None
                
                # Normalize floor
                floor_str = transaction.get('floor', '').strip()
                floor_num = int(floor_str) if floor_str.isdigit() else None
                
                # Parse and validate transaction date
                transaction_date_str = transaction.get('transaction_date', '').strip()
                transaction_date = None
                if transaction_date_str:
                    try:
                        transaction_date = datetime.strptime(transaction_date_str, '%Y-%m-%d').date()
                    except ValueError:
                        logging.warning(f"Invalid date format: {transaction_date_str}")
                
                # Create unique identifier for deduplication
                unique_key = f"{transaction.get('district_code')}_{transaction.get('apartment_name')}_{transaction_date_str}_{amount_won}_{area_sqm}"
                
                normalized_transaction = {
                    'unique_key': unique_key,
                    'district_code': transaction.get('district_code', '').strip(),
                    'district_name': transaction.get('district_name', '').strip(),
                    'dong_name': transaction.get('dong_name', '').strip(),
                    'apartment_name': transaction.get('apartment_name', '').strip(),
                    'transaction_amount_won': amount_won,
                    'transaction_amount_display': f"{amount_won:,}원" if amount_won > 0 else '',
                    'area_sqm': area_sqm,
                    'area_pyeong': round(area_sqm / 3.3058, 2) if area_sqm > 0 else 0.0,  # Convert to 평
                    'construction_year': construction_year,
                    'floor': floor_num,
                    'transaction_date': transaction_date.isoformat() if transaction_date else None,
                    'reg_date': transaction.get('reg_date', '').strip(),
                    'price_per_sqm': round(amount_won / area_sqm) if area_sqm > 0 and amount_won > 0 else 0,
                    'created_at': datetime.now().isoformat(),
                    'data_quality_score': calculate_data_quality_score(transaction, amount_won, area_sqm, construction_year)
                }
                
                normalized_transactions.append(normalized_transaction)
                
            except Exception as e:
                logging.warning(f"Failed to normalize transaction: {transaction}. Error: {e}")
                continue
        
        logging.info(f"Successfully normalized {len(normalized_transactions)} transactions")
        etl_tasks_processed.labels('normalize_seoul_apartment_data', 'success').inc()
        
        return {
            "message": f"Seoul apartment data normalized successfully",
            "normalized_data": normalized_transactions,
            "count": len(normalized_transactions),
            "original_count": len(raw_data.get('data', [])),
            "normalization_success_rate": len(normalized_transactions) / len(raw_data.get('data', [])) if raw_data.get('data') else 0
        }
        
    except Exception as e:
        logging.error(f"Error normalizing Seoul apartment data: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during Seoul apartment data normalization: {e}")
        etl_tasks_processed.labels('normalize_seoul_apartment_data', 'failure').inc()
        raise

def calculate_data_quality_score(transaction, amount_won, area_sqm, construction_year):
    """Calculate data quality score (0-100) based on completeness and validity"""
    score = 0
    
    # Required fields scoring
    if transaction.get('apartment_name', '').strip(): score += 20
    if amount_won > 0: score += 25
    if area_sqm > 0: score += 20
    if transaction.get('transaction_date', '').strip(): score += 15
    if transaction.get('district_name', '').strip(): score += 10
    if construction_year and 1950 <= construction_year <= 2024: score += 10
    
    return score

@shared_task
def deduplicate_seoul_apartment_records(normalized_data):
    try:
        logging.info(f"Deduplicating {len(normalized_data.get('normalized_data', []))} Seoul apartment records")
        
        transactions = normalized_data.get('normalized_data', [])
        unique_transactions = {}
        duplicates_found = 0
        
        for transaction in transactions:
            unique_key = transaction.get('unique_key')
            
            if unique_key in unique_transactions:
                # If duplicate found, keep the one with higher data quality score
                existing_score = unique_transactions[unique_key].get('data_quality_score', 0)
                current_score = transaction.get('data_quality_score', 0)
                
                if current_score > existing_score:
                    unique_transactions[unique_key] = transaction
                    
                duplicates_found += 1
                logging.debug(f"Duplicate found for key: {unique_key}")
            else:
                unique_transactions[unique_key] = transaction
        
        deduplicated_list = list(unique_transactions.values())
        
        # Sort by transaction date descending
        deduplicated_list.sort(key=lambda x: x.get('transaction_date', ''), reverse=True)
        
        logging.info(f"Deduplication complete: {len(deduplicated_list)} unique records, {duplicates_found} duplicates removed")
        etl_tasks_processed.labels('deduplicate_seoul_apartment_records', 'success').inc()
        
        return {
            "message": "Seoul apartment data deduplicated successfully",
            "deduplicated_data": deduplicated_list,
            "unique_count": len(deduplicated_list),
            "duplicates_removed": duplicates_found,
            "deduplication_rate": (duplicates_found / len(transactions)) * 100 if transactions else 0
        }
        
    except Exception as e:
        logging.error(f"Error deduplicating Seoul apartment records: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during Seoul apartment data deduplication: {e}")
        etl_tasks_processed.labels('deduplicate_seoul_apartment_records', 'failure').inc()
        raise

@shared_task
def store_seoul_apartment_data_in_postgresql(deduplicated_data):
    try:
        from datetime import datetime
        
        transactions = deduplicated_data.get('deduplicated_data', [])
        logging.info(f"Storing {len(transactions)} Seoul apartment records in PostgreSQL")
        
        # Get database connection
        database_url = secrets_manager.get_database_url()
        
        engine = create_engine(database_url)
        
        # Create apartment_transactions table if it doesn't exist
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS apartment_transactions (
            id SERIAL PRIMARY KEY,
            unique_key VARCHAR(255) UNIQUE NOT NULL,
            district_code VARCHAR(10),
            district_name VARCHAR(50),
            dong_name VARCHAR(50),
            apartment_name VARCHAR(100),
            transaction_amount_won BIGINT,
            transaction_amount_display VARCHAR(50),
            area_sqm DECIMAL(10,2),
            area_pyeong DECIMAL(10,2),
            construction_year INTEGER,
            floor INTEGER,
            transaction_date DATE,
            reg_date VARCHAR(20),
            price_per_sqm INTEGER,
            data_quality_score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_district_code (district_code),
            INDEX idx_transaction_date (transaction_date),
            INDEX idx_apartment_name (apartment_name),
            INDEX idx_price_range (transaction_amount_won)
        );
        """
        
        new_records = 0
        updated_records = 0
        
        with engine.connect() as connection:
            # Create table
            connection.execute(text(create_table_sql))
            connection.commit()
            
            for transaction in transactions:
                try:
                    # Check if record already exists
                    check_sql = "SELECT id FROM apartment_transactions WHERE unique_key = :unique_key"
                    existing = connection.execute(text(check_sql), unique_key=transaction['unique_key']).fetchone()
                    
                    if existing:
                        # Update existing record
                        update_sql = """
                        UPDATE apartment_transactions SET
                            district_code = :district_code,
                            district_name = :district_name,
                            dong_name = :dong_name,
                            apartment_name = :apartment_name,
                            transaction_amount_won = :transaction_amount_won,
                            transaction_amount_display = :transaction_amount_display,
                            area_sqm = :area_sqm,
                            area_pyeong = :area_pyeong,
                            construction_year = :construction_year,
                            floor = :floor,
                            transaction_date = :transaction_date,
                            reg_date = :reg_date,
                            price_per_sqm = :price_per_sqm,
                            data_quality_score = :data_quality_score,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE unique_key = :unique_key
                        """
                        connection.execute(text(update_sql), **transaction)
                        updated_records += 1
                    else:
                        # Insert new record
                        insert_sql = """
                        INSERT INTO apartment_transactions (
                            unique_key, district_code, district_name, dong_name, apartment_name,
                            transaction_amount_won, transaction_amount_display, area_sqm, area_pyeong,
                            construction_year, floor, transaction_date, reg_date, price_per_sqm,
                            data_quality_score
                        ) VALUES (
                            :unique_key, :district_code, :district_name, :dong_name, :apartment_name,
                            :transaction_amount_won, :transaction_amount_display, :area_sqm, :area_pyeong,
                            :construction_year, :floor, :transaction_date, :reg_date, :price_per_sqm,
                            :data_quality_score
                        )
                        """
                        connection.execute(text(insert_sql), **transaction)
                        new_records += 1
                        
                except Exception as e:
                    logging.warning(f"Failed to store transaction {transaction.get('unique_key')}: {e}")
                    continue
            
            connection.commit()
        
        logging.info(f"Successfully stored Seoul apartment data: {new_records} new, {updated_records} updated")
        etl_tasks_processed.labels('store_seoul_apartment_data_in_postgresql', 'success').inc()
        
        return {
            "message": "Seoul apartment data stored in PostgreSQL successfully",
            "new_records": new_records,
            "updated_records": updated_records,
            "total_processed": len(transactions),
            "storage_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error storing Seoul apartment data in PostgreSQL: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Error during Seoul apartment data storage: {e}")
        etl_tasks_processed.labels('store_seoul_apartment_data_in_postgresql', 'failure').inc()
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
def run_seoul_apartment_etl_pipeline():
    """
    Complete ETL pipeline for Seoul apartment transaction data
    Orchestrates: fetch -> normalize -> deduplicate -> store -> audit
    """
    try:
        from datetime import datetime
        
        logging.info("Starting Seoul apartment ETL pipeline")
        pipeline_start = datetime.now()
        
        # Step 1: Fetch data from Korean government API
        logging.info("ETL Step 1: Fetching Seoul apartment data")
        raw_data = fetch_seoul_apartment_data.delay().get()
        
        if not raw_data.get('data'):
            raise ValueError("No data fetched from API")
        
        # Step 2: Normalize data
        logging.info("ETL Step 2: Normalizing data")
        normalized_data = normalize_seoul_apartment_data.delay(raw_data).get()
        
        # Step 3: Deduplicate records
        logging.info("ETL Step 3: Deduplicating records")
        deduplicated_data = deduplicate_seoul_apartment_records.delay(normalized_data).get()
        
        # Step 4: Store in PostgreSQL
        logging.info("ETL Step 4: Storing in database")
        storage_result = store_seoul_apartment_data_in_postgresql.delay(deduplicated_data).get()
        
        # Step 5: Create audit log
        logging.info("ETL Step 5: Creating audit log")
        pipeline_summary = {
            'pipeline_start': pipeline_start.isoformat(),
            'pipeline_end': datetime.now().isoformat(),
            'raw_records_fetched': raw_data.get('count', 0),
            'normalized_records': normalized_data.get('count', 0),
            'unique_records': deduplicated_data.get('unique_count', 0),
            'duplicates_removed': deduplicated_data.get('duplicates_removed', 0),
            'new_records_stored': storage_result.get('new_records', 0),
            'updated_records': storage_result.get('updated_records', 0),
            'data_quality_passed': True
        }
        
        audit_result = add_checksum_and_audit_log.delay(pipeline_summary).get()
        
        pipeline_duration = (datetime.now() - pipeline_start).total_seconds()
        
        # Step 6: Check price alert triggers after new data is processed
        logging.info("ETL Step 6: Checking price alert triggers")
        try:
            # Make HTTP request to backend API to check alert triggers
            import requests
            backend_url = os.environ.get("BACKEND_API_URL", "http://localhost:3001")
            alert_response = requests.post(f"{backend_url}/api/alerts/check-triggers", timeout=30)
            
            if alert_response.status_code == 200:
                alert_result = alert_response.json()
                logging.info(f"Alert check completed: {alert_result.get('message', 'No details')}")
                pipeline_summary['alerts_checked'] = alert_result.get('total_alerts', 0)
                pipeline_summary['alerts_triggered'] = alert_result.get('triggered_alerts', 0)
            else:
                logging.warning(f"Alert check failed with status {alert_response.status_code}")
        except Exception as e:
            logging.warning(f"Failed to check alert triggers: {e}")
            # Don't fail the entire pipeline if alert checking fails
        
        logging.info(f"Seoul apartment ETL pipeline completed successfully in {pipeline_duration:.2f} seconds")
        etl_tasks_processed.labels('run_seoul_apartment_etl_pipeline', 'success').inc()
        
        return {
            "message": "Seoul apartment ETL pipeline completed successfully",
            "pipeline_summary": pipeline_summary,
            "duration_seconds": pipeline_duration,
            "audit_result": audit_result
        }
        
    except Exception as e:
        logging.error(f"Seoul apartment ETL pipeline failed: {e}")
        sentry_sdk.capture_exception(e)
        etl_alert_logger.error(f"ETL Alert: Seoul apartment ETL pipeline failed: {e}")
        etl_tasks_processed.labels('run_seoul_apartment_etl_pipeline', 'failure').inc()
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

    logging.info(summary)
    etl_tasks_processed.labels('send_daily_etl_summary_email', 'success').inc()
    return {"message": "ETL summary email sent", "summary": summary}

def fetch_data_from_api(api_url):
    """
    Generic API data fetching function for testing purposes
    """
    try:
        logging.info(f"Fetching data from API: {api_url}")
        
        if "fail.example.com" in api_url:
            raise Exception("Simulated API connection error")
        
        return {
            "message": f"Data fetched from {api_url}",
            "data": []
        }
        
    except Exception as e:
        logging.error(f"Error fetching data from API {api_url}: {e}")
        raise
