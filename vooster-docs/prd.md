# Product Requirements Document

## 1. Executive Summary  
The project delivers a web & mobile responsive platform that publishes AI-generated weekly and monthly insight reports on Seoul apartment transactions. By combining authoritative transaction data with automated natural-language summaries and rich visualizations, the service enables homebuyers, investors, and professionals to make faster, data-driven decisions in the Seoul real-estate market.

## 2. Problem Statement  
Current real-estate portals either provide raw tables without context or expert articles without transparent data. Users waste time aggregating data, interpreting trends, and tracking market shifts across scattered sources. A single destination that ingests verified transaction data, cleans it, visualizes trends, and auto-generates plain-English reports each week and month will close this gap and democratize insight traditionally reserved for institutional analysts.

## 3. Goals and Objectives  
• Primary Goal: Become the go-to source for timely, trustworthy, and easily consumable Seoul apartment market intelligence.  
• Secondary Goals:  
  – Reduce manual research time for users by 60 % within six months.  
  – Achieve ≥ 30 % monthly active user retention via subscription alerts.  
  – Establish a monetizable B2B API by year two.  
• Success Metrics:  
  – Weekly report open rate ≥ 45 %.
  – Avg. session duration ≥ 4 min. (as measured by Google Analytics: calculated as the difference between first and last event timestamps per session, excluding idle time >5min)
  – Data pipeline accuracy ≥ 99 %.  
  – Revenue from premium plans ≥ USD 100 K in year one.

## 4. Target Audience  
Primary Users  
• End Residents & Prospective Buyers – individuals planning to purchase or move into Seoul/metro apartments, needing up-to-date prices, supply, and trend data.  
• Individual Investors & Landlords – private investors seeking buy-to-let or capital-gain opportunities who track yield, volume, and anomalies.  

Secondary Users  
• Real-estate Professionals – agents, consultants, portfolio managers using reports for client advisory and market analysis.  
• Financial Institutions – banks, securities firms, insurers that underwrite loans and design property-linked products.  
• Academia & Researchers – professors, students, policy analysts needing structured datasets.  
• Tech & Data Analysts – engineers and ML specialists interested in real-estate data APIs and visualization techniques.

## 5. User Stories  
1. As a prospective buyer, I want to search a district and see current price trends so that I can decide if it is affordable.  
2. As an investor, I want weekly email alerts summarizing top price increases so that I can act quickly.  
3. As an agent, I want to export transaction charts into PDF so that I can share them with clients.  
4. As a data scientist, I want an API endpoint returning cleansed transaction data so that I can build predictive models.  
5. As a banker, I want anomaly notifications on transaction volume spikes to manage lending risk.

## 6. Functional Requirements  

### Core Features  

1. Real Transaction Data Ingestion & Cleansing  
   – Source: Government land registry & certified data providers.  
   – Automated ETL normalizes complex, address, size, price, and deed date.  
   – Acceptance: 99 % deduplication; daily pipeline logs with zero critical errors.

2. AI-Generated Weekly & Monthly Reports  
   – NLP engine (GPT-based) summarizes top movements, drivers, and sentiment.  
   – Reports auto-published every Monday (weekly) and 1st of month (monthly).  
   – Acceptance: ≤ 1 hr generation time; human spot-check error rate < 3 %.

3. Area & Complex Search with Filters  
   – Query by district, neighborhood, subway line, year built, size band, price band.  
   – Sorting: latest deal, median price, YoY growth, transaction count.  
   – Acceptance: < 1 s response for 95 % queries.

4. Interactive Visualization  
   – Line, bar, heat-map, and scatter charts for prices, volume, and YoY %.  
   – Hover tooltips, zoom, and export (PNG, PDF, CSV).  
   – Accessibility: WCAG 2.1 AA color contrast.

5. Responsive Web & Mobile UI  
   – Built with Next.js, Tailwind CSS, and responsive grid.  
   – 100 % Lighthouse PWA score on performance & accessibility for top pages.

6. Subscription & Alert System  
   – Email and KakaoTalk opt-in.  
   – Frequency selection: weekly, monthly, or custom threshold (e.g., +5 % price rise).  
   – Double-opt-in with GDPR-compliant consent.  

### Supporting Features  
• User dashboard saving favorite districts and complexes.  
• Role-based admin panel for data QA and content scheduling.  
• SEO metadata and open-graph cards for social sharing.  
• Payment gateway (Stripe) for future premium tiers.

## 7. Non-Functional Requirements  
• Performance – 95 th percentile API latency < 300 ms; front-end FCP < 1.5 s.
• Observability OKR – SLO/SLI documentation maintained for latency and uptime; Grafana dashboards include legends for all critical metrics.
• Security – OAuth 2.0, TLS 1.3, OWASP Top 10 compliance, encrypted PII at rest.
• Security Runbook – Incident response timeline: detection (T+0), containment (T+15min), notification (T+60min). Maintain a list of all PII fields and specify encryption method (AES-256-GCM, kms-key-id=xxx).
• Usability – NPS ≥ 50; task success ≥ 90 % in usability tests.  
• Scalability – microservices deployable on Kubernetes; designed to handle 10× data growth.  
• Compatibility – Latest 2 versions of Chrome, Safari, Edge; iOS 15+, Android 11+.  
• Maintainability – 80 % unit-test coverage; CI/CD with automated linting.

