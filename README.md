# Christephanie Wedding Platform

A serverless, full-stack event management platform built on AWS — designed and developed for our own wedding at [wedding.christephanie.com](https://wedding.christephanie.com).

What started as a wedding website became a production-grade SaaS-style system: multi-tenant architecture, role-based access control, OAuth 2.0 PKCE authentication, Stripe payment processing, and a fully automated CI/CD pipeline — all running serverless on AWS with sub-100ms API response times.

## Contributors

| | Role | Focus |
|---|---|---|
| **[@citymaus](https://github.com/citymaus)** (Steph) | Backend & Infrastructure | C# Lambda functions, DynamoDB schema design, AWS CDK infrastructure, CI/CD pipelines, Auth0 integration, API architecture |
| **[@iareintelligent](https://github.com/iareintelligent)** (Christopher) | Frontend Lead | React UI/UX, component architecture, responsive design, animations, Stripe frontend integration |

## Architecture Overview

```
                         CloudFront (CDN)
                              |
               +--------------+--------------+
               |                             |
          S3 (React SPA)              API Gateway (HTTP)
                                             |
                                    25+ Lambda Functions
                                     (C# / .NET 8.0)
                                             |
                              +--------------+--------------+
                              |              |              |
                          DynamoDB      Auth0 (OIDC)    Stripe
                       (Single-Table)                  (Payments)
```

**AWS Services:** Lambda, API Gateway, DynamoDB, S3, CloudFront, Route 53, ACM, CloudWatch, SES, SNS, SSM Parameter Store, Secrets Manager

[Click for detailed Architectural Diagrams](./architectural-diagrams/README.md)

![Architecture Overview](./architectural-diagrams/arch-overview.png)

## Tech Stack

### Backend — C# / .NET 8.0
- **25+ AWS Lambda functions** organized by domain (RSVP, Payments, Admin, Notifications, etc.)
- **CQRS pattern** with FluentValidation and Autofac DI
- **DynamoDB single-table design** with GSI pattern optimization
- **Auth0 JWT authorization** with role-based permissions and tenant isolation
- **Stripe webhooks** for payment processing
- **Twilio + SES** for email/SMS notifications
- Unit and integration test coverage with FluentAssertions

### Frontend — React 18 / TypeScript
- **Vite** build tooling with PWA support
- **Material UI** component library with custom theming
- **TanStack Query** for server state management, **Recoil** for client state
- **React Hook Form** for multi-step RSVP flows
- **Playwright** E2E tests, **Jest** unit tests (70% coverage threshold)
- Mobile-first responsive design

### Infrastructure — AWS CDK (TypeScript)
- **Multi-stack CDK deployment**: DNS, Certificates, Database, API, Frontend, Parameters
- **Dual-environment pipeline**: `main.dev` (dev) and `main` (prod)
- **GitHub Actions CI/CD** with OIDC authentication — smart Lambda change detection deploys only modified functions
- **CloudFront invalidation** on frontend deploys with cache-control optimization

## Key Features

- **RSVP Management** — Multi-step forms with family unit grouping, attendance tracking, dietary preferences, and camping logistics
- **Guest Admin Dashboard** — Full CRUD for family units, guest management, and event configuration
- **Gift Registry** — Stripe-powered contributions with webhook confirmation
- **Auth & Permissions** — Auth0 PKCE flow with role-based access (admin, guest, family unit lead)
- **Notifications** — Automated email (SES) and SMS (Twilio) for event updates and verification
- **Address Validation** — USPS address verification for invitation mailings
- **Analytics** — Event metrics and guest response statistics with Recharts visualizations

## Project Structure

```
christephanie/
  backend/src/           # C# Lambda functions + shared libraries (39 projects)
  frontend/src/          # React application
    components/          # 50+ feature-organized components
    pages/               # Route-level pages (RSVP, Admin, Profile, Stats, etc.)
    hooks/               # Custom React hooks
    api/                 # Generated API client (swagger-typescript-api)
  infra/                 # AWS CDK stacks (TypeScript)
  .github/workflows/     # CI/CD pipelines
  architectural-diagrams/ # Detailed architecture documentation
```

## Architecture Documentation

Detailed architectural documentation is available in [`/architectural-diagrams`](./architectural-diagrams/README.md), including system overview diagrams, AWS infrastructure details, data flow diagrams, and design decision rationale.

## Local Development

```bash
# Frontend
cd frontend && yarn install && yarn dev

# Backend
cd backend/src && dotnet build

# Infrastructure
cd infra && npm install && npx cdk synth
```

## License

This project is source-available for portfolio and reference purposes. Not licensed for reuse.
