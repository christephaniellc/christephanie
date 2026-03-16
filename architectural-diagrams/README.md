# Christephanie Wedding System - Architectural Overview

## Project Summary
Christephanie is a comprehensive wedding management system built as a modern, cloud-native application under aggressive timeline constraints (Nov 2024 → July 2025 wedding). The system handles RSVP management, guest information, payment processing, and administrative functions with enterprise-grade architecture designed for future multi-tenant SaaS expansion.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI Joy) with custom theming
- **State Management**: Recoil for application state
- **Authentication**: Auth0 React SDK
- **Build Tool**: Vite with PWA support
- **Payment Integration**: Stripe React components
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM

### Backend
- **Language**: C# (.NET 8.0+)
- **Architecture**: Serverless Lambda functions
- **Pattern**: Command Query Responsibility Segregation (CQRS)
- **Validation**: FluentValidation
- **Dependency Injection**: Autofac
- **API Gateway**: AWS API Gateway v2 (HTTP API)
- **Authentication**: AWS Lambda custom authorizer with Auth0

### Infrastructure
- **Cloud Provider**: Amazon Web Services (AWS)
- **Infrastructure as Code**: AWS CDK (TypeScript)
- **Database**: Amazon DynamoDB
- **Content Delivery**: Amazon CloudFront
- **Static Hosting**: Amazon S3
- **Domain Management**: Route 53
- **SSL/TLS**: AWS Certificate Manager
- **Parameter Management**: AWS Systems Manager Parameter Store

### Third-Party Integrations
- **Authentication**: Auth0
- **Payments**: Stripe
- **Email**: Amazon SES
- **SMS**: Twilio
- **Address Validation**: USPS API

## System Architecture

### High-Level Architecture
The system follows a serverless, microservices architecture with clear separation of concerns:

1. **Frontend Layer**: React SPA served via CloudFront/S3
2. **API Gateway**: Central routing and authentication
3. **Lambda Functions**: Individual microservices for specific operations
4. **Data Layer**: DynamoDB tables for persistent storage
5. **External Services**: Third-party integrations for specialized functionality

### Key Design Patterns
- **CQRS**: Separate commands and queries for optimal performance
- **Event-Driven**: Asynchronous processing where appropriate
- **Microservices**: Domain-specific Lambda functions (25+ specialized functions)
- **API-First**: RESTful API design with OpenAPI documentation
- **Mobile-First**: Responsive design with progressive enhancement
- **Single-Table Design**: DynamoDB optimization with GSI indexes
- **Multi-Tenant Ready**: Architecture designed for SaaS expansion

### Security Architecture
- **Authentication**: Auth0 with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **API Security**: Lambda authorizers with fine-grained permissions
- **Data Security**: IAM roles with least-privilege access
- **Transport Security**: HTTPS everywhere with Certificate Manager
- **Input Validation**: Multiple layers of validation (client, API, database)

### Performance Characteristics
- **Scalability**: Auto-scaling Lambda functions with 1000+ concurrent users
- **Caching**: Multi-layer caching (CDN → Backend → Frontend) for <200ms response times
- **Database**: DynamoDB single-table design with GSI optimization
- **Bundle Size**: Code splitting and tree shaking for fast load times
- **PWA**: Service worker for offline functionality
- **Uptime**: 99.9% availability target with comprehensive monitoring

## Project Structure

```
Christephanie/
├── frontend/                 # React TypeScript SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route-based page components
│   │   ├── sections/       # Page section components  
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   ├── store/          # Recoil state management
│   │   ├── api/            # API client and types
│   │   └── theme/          # MUI theme configuration
│   └── package.json
├── backend/                 # C# Lambda functions
│   └── src/
│       ├── Wedding.Abstractions/     # Shared DTOs and interfaces
│       ├── Wedding.Common/           # Shared business logic
│       ├── Wedding.Common.Web/       # Web-specific utilities
│       ├── Wedding.Lambdas.*/        # Individual Lambda functions
│       └── Wedding.PublicApi/        # Legacy API (being phased out)
├── infra/                   # AWS CDK infrastructure
│   ├── stacks/             # CDK stack definitions
│   ├── lib/                # Shared infrastructure code
│   └── scripts/            # Deployment scripts
└── package.json            # Root package configuration
```

## Lambda Function Architecture

The backend consists of numerous specialized Lambda functions organized by domain:

### Admin Functions
- **FamilyUnit.Create/Update/Delete/Get**: Family management
- **Configuration.Invitation**: Photo and design configuration
- **Setup**: Initial system setup

### Guest Functions  
- **FamilyUnit.Get/Update/Patch**: Guest family information
- **Guest.Patch**: Individual guest updates
- **Guest.MaskedValues.Get**: Privacy-protected guest data

### Payment Functions
- **Payments.Intent**: Stripe payment intent creation
- **Payments.Intent.Confirm**: Payment confirmation webhooks
- **Payments.Contributions**: Gift contribution tracking

### Validation Functions
- **Validate.Address**: USPS address validation
- **Validate.Email/Phone**: Contact validation
- **Verify.Email**: Email verification workflow

### Utility Functions
- **Authorize**: Custom API Gateway authorizer
- **Health**: System health checks
- **Stats.Get**: Analytics and reporting
- **Notify.Email**: Email notification system

## Database Schema

### Primary Tables
1. **Guests Table**: Family units and individual guest information
2. **Design Configuration**: UI customization and photo management  
3. **Payment Intents**: Stripe payment tracking
4. **Email Tracking**: Notification delivery logs

### Key Indexes
- **GuestIdIndex**: Quick guest lookups
- **InvitationCodeIndex**: RSVP code resolution
- **PaymentStatusIndex**: Payment state queries

## Deployment Pipeline

### Environments
- **Development**: Full feature testing environment
- **Production**: Live wedding system

### Infrastructure Stacks
1. **Certificate Stack**: SSL/TLS certificates
2. **DNS Stack**: Route 53 hosted zone and records
3. **Database Stack**: DynamoDB tables and indexes
4. **Auth Stack**: Lambda authorizers and IAM roles
5. **API Stack**: API Gateway and Lambda integrations
6. **Frontend Stack**: S3 buckets and CloudFront distribution
7. **Parameter Stack**: Systems Manager parameters
8. **Throttle Stack**: Rate limiting configuration

### Deployment Process
1. Infrastructure deployment via CDK
2. Lambda function deployment via .NET CLI
3. Frontend build and S3 deployment
4. CloudFront invalidation for cache updates

This architecture provides a scalable, secure, and maintainable solution for wedding management with excellent user experience and operational efficiency.