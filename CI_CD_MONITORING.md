# CI/CD and Monitoring Setup

This document outlines the Continuous Integration/Continuous Deployment (CI/CD) pipeline and monitoring setup for the Estate monorepo.

## 1. Continuous Integration (CI)

Our CI process is managed using GitHub Actions, ensuring code quality and early detection of issues across all services.

### 1.1 Workflows

-   **Frontend CI (`.github/workflows/frontend.yml`)**:
    -   **Triggers**: Pushes and Pull Requests to `main` or `develop` branches affecting `apps/frontend/**`.
    -   **Jobs**: Installs dependencies, runs ESLint for linting, and executes unit/integration tests.

-   **Backend CI (`.github/workflows/backend.yml`)**:
    -   **Triggers**: Pushes and Pull Requests to `main` or `develop` branches affecting `apps/backend/**`.
    -   **Jobs**: Installs dependencies, builds TypeScript code, and executes unit/integration tests.

-   **ETL Service CI (`.github/workflows/etl.yml`)**:
    -   **Triggers**: Pushes and Pull Requests to `main` or `develop` branches affecting `services/etl/**`.
    -   **Jobs**: Sets up Python environment, installs dependencies, and runs unit tests.

-   **AI Service CI (`.github/workflows/ai.yml`)**:
    -   **Triggers**: Pushes and Pull Requests to `main` or `develop` branches affecting `services/ai/**`.
    -   **Jobs**: Sets up Python environment, installs dependencies, and runs unit tests.

## 2. Continuous Deployment (CD)

Our CD process automates the deployment of services to their respective environments upon successful CI builds.

### 2.1 Deployment Workflows

-   **Deploy Frontend to Vercel (`.github/workflows/deploy-frontend.yml`)**:
    -   **Triggers**: Pushes to `main` branch affecting `apps/frontend/**`.
    -   **Action**: Uses Vercel Action to deploy the Next.js frontend application.
    -   **Secrets**: Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

-   **Deploy Backend to EKS (`.github/workflows/deploy-backend.yml`)**:
    -   **Triggers**: Pushes to `main` branch affecting `apps/backend/**`.
    -   **Action**: Builds and pushes Docker image to Amazon ECR, then uses `kubectl` (placeholder) to deploy to AWS EKS.
    -   **Secrets**: Requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

-   **Deploy ETL Service to EKS (`.github/workflows/deploy-etl.yml`)**:
    -   **Triggers**: Pushes to `main` branch affecting `services/etl/**`.
    -   **Action**: Builds and pushes Docker image to Amazon ECR, then uses `kubectl` (placeholder) to deploy to AWS EKS.
    -   **Secrets**: Requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

-   **Deploy AI Service to EKS (`.github/workflows/deploy-ai.yml`)**:
    -   **Triggers**: Pushes to `main` branch affecting `services/ai/**`.
    -   **Action**: Builds and pushes Docker image to Amazon ECR, then uses `kubectl` (placeholder) to deploy to AWS EKS.
    -   **Secrets**: Requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

## 3. Monitoring Setup

We utilize Sentry for error tracking and Prometheus/Grafana for metrics visualization and alerting.

### 3.1 Error Tracking (Sentry)

-   **Integration**: Sentry SDKs are integrated into both the frontend (Next.js) and backend (Node.js/Fastify) applications.
    -   **Frontend**: Configured via `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and `next.config.ts`.
    -   **Backend**: Configured via `sentry.server.config.ts`.
-   **Purpose**: Captures and reports application errors, providing detailed stack traces and context for debugging.

### 3.2 Metrics & Alerting (Prometheus/Grafana)

-   **Prometheus**: The backend Fastify application exposes a `/metrics` endpoint using `prom-client` to provide default Node.js metrics. Custom application metrics can be added as needed.
-   **Grafana**: Grafana dashboards will be set up to visualize key Service Level Indicators (SLIs) such as latency, uptime, error rates, and data freshness. Alerting rules are defined in Grafana to notify on-call teams of SLO violations.
-   **SLI/SLO Documentation**: Detailed SLI/SLO definitions and alerting rules are documented in `SLI_SLO_DOCUMENTATION.md`.

## 4. Future Enhancements

-   Implement more granular deployment strategies (e.g., canary deployments, blue/green deployments).
-   Automate database migrations within the CI/CD pipeline.
-   Expand custom metrics collection for all services.
-   Integrate end-to-end testing into the CI/CD pipeline.
