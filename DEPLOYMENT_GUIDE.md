# Deployment Guide

This document outlines the steps required to deploy the Estate project, which leverages AWS for infrastructure, Docker for containerization, Kubernetes for orchestration, and GitHub Actions for CI/CD.

## 1. Prerequisites

Before you begin, ensure you have the following:

*   **AWS Account**: An active AWS account with appropriate permissions to create and manage resources (IAM, EC2, EKS, RDS, Redis, S3, CloudFront, SES).
*   **AWS CLI**: Configured with credentials for your AWS account.
*   **Terraform**: Installed and configured on your local machine.
*   **kubectl**: Installed and configured to interact with Kubernetes clusters.
*   **Docker**: Installed on your local machine.
*   **GitHub Repository**: The project code hosted in a GitHub repository.
*   **GitHub Actions Secrets**: Necessary AWS credentials and other sensitive information configured as GitHub Actions secrets (e.g., `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`).

## 2. Infrastructure Provisioning (Terraform)

The project's AWS infrastructure is defined using Terraform.

1.  **Navigate to the Terraform directory**:
    ```bash
    cd infrastructure/terraform
    ```

2.  **Initialize Terraform**:
    ```bash
    terraform init
    ```

3.  **Review the plan**:
    ```bash
    terraform plan
    ```
    This command shows you what Terraform will create, modify, or destroy. Review it carefully.

4.  **Apply the Terraform configuration**:
    ```bash
    terraform apply
    ```
    Confirm the action by typing `yes` when prompted. This will provision the EKS cluster, RDS databases, Redis, S3 buckets, CloudFront distributions, and SES configurations.

## 3. Application Deployment (GitHub Actions & Kubernetes)

The applications are containerized and deployed to the EKS cluster via GitHub Actions workflows.

### 3.1. Docker Images

Each application (`backend`, `frontend`, `ai`, `etl`) has a `Dockerfile` in its respective directory (`apps/backend`, `apps/frontend`, `services/ai`, `services/etl`). These Dockerfiles define how the application images are built.

### 3.2. GitHub Actions Workflows

The `.github/workflows` directory contains the CI/CD pipelines:

*   `backend.yml`: Builds and tests the backend application.
*   `deploy-backend.yml`: Deploys the backend application to Kubernetes.
*   `frontend.yml`: Builds and tests the frontend application.
*   `deploy-frontend.yml`: Deploys the frontend application to Kubernetes.
*   `ai.yml`: Builds and tests the AI service.
*   `deploy-ai.yml`: Deploys the AI service to Kubernetes.
*   `etl.yml`: Builds and tests the ETL service.
*   `deploy-etl.yml`: Deploys the ETL service to Kubernetes.

These workflows are typically triggered on pushes to specific branches (e.g., `main`) or on pull requests.

### 3.3. Deployment Process

When a `deploy-*.yml` workflow is triggered:

1.  **Build Docker Image**: The workflow builds the Docker image for the respective application.
2.  **Push to ECR**: The built Docker image is pushed to an Amazon Elastic Container Registry (ECR) repository.
3.  **Kubernetes Deployment**: The workflow then updates the Kubernetes deployment in the EKS cluster to use the newly pushed Docker image. This typically involves:
    *   Updating the image tag in the Kubernetes deployment manifest (e.g., `infrastructure/k8s/backend-deployment.yaml`).
    *   Applying the updated manifest to the EKS cluster using `kubectl`.

## 4. Post-Deployment Steps

After successful deployment, you may need to:

*   **Configure DNS**: Point your domain names to the CloudFront distributions or load balancers provisioned by Terraform.
*   **Monitor Applications**: Use Prometheus/Grafana (as indicated by `SLI_SLO_DOCUMENTATION.md` and `CI_CD_MONITORING.md`) and Sentry to monitor the health and performance of your applications.
*   **Access Services**: Access your deployed frontend application via its URL, and interact with the backend API as needed.

## 5. Troubleshooting

*   **Terraform Errors**: If `terraform apply` fails, review the error messages. Common issues include incorrect AWS credentials, insufficient permissions, or resource limits.
*   **GitHub Actions Failures**: Check the workflow logs in GitHub Actions for detailed error messages. Issues could be related to build failures, Docker push errors, or Kubernetes deployment problems.
*   **Kubernetes Issues**: Use `kubectl get pods`, `kubectl describe pod <pod-name>`, and `kubectl logs <pod-name>` to debug issues within the EKS cluster.
*   **Application Logs**: Check application logs (e.g., via CloudWatch, or directly from Kubernetes pods) for runtime errors.
