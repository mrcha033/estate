# ETL Alerting Specification

This document defines critical error conditions within the ETL pipeline and how they are mapped to real-time alerts, primarily via Sentry.

## 1. Overview

The ETL pipeline is designed to process real estate data. Critical errors in this pipeline can lead to data staleness, inaccuracies, or complete processing failures. Real-time alerting ensures that the responsible team is immediately notified of such issues, enabling prompt investigation and resolution.

## 2. Alerting Tool

**Sentry** is the primary alerting tool integrated with the ETL pipeline. All unhandled exceptions and explicitly captured errors within the Celery tasks are sent to Sentry.

## 3. Critical Error Conditions & Alert Triggers

The following conditions are considered critical errors and will trigger alerts:

### 3.1. Failed Celery Tasks

*   **Condition**: Any Celery task (`fetch_data_from_api`, `normalize_data`, `deduplicate_records`, `store_data_in_postgresql`, `add_checksum_and_audit_log`) raises an unhandled exception or an explicitly captured exception.
*   **Trigger Mechanism**: Sentry SDK's automatic exception capture (`sentry_sdk.capture_exception(e)`) within the `except` blocks of each task. Sentry will create an issue for each unique error type and traceback.
*   **Alert Routing**: Sentry's default alerting rules will notify the configured team (e.g., via email, Slack, PagerDuty) for new issues or regressions.
*   **Examples of Errors Captured**:
    *   `ConnectionError` during data fetching (e.g., API endpoint is down).
    *   `ValueError` or `TypeError` during data normalization or deduplication due to unexpected data formats.
    *   Database connection errors or integrity constraint violations during data storage.
    *   Any unhandled Python exceptions within the task logic.

### 3.2. Data Source Downtime

*   **Condition**: The `fetch_data_from_api` task consistently fails due to network issues or the external data source being unreachable.
*   **Trigger Mechanism**: The `ConnectionError` exception is captured by Sentry. Sentry's alerting rules can be configured to trigger specific notifications if a high volume of `ConnectionError` events from this task occurs within a defined time window (e.g., 5 errors in 10 minutes).
*   **Alert Routing**: Configured in Sentry to notify the data engineering team.

### 3.3. Data Integrity Check Failures

*   **Condition**: The `add_checksum_and_audit_log` task (or any subsequent data validation step) detects a data integrity issue (e.g., checksum mismatch, unexpected data schema, missing critical fields).
*   **Trigger Mechanism**: An explicit exception is raised within the task (e.g., `DataIntegrityError`) and captured by Sentry. Custom Sentry alerts can be set up to specifically look for these error types or messages.
*   **Alert Routing**: Configured in Sentry to notify the data quality and engineering teams.

## 4. Alert Configuration in Sentry

*   **Issues**: Sentry automatically groups similar errors into issues. Teams should regularly review new and regressed issues.
*   **Alert Rules**: Custom alert rules can be created in Sentry to:
    *   Notify on new errors.
    *   Notify on a high frequency of specific errors.
    *   Notify when an error re-occurs after being resolved.
*   **Integrations**: Sentry can be integrated with various communication platforms (Slack, email, PagerDuty, Microsoft Teams) to route alerts to the appropriate channels.

## 5. Logging for Auditability

All errors captured by Sentry are also logged locally within the ETL service (as configured in `services/etl/tasks.py`). These logs provide a detailed historical record for post-incident analysis and auditing purposes.
