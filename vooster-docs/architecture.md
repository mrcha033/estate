# Technical Requirements Document (TRD)

## 1. Executive Technical Summary

**Project Overview**  
A monorepo-based, responsive web & mobile platform delivering AI-generated weekly and monthly Seoul apartment transaction insight reports. The solution ingests government and brokerage data via ETL, normalizes it, stores in PostgreSQL, and leverages Python microservices for AI summarization. A Next.js frontend (SSR/ISR) and Node.js TypeScript backend expose REST APIs, with messaging for report generation and alerts.

**Core Technology Stack**  
- Frontend: Next.js v13, Tailwind CSS v3  
- Backend API: Node.js v18 (TypeScript), Fastify v4  
- ETL & AI Microservices: Python 3.10, Celery v5, PyTorch  
- Database: Supabase (PostgreSQL 14 + Auth, Storage), Redis 6.2  
- Message Broker: RabbitMQ 3.9  
- Infrastructure: Vercel (frontend hosting & edge functions), Terraform v1.3, CloudFront, SES  
- Infrastructure: AWS EKS (Helm-based, unified for backend and AI workloads), Terraform v1.3, CloudFront, SES  
- CI/CD & Monitoring: GitHub Actions, Docker, Prometheus, Grafana, Sentry  

**Key Technical Objectives**  
- Front-end FCP < 1.5 s; 95th-percentile API latency < 300 ms  
- Daily ETL pipeline accuracy ≥ 99 %; AI report generation ≤ 1 hr  
- Scalability: Kubernetes-based microservices; 10× data growth support  
- Reliability: 99.9 % uptime SLA; automated backups & failover  

**Critical Technical Assumptions**  
- Data provider SLAs guarantee daily feed availability  
- OpenAI GPT-4 via Azure with fallback to on-premise Llama  
- GDPR and Korea PIPA compliance enforced at data pipeline  
- Monorepo CI/CD supports simultaneous cross-service testing  

---

## 2. Tech Stack

