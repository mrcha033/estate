# Estate Monorepo

This monorepo contains the codebase for the Seoul apartment insights platform. It is structured to support multiple services:

- **`apps/frontend`**: Next.js v13 application with Tailwind CSS v3.
- **`apps/backend`**: Node.js v18 TypeScript Fastify application.
- **`services/etl`**: Python 3.10 ETL microservice with Celery v5.
- **`services/ai`**: Python 3.10 AI microservice with Celery v5.
- **`libs/shared`**: Shared libraries and utilities (currently empty).
- **`infrastructure/terraform`**: Terraform v1.3 modules for AWS infrastructure.
- **`infrastructure/k8s`**: Kubernetes configurations (currently empty).
- **`.github/workflows`**: GitHub Actions workflows for CI/CD.
- **`scripts/db-migrations`**: Database migration scripts (currently empty).

## Development Setup

### Prerequisites

- Node.js v18+
- Python 3.10+
- npm (Node Package Manager)
- pip (Python Package Installer)
- Docker
- Terraform v1.3+

### Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd estate
    ```

2.  **Frontend Setup (`apps/frontend`)**

    ```bash
    cd apps/frontend
    npm install
    npm run dev
    ```

3.  **Backend Setup (`apps/backend`)**

    ```bash
    cd apps/backend
    npm install
    npm run dev # Assuming a dev script will be added
    ```

4.  **ETL Service Setup (`services/etl`)**

    ```bash
    cd services/etl
    pip install -r requirements.txt
    # To run Celery worker (requires Redis running locally or accessible)
    # celery -A main worker --loglevel=info
    ```

5.  **AI Service Setup (`services/ai`)**

    ```bash
    cd services/ai
    pip install -r requirements.txt
    # To run Celery worker (requires Redis running locally or accessible)
    # celery -A main worker --loglevel=info
    ```

## Infrastructure

Terraform configurations are located in `infrastructure/terraform`. Refer to the respective `.tf` files for details on AWS resource definitions.

## CI/CD

GitHub Actions workflows are configured in `.github/workflows` for automated linting and testing of each service.
