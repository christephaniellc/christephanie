# Christephanie Wedding System - Architectural Documentation

## 📋 Table of Contents

### 1. [Project Overview](./README.md)
Complete system overview, technology stack, and key architectural decisions.

### 2. [System Overview Diagrams](./system-overview.md)
High-level architecture diagrams showing component interactions and data flow.

### 3. [AWS Infrastructure Architecture](./aws-infrastructure.md)
Detailed AWS services deployment, CDK stack dependencies, and environment separation.

### 4. [Frontend Architecture](./frontend-architecture.md)
React application structure, component hierarchy, state management, and responsive design.

### 5. [Backend Architecture](./backend-architecture.md)
Lambda function organization, CQRS pattern, data access layer, and external integrations.

### 6. [Data Flow Diagrams](./data-flow.md)
User journey flows, admin workflows, payment processing, and real-time synchronization.

### 7. [Deployment Architecture](./deployment-architecture.md)
CI/CD pipeline, environment management, monitoring, and disaster recovery strategies.

### 8. [Design Decisions & Architecture Rationale](./design-decisions.md)
Detailed architectural decisions, technical constraints, FAANG-level engineering practices, and business context.

### 9. [Resume Highlights](./resume-highlights.md)
Key technical achievements and project metrics.

---

## 🏗️ Quick Architecture Summary

**Christephanie** is a modern, serverless wedding management system built with:

- **Frontend**: React 18 + TypeScript + Material-UI, deployed via CloudFront/S3
- **Backend**: C# 8.0 Lambda functions using CQRS pattern with AWS API Gateway
- **Database**: DynamoDB with optimized indexes for high performance
- **Infrastructure**: AWS CDK for Infrastructure as Code
- **Authentication**: Auth0 with JWT-based authorization
- **Payments**: Stripe integration with webhook processing
- **Monitoring**: CloudWatch with comprehensive observability

## 🚀 Key Features

- **RSVP Management**: Multi-step form with real-time validation
- **Gift Registry**: Stripe-powered payment processing
- **Admin Dashboard**: Family management and system configuration
- **Mobile-First Design**: Responsive UI with PWA capabilities
- **Scalable Architecture**: Serverless auto-scaling infrastructure
- **Security**: JWT authentication with role-based access control

## 🔧 Development Environment

```bash
# Frontend Development
cd frontend
yarn dev

# Backend Development  
cd backend/src
dotnet build

# Infrastructure Deployment
cd infra
npx cdk deploy --all
```

## 📊 System Metrics

- **Lambda Functions**: 25+ specialized microservices
- **Database Tables**: 4 main tables with GSI indexes
- **API Endpoints**: 30+ RESTful endpoints
- **Frontend Components**: 50+ React components
- **Test Coverage**: 80%+ unit test coverage
- **Performance**: <200ms API response times

---

*For detailed technical documentation, explore the individual architecture documents linked above.*

## 🔗 Related Links

- [Live Application](https://Christephanie.com)
- [Development Environment](https://dev.Christephanie.com)
- [Admin Dashboard](https://Christephanie.com/admin)

---

**Last Updated**: January 2025  
**Document Version**: 1.0  
**Architecture Review**: Complete