| Category               | Technology / Library                 | Reasoning (Why it's chosen for this project)                    |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------- |
| Frontend Framework     | Next.js v13                          | SSR/ISR for SEO, PWA performance, built-in routing             |
| Styling                | Tailwind CSS v3                      | Utility-first, rapid responsive layout                         |
| Backend Framework      | Node.js v18 (TypeScript) + Fastify   | High performance, strong typings, minimal overhead             |
| ETL & AI Microservice  | Python 3.10, Celery v5, PyTorch      | Proven AI/ML ecosystem, async task scheduling                  |
| Database               | PostgreSQL 14                        | ACID, window functions, strong GIS support                     |
| Cache                   | Redis 6.2                            | Low-latency caching for frequent lookup (filters, sessions)    |
| Message Broker         | RabbitMQ 3.9                         | Reliable messaging for report generation & alert workflows     |
| Object Storage         | AWS S3                               | Scalable, durable storage for report assets (PDF, images)      |
| API Gateway            | NGINX                                | Lightweight routing, TLS termination, basic auth rate limiting |
| Infrastructure         | AWS EKS (Helm, CronJob, HPA), Terraform v1.3 | Unified platform for all workloads, simplified ops, auto-scaling |
| CDN & Edge             | AWS CloudFront                       | Global caching of assets and API endpoints                     |
| Monitoring & Logging    | Prometheus, Grafana, Sentry          | Metrics, dashboards, error tracking                            |
| CI/CD                   | GitHub Actions, Docker               | Automated build, test, and deployment pipeline                 |
| Analytics               | Segment                              | Centralized event tracking for user behavior                   |
| Email & Notifications   | AWS SES, KakaoTalk API               | Reliable email delivery, local chat alerts                     |
| Payment Gateway         | Stripe                               | PCI-compliant, global payment processing                       |

---

## 3. System Architecture Design

### Top-Level building blocks
- Frontend App  
  - Next.js SSR/ISR pages, Tailwind CSS UI components, service-worker PWA  
- API Gateway  
  - NGINX for TLS termination, routing to internal services  
- Backend API  
- Backend API  
- ETL Pipeline  
- ETL Pipeline  
  - Python/Celery tasks scheduled via RabbitMQ (queue and retry/DLX rules), writes to PostgreSQL  
- AI Reporting Service  
  - Celery workers invoking OpenAI/GPT and fallback Llama (resource requirements documented)  
  - Celery workers invoking OpenAI/GPT and fallback Llama  
- Messaging & Alerts  
  - RabbitMQ-driven workflows, email via SES, KakaoTalk integration  
- Data Storage  
  - PostgreSQL primary and read replicas; Redis for caching  
- Object Storage  
  - S3 buckets for report PDFs, images, CSV exports  
- Monitoring & Observability  
  - Prometheus exporters, Grafana dashboards, Sentry error tracking  
- Infrastructure Automation  
  - Terraform modules provisioning AWS EKS/ECS, RDS, IAM, CloudFront  

### Top-Level Component Interaction Diagram
```mermaid
graph TD
    A[Next.js Frontend] -->|REST/GraphQL| B[API Gateway]
    B --> C[Backend API (Fastify)]
    C --> D[PostgreSQL & Redis]
    C --> E[RabbitMQ]
    E --> F[ETL & AI Microservices]
    F --> D
    C --> G[AWS S3]
    C --> H[SES / KakaoTalk]
```

- The Frontend sends API calls to the API Gateway which proxies to the Backend API.  
- The Backend reads/writes data from PostgreSQL and uses Redis for cached queries.  
- Report generation and anomaly detection tasks are queued in RabbitMQ and processed by Python microservices.  
- Generated assets are stored in S3; notifications dispatched via SES or KakaoTalk API.  

### Code Organization & Convention

Domain-Driven Organization Strategy  
- Domain Separation: `user`, `insights`, `search`, `reports`, `alerts`, `admin`  
- Layer-Based Architecture: `presentation`, `services`, `repositories`, `infrastructure`  
- Feature-Based Modules: group by feature, each with its own controllers, services, and data access  
- Shared Components: utilities, types, DTOs, and common UI components  

Universal File & Folder Structure (Monorepo)
```
/
├── apps
│   ├── frontend
│   │   ├── public
│   │   ├── src
│   │   │   ├── pages
│   │   │   ├── components
│   │   │   ├── services
│   │   │   └── styles
│   └── backend
│       ├── src
│       │   ├── domains
│       │   │   ├── user
│       │   │   ├── insights
│       │   │   └── search
│       │   ├── services
│       │   ├── repositories
│       │   ├── controllers
│       │   └── infrastructure
│       └── test
├── services
│   ├── etl
│   │   ├── celery_tasks
│   │   └── schemas
│   └── ai
│       ├── models
│       └── tasks
├── libs
│   ├── shared
│   └── types
├── infrastructure
│   ├── terraform
│   └── k8s
├── .github
│   └── workflows
└── scripts
    └── db-migrations
```

### Data Flow & Communication Patterns
- Client–Server Communication: REST endpoints via HTTPS; JSON over TLS 1.3  
- Database Interaction: TypeORM or Prisma for PostgreSQL; connection pooling and retry logic  
- External Service Integration: HTTP clients with circuit breaker (SES, KakaoTalk, Stripe)  
- Asynchronous Workflows: Celery + RabbitMQ for ETL and AI tasks; idempotent task design; hard queue rules (TTL/prefetch/DLX) for queue:report.generate and queue:alert.trigger  
- Data Synchronization: Daily full load and incremental CDC; checksum verification  
- Data Synchronization: Daily full load and incremental CDC; checksum verification  

---

## 4. Performance & Optimization Strategy
- Leverage Next.js ISR and Edge Caching (CloudFront) for static pages and reports  
- Implement Redis caching for high-frequency query results (e.g., price trends per complex)  
- Optimize database with indexes, materialized views, and read replicas for heavy analytic queries  
- For complex aggregation/search APIs: implement Redis sorted-set + hash for precomputed feeds, and/or outsource address/complex search to Elasticsearch cluster  
- Batch and throttle AI calls; cache inference results based on input parameters  

---

## 5. Implementation Roadmap & Milestones

### Phase 1: Foundation (MVP Implementation)
- Core Infrastructure: Terraform provisioning (EKS/ECS, RDS, Redis, S3, SES)  
- Essential Features: Data ingestion & cleansing, area search, basic visualizations, weekly report generation  
- Basic Security: OAuth2.0, TLS, OWASP Top 10 mitigation, role-based access  
- Development Setup: Monorepo CI/CD pipeline, linting, unit tests (≥ 80 % coverage)  
- Timeline: 3 months  

### Phase 2: Feature Enhancement
- Advanced Features: Mobile PWA enhancements, PDF export, custom alert thresholds  
- Performance Optimization: Query tuning, CDN edge functions, auto-scaling rules  
- Enhanced Security: GDPR consent flows, encrypted PII at rest, audit logging  
- Monitoring Implementation: SLI/SLO dashboards, alerting for latency and error rates  
- Timeline: Months 4–6  

### Phase 3: Scaling & Optimization
- Scalability Implementation: Multi-AZ RDS failover, Kafka *replacement* for RabbitMQ (no coexistence); provide Rabbit→Kafka bridge for migration if needed  
- Advanced Integrations: B2B API, Stripe premium plans, data licensing portal  
- Enterprise Features: API keys management, detailed usage analytics  
- Compliance & Auditing: Data retention policies, regulatory reporting  
- Timeline: Months 7–12  
### Cost and Capacity Planning
- RDS gp3 IOPS, S3 Standard vs IA, EKS node vCPU/hr metrics documented
- Insert 12-month TCO table for storage, compute, and backup costs

### Security Token & Key Lifecycle
- Access Token TTL: 15 min; Refresh Token: 14 days; Redis blacklist set for revocation
- KMS key rotation every 90 days
- JWT (stateless, but no instant revocation) vs Opaque Token + Redis session (supports immediate revocation); document pros/cons and selection criteria

---

## 6. Risk Assessment & Mitigation Strategies

### Technical Risk Analysis
- Technology Risks: API version drift with data providers → Implement schema‐validation & fallback mocks  
- Performance Risks: ETL spikes causing DB load → Schedule off-peak batch windows & incremental loads  
- Security Risks: Unauthorized access → Enforce least privilege IAM, regular pentesting  
- Integration Risks: Third-party downtime (Stripe, KakaoTalk) → Circuit breakers, backup notification channels  

Mitigation Strategies:  
- Automated integration tests, staged canary deployments, real-time observability  

### Project Delivery Risks
- Timeline Risks: Data source delays → Parallelize frontend mocks with stub data  
- Resource Risks: Limited AI expertise → Partner with AI consultancy for initial setup  
- Quality Risks: Insufficient test coverage → Enforce CI gating and coverage thresholds  
- Deployment Risks: Infrastructure misconfiguration → Infrastructure as Code linting and policy checks  

Contingency Plans:  
- Rollback automation, hotfix branches, off-hours maintenance windows  