## 8. Technical Considerations  
• Architecture – Next.js SSR/ISR front-end deployed on Vercel, Node.js back-end APIs, Python ETL & AI microservice, Supabase (PostgreSQL) for relational data and object storage.
• MLOps & PromptOps – Model and prompt versions are tracked with Git tags and MLflow. Each report includes "model_hash" and "prompt_hash" in its metadata for traceability.
• Data Sources – Government open APIs, KB Bank datasets, certified brokerage feeds.  
• AI Stack – OpenAI GPT-4 via Azure OpenAI, fallback to in-house fine-tuned Llama.  
• Visualization – D3.js & Recharts.  
• Infrastructure – Vercel for front-end hosting and edge functions; Supabase for managed PostgreSQL, authentication, and storage; Terraform IaC for non-managed resources.
• Third-Party – Stripe, KakaoTalk API, Sentry for monitoring, Segment for analytics.  
• Data Governance – daily checksum verification; GDPR & Korea PIPA compliance; audit logs retained 5 years.
• Data SLA & Cost Model –
  – Table: "데이터 소스 | 호출 빈도 | 월 API 비용 | Fallback" to be maintained in technical documentation.
  – Monthly AWS cost estimate and 12-month cash flow projection to be prepared and tracked against KPI spend efficiency.

## 9. Success Metrics & KPIs  
• Monthly Active Users (MAU)  
  Target: 50 K within 6 months; 150 K in year one.  
• Report Engagement  
  – Weekly report click-through ≥ 35 %.  
  – Scroll depth ≥ 70 % of article length.  
• Churn Rate  
  < 5 % monthly for subscribed users.  
• Data Accuracy  
  Transaction price deviation from official registry < 0.5 %.  
• Revenue  
  Premium conversion rate ≥ 3 % once paid tiers launch.  
• System Uptime  
  99.9 % monthly.

## 10. Timeline & Milestones  
Phase 0 – Discovery (Month 0)  
  • Market validation, legal review, data license sign-off.  

Phase 1 – MVP (Months 1-3)  
  • Core Features 1–4 delivered.  
  • Closed beta with 200 users.  
  • Phase exit criteria: MAU ≥ 1,000 and 7 consecutive days of 0 critical errors in the data pipeline (go/no-go gate).

Phase 2 – Public Launch (Months 4-6)  
  • Core Features 5–6, SEO, analytics, and basic dashboard.  
  • Marketing push; reach 10 K users.  

Phase 3 – Growth (Months 7-12)  
  • B2B API, payment integration, anomaly alerts.  
  • Begin premium subscription pilot.  

Phase 4 – Expansion (Year 2)  
  • Predictive pricing model, personalized recommendations, chatbot.  
  • Geographic expansion to satellite cities.
  • Geographic expansion to satellite cities.

## 11. Risks & Mitigation  
Technical  
• Data feed outage – build redundancy with two providers, nightly backups.  
• AI hallucination – human QA on 10 % of reports, factuality checker.  

Business  
• Regulatory changes on data privacy – maintain legal liaison and flexible anonymization pipeline.  
• Competitive response – maintain a reference matrix mapping all features of competing services; mark features unique to our platform. Replace AI 'insight' as a moat with a physical barrier such as 'data freshness <12h'.

Adoption  
• Users distrust AI content – publish methodology, provide raw data download, include expert commentary.  
• Low retention – implement progressive onboarding and personalized alerts.

## 12. Future Considerations  
• Predictive pricing model using Prophet/XGBoost/Deep Learning.  
## 13. Supplemental Sheets & Implementation Plans

### A. Detailed Cost, SLA, and License Sheet
- Maintain a separate sheet with columns: "Data Source | Call Frequency | Monthly API Cost | License Type | SLA | Fallback"
- Include links to license contracts/terms of use for each data/API provider; specify license renewal cycles
- Summarize total monthly/annual estimated costs, and define protocols for SLA violation response

### B. Phase-Gate Numerical Criteria
- Define clear, quantitative targets for the end of each phase: e.g., MAU, data quality (0 critical errors for 7 consecutive days), budget/expenditure rate, key KPI achievement
- Table and document go/no-go evaluation criteria for each phase

### C. Observability + Security Runbook Draft
- Observability: Maintain SLI/SLO documentation for core services, e.g., 95th percentile latency, error rate, uptime, etc.
- Set up Grafana/Prometheus monitoring dashboards with legends/alerts for all KPIs
- Security Runbook: Draft incident response timeline for each step (detect → contain → notify), on-call contact list, confirmed PII fields and encryption standards
- Specify regular tabletop exercises and Runbook update process
• LLM-powered real-estate chatbot with RAG on internal data.  
• Side-by-side comparison tool (district vs district, complex vs complex).  
• Volume/price anomaly detection with push alerts.  
• Public GraphQL API for enterprise clients.  
• Expert analyst commentary fused with AI summary.  
• Community Q&A forum to increase engagement.

