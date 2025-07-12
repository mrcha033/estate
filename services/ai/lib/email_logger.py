import logging

# Configure logging for the AI service
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def log_email_delivery_status(email: str, status: str, details: str = ''):
    if status == 'success':
        logging.info(f"Email delivery successful to {email}. Details: {details}")
    else:
        logging.error(f"Email delivery failed to {email}. Status: {status}. Details: {details}")

def log_bounce_or_unsubscribe(email: str, event_type: str, details: str = ''):
    logging.warning(f"Email event: {event_type} for {email}. Details: {details}")
