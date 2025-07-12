# Security Runbook

This document outlines the procedures for incident response and key rotation to ensure the security and integrity of the Estate platform.

## 1. Incident Response

### Overview

This section details the steps to be taken in the event of a security incident, from detection to resolution and post-incident analysis.

### Incident Response Timeline

-   **Detection (T+0)**: Initial identification of a security event or anomaly.
    -   Monitoring systems (e.g., Sentry, Grafana alerts) trigger notifications.
    -   Automated alerts are sent to the security team and on-call engineers.

-   **Containment (T+15min)**: Actions taken to limit the scope and impact of the incident.
    -   Isolate affected systems or services.
    -   Block malicious IPs or traffic patterns at the firewall/WAF level.
    -   Disable compromised accounts or credentials.
    -   Implement temporary fixes or workarounds to stop the attack.

-   **Eradication (T+X)**: Removal of the root cause of the incident.
    -   Identify and patch vulnerabilities.
    -   Remove malware or unauthorized access points.
    -   Rebuild compromised systems from trusted backups if necessary.

-   **Recovery (T+Y)**: Restoration of affected systems and services to normal operation.
    -   Restore data from clean backups.
    -   Verify system integrity and functionality.
    -   Monitor closely for any recurrence of the incident.

-   **Post-Incident Analysis (T+Z)**: Review of the incident to identify lessons learned and improve security posture.
    -   Conduct a root cause analysis.
    -   Document the incident, including timeline, actions taken, and impact.
    -   Identify and implement preventative measures.
    -   Update security policies and procedures as needed.

### On-Call Contact List

(To be filled with actual contact information for security team and relevant personnel)

### Confirmed PII Fields and Encryption Standards

-   **Email Addresses**: Encrypted using AES-256-GCM.
    -   KMS-managed keys are used for encryption key management.
-   (Add other PII fields as identified and their encryption methods)

## 2. Key Rotation

### Overview

Regular key rotation is crucial for maintaining the security of encrypted data. This section outlines the procedure for rotating encryption keys.

### Key Rotation Schedule

-   **Encryption Keys**: Rotate every 90 days.
-   **API Keys/Secrets**: Rotate as per service-specific policies, ideally every 90 days or upon compromise/personnel change.

### Key Rotation Procedure

1.  **Generate New Key**: Generate a new encryption key using a secure key management system (e.g., AWS KMS).
2.  **Update Configuration**: Update all relevant application configurations and environment variables with the new key.
3.  **Re-encrypt Data (if applicable)**: For data encrypted with the old key, re-encrypt it with the new key. This may involve a migration process.
4.  **Deprecate Old Key**: Mark the old key as deprecated but do not immediately delete it, allowing for decryption of older data if necessary.
5.  **Monitor**: Monitor systems to ensure that the new key is being used correctly and that there are no decryption failures.
6.  **Archive Old Key**: After a safe period (e.g., 1-2 rotation cycles) and confirmation that all data has been re-encrypted, archive the old key securely.

### Runbook Update Process

-   This runbook will be reviewed and updated quarterly or after any significant security incident or system change.
-   All updates must be approved by the security lead.
