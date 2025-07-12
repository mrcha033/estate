# Service Level Indicators (SLI) and Service Level Objectives (SLO) Documentation

This document defines the Service Level Indicators (SLIs) and Service Level Objectives (SLOs) for the Estate platform, along with the alerting rules to ensure system reliability and performance.

## 1. Service Level Indicators (SLIs)

SLIs are quantitative measures of some aspect of the level of service that is provided. For the Estate platform, we will focus on the following key SLIs:

### 1.1 Latency
- **Definition**: The time it takes for a service to respond to a request.
- **Measurement**: Measured as the 95th percentile of response times for critical API endpoints (e.g., `/search`, `/transactions`, `/reports`).
- **Source**: Prometheus metrics collected from backend and microservices.

### 1.2 Uptime/Availability
- **Definition**: The proportion of time that a service is available and operational.
- **Measurement**: Measured as the percentage of successful requests over total requests.
- **Source**: Prometheus metrics, load balancer logs, and synthetic monitoring.

### 1.3 Error Rate
- **Definition**: The proportion of requests that result in an error.
- **Measurement**: Measured as the percentage of HTTP 5xx errors for API endpoints and application-specific errors logged in Sentry.
- **Source**: Prometheus metrics, Sentry error tracking.

### 1.4 Data Freshness (for ETL/AI pipelines)
- **Definition**: The time elapsed since the most recent data was successfully processed and made available.
- **Measurement**: Measured as the time difference between the current timestamp and the timestamp of the latest successful data ingestion/report generation.
- **Source**: Custom metrics from ETL/AI services, database timestamps.

## 2. Service Level Objectives (SLOs)

SLOs are targets for the SLIs, defining the desired level of service. Failure to meet an SLO indicates a potential problem that needs attention.

### 2.1 Latency SLO
- **Objective**: 95th percentile API latency < 300 ms.
- **Rationale**: Ensures a fast and responsive user experience.

### 2.2 Uptime/Availability SLO
- **Objective**: 99.9% monthly uptime for all critical services (frontend, backend, ETL, AI).
- **Rationale**: Minimizes service disruptions and ensures continuous access for users.

### 2.3 Error Rate SLO
- **Objective**: < 0.1% error rate for critical API endpoints and < 3% human QA error rate for AI-generated reports.
- **Rationale**: Ensures data integrity and a reliable user experience.

### 2.4 Data Freshness SLO
- **Objective**: Data updated within 12 hours of source availability.
- **Rationale**: Ensures users have access to the most up-to-date real estate information.

## 3. Alerting Rules

Alerting rules are configured in Grafana (connected to Prometheus) and Sentry to notify the operations team when SLOs are at risk or violated.

### 3.1 Latency Alerts
- **Rule**: Alert if the 95th percentile latency for `/search` or `/transactions` endpoints exceeds 300 ms for more than 5 minutes.
- **Severity**: High
- **Action**: Investigate backend performance, database queries, or network issues.

### 3.2 Uptime/Availability Alerts
- **Rule**: Alert if the success rate of critical endpoints drops below 99.5% for more than 10 minutes.
- **Severity**: Critical
- **Action**: Investigate service outages, deployment issues, or infrastructure failures.

### 3.3 Error Rate Alerts
- **Rule**: Alert if the HTTP 5xx error rate exceeds 0.5% for any critical API endpoint for more than 5 minutes.
- **Severity**: High
- **Action**: Investigate application errors, misconfigurations, or external service failures.
- **Rule**: Alert if the human QA error rate for AI-generated reports exceeds 3% for two consecutive weeks.
- **Severity**: Medium
- **Action**: Review AI model performance, prompt engineering, or data quality issues.

### 3.4 Data Freshness Alerts
- **Rule**: Alert if the latest data timestamp in PostgreSQL is older than 12 hours.
- **Severity**: High
- **Action**: Investigate ETL pipeline failures, data source issues, or database connectivity problems.

## 4. Monitoring Dashboards

Grafana dashboards will be set up to visualize these SLIs and SLOs, providing real-time insights into system health and performance. Dashboards will include:
- Overall system health (uptime, error rates).
- API performance (latency, throughput).
- Database performance (query times, connections).
- ETL/AI pipeline status (data freshness, task success rates).
- Resource utilization (CPU, memory, network).

## 5. Review and Iteration

SLIs, SLOs, and alerting rules will be reviewed quarterly and adjusted based on system performance, user feedback, and evolving business requirements. This document will be updated accordingly.
