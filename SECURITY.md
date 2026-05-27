# Security Policy

## Supported Versions

FISCMAK is in pre-release (currently `0.1.0`). Only the latest patch release in the `0.1.x` line receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

If you believe you have found a security vulnerability in FISCMAK, please report it privately. **Do not open a public GitHub issue for security reports.**

### How to report

Email **[fiscmak@outlook.com](mailto:fiscmak@outlook.com)** with the subject line:

`Security Report: FISCMAK`

### What to include

- A clear description of the issue and the affected component (e.g. auth, API route, Supabase RLS)
- Steps to reproduce, including any minimal proof-of-concept
- Potential impact (confidentiality, integrity, availability, or user data exposure)
- Affected version (e.g. `0.1.0`) and environment (local, staging, production)

### Sensitive data

FISCMAK handles career and health-adjacent information. **Do not include real PHI, PII, or production user data in your report.** Use synthetic or redacted examples only.

### What to expect

- **Acknowledgment** within **3 business days** of receipt
- **Status updates** at least every **7 days** while the issue is under investigation
- A final disposition once triage is complete

### If the report is accepted

We will work on a fix on a timeline appropriate to severity (critical issues are prioritized). We may coordinate disclosure timing with you. **Credit in release notes or advisories is optional** and only with your consent (responsible disclosure).

### If the report is declined

We will explain why the report is out of scope or not actionable. Examples of out-of-scope findings include:

- Social engineering or phishing against users or staff
- Issues requiring physical access to a user's device or premises
- Vulnerabilities in third-party services outside FISCMAK's control (e.g. Supabase platform, Vercel, Anthropic API infrastructure), except where FISCMAK's integration misconfiguration clearly enables abuse

Thank you for helping keep FISCMAK and its users safe.
