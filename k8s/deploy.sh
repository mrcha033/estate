#!/bin/bash

# Estate Project Kubernetes Deployment Script
# Project ZS6O - Seoul Real Estate Intelligence Platform

set -e

echo "🏠 Deploying Estate Project Kubernetes Resources..."

# Apply secrets first
echo "📋 Applying secrets..."
kubectl apply -f estate-secrets.yaml

# Apply Redis deployment
echo "🔴 Deploying Redis..."
kubectl apply -f redis-deployment.yaml

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/redis

# Apply ETL service
echo "🔄 Deploying ETL service..."
kubectl apply -f etl-deployment.yaml

# Wait for ETL to be ready
echo "⏳ Waiting for ETL service to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/estate-etl
kubectl wait --for=condition=available --timeout=300s deployment/estate-etl-worker
kubectl wait --for=condition=available --timeout=300s deployment/estate-etl-scheduler

# Apply AI service
echo "🤖 Deploying AI service..."
kubectl apply -f ai-deployment.yaml
kubectl apply -f ai-worker-deployment.yaml

# Wait for AI services to be ready
echo "⏳ Waiting for AI services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/estate-ai
kubectl wait --for=condition=available --timeout=300s deployment/estate-ai-worker

# Apply CronJobs
echo "⏰ Setting up automated jobs..."
kubectl apply -f etl-cronjob.yaml

# Verify deployment
echo "✅ Verifying deployment status..."
kubectl get pods -l app=estate-etl
kubectl get pods -l app=estate-ai
kubectl get cronjobs
kubectl get services

echo ""
echo "🎉 Estate Project deployment completed successfully!"
echo ""
echo "📊 Services deployed:"
echo "   - ETL Service: estate-etl-service"
echo "   - AI Service: estate-ai-service"
echo "   - Redis: redis-service"
echo ""
echo "⏰ Scheduled jobs:"
echo "   - Daily ETL: 2 AM UTC"
echo "   - Weekly Reports: Monday 4 AM UTC"
echo "   - Monthly Reports: 1st day 5 AM UTC"
echo ""
echo "🔍 Monitor with:"
echo "   kubectl logs -f deployment/estate-etl"
echo "   kubectl logs -f deployment/estate-ai"
echo "   kubectl get cronjobs"