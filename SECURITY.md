# Security Policy

## 1. Overview

Security is a fundamental priority for the **Pharmacy E-Commerce & Management Platform**. We handle sensitive pharmaceutical product data, customer orders, medical transactions, and personal user information. This document outlines our security policies, supported versions, safeguards implemented across the platform, and the procedure for responsibly disclosing vulnerabilities.

---

## 2. Supported Versions

We actively provide security patches and updates for the following versions:

| Version             |     Supported      | Status                                                 |
| :------------------ | :----------------: | :----------------------------------------------------- |
| **1.0.x (Current)** | :white_check_mark: | Actively supported with security updates and bug fixes |
| **< 1.0.0**         |        :x:         | Unsupported                                            |

---

## 3. Implemented Security Controls

Our application incorporates defense-in-depth security principles across both frontend and backend layers:

### Authentication & Session Security

- **Dual-Token System**: Short-lived JWT Access Tokens (15 minutes) kept in memory; Refresh Tokens (7 days) stored exclusively in `HttpOnly`, `Secure`, `SameSite=Strict/Lax` cookies.
- **Refresh Token Rotation & Revocation**: Every refresh request rotates the token in the database. Active sessions can be invalidated globally (`POST /api/auth/logout-all`).
- **Device Fingerprinting**: Refresh tokens are tied to user-agent device info to detect session hijacking.
- **Password Complexity**: Enforces strong passwords (minimum 8 characters, uppercase, lowercase, numbers, and special characters) hashed with bcrypt.

### Authorization & RBAC

- **Strict Role-Based Access Control**: Middleware verifies roles (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_CUSTOMER`) before granting access to sensitive admin dashboards, user modification, and order state updates.
- **Resource Ownership Validation**: Users can only query and mutate their own cart, orders, and profile records.

### Network & Data Protection

- **HTTP Security Headers**: `helmet` is enabled to mitigate clickjacking, MIME-sniffing, and cross-site scripting (XSS).
- **Input Sanitization & Schema Validation**: Incoming payloads are sanitized against malicious script tags (`sanitizeInput`) and strictly validated with Zod schemas.
- **CORS Whitelisting**: Strict origin whitelisting matching production frontend domains (`CLIENT_URL`).
- **SQL Injection Prevention**: All database interactions use Prisma ORM with parameterized queries.
- **Rate Limiting**: Global limit (300 requests / 15 mins) with strict per-IP rate limiters on authentication endpoints to prevent brute-force attacks.

### Payment & Transaction Integrity

- **Server-Side Price Calculation**: Order totals and line-item prices are strictly computed on the backend from verified database prices to prevent client-side price tampering.
- **Payment Verification**: VNPay transactions require cryptographic hash validation (`vnp_SecureHash`) before order payment status is marked as `PAID`.
- **Database Concurrency**: Concurrency-safe atomic transactions (`$transaction`) prevent double-spending and negative inventory states.

---

## 4. Reporting a Vulnerability

We appreciate the efforts of security researchers and community members in keeping this project secure.

If you discover a security vulnerability, **please do not disclose it publicly or open a public GitHub issue**. Instead, follow the responsible disclosure process below:

### How to Report

Send an email to the maintainer with details:

- **Email:** `giaphien1008@gmail.com`
- **Subject:** `[SECURITY VULNERABILITY] Pharmacy Platform - <Brief Title>`

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:

1. **Description:** A detailed explanation of the vulnerability and its potential impact.
2. **Steps to Reproduce:** Clear, step-by-step instructions or Proof of Concept (PoC) code/requests.
3. **Affected Endpoints/Files:** Specific URLs, parameters, or code paths involved.
4. **Suggested Mitigation (if known):** Any proposed patches or configuration changes.

---

## 5. Vulnerability Response Timeline

When a report is received, you can expect:

- **Initial Acknowledgement:** Within **48 hours** confirming receipt of your report.
- **Assessment & Triage:** Within **3–5 business days** with an initial severity rating and reproduction status.
- **Remediation & Patching:** High-severity vulnerabilities will be patched promptly in a private branch and deployed to production.
- **Public Disclosure:** Coordinated disclosure after the patch has been verified and deployed.

---

## 6. Self-Hosting Security Checklist

If you are deploying this system in a self-hosted or production environment, ensure the following checklist is completed:

- [ ] Change all default secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `VNP_HASH_SECRET`).
- [ ] Set `NODE_ENV=production` in the backend environment.
- [ ] Configure HTTPS / SSL certificates across all public domains.
- [ ] Set `CLIENT_URL` strictly to your production frontend URL (never use `*` wildcard in CORS).
- [ ] Protect PostgreSQL and Redis instances behind a private VPC or firewall.
- [ ] Regularly run automated test suites (`npm test`) before pushing changes.
