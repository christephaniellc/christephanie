# Deployment Architecture

## CI/CD Pipeline & Deployment Strategy

```mermaid
graph TD
    subgraph "Development Workflow"
        DevLocal[👨‍💻 Local Development<br/>- yarn dev (frontend)<br/>- dotnet build (backend)<br/>- cdk deploy (infra)]
        Git[📚 Git Repository<br/>- Feature branches<br/>- Pull requests<br/>- Code reviews]
        Testing[🧪 Local Testing<br/>- yarn test:unit<br/>- dotnet test<br/>- End-to-end tests]
    end
    
    subgraph "Build Process"
        FrontendBuild[⚛️ Frontend Build<br/>- TypeScript compilation<br/>- Vite bundling<br/>- Asset optimization]
        BackendBuild[🏗️ Backend Build<br/>- .NET compilation<br/>- Lambda packaging<br/>- Dependency resolution]
        InfraBuild[🏛️ Infrastructure Build<br/>- CDK synthesis<br/>- CloudFormation templates<br/>- Resource validation]
    end
    
    subgraph "Deployment Environments"
        DevEnv[🧪 Development Environment<br/>- dev.wedding.Christephanie.com<br/>- Full feature testing<br/>- Integration validation]
        ProdEnv[🚀 Production Environment<br/>- wedding.Christephanie.com<br/>- Live wedding system<br/>- Performance monitoring]
    end
    
    subgraph "Deployment Steps"
        InfraDeploy[🏛️ Infrastructure Deployment<br/>- CDK deploy --all<br/>- CloudFormation stacks<br/>- Resource provisioning]
        BackendDeploy[⚙️ Backend Deployment<br/>- dotnet lambda deploy-function<br/>- Lambda function updates<br/>- API Gateway integration]
        FrontendDeploy[🌐 Frontend Deployment<br/>- S3 bucket upload<br/>- CloudFront invalidation<br/>- DNS propagation]
    end
    
    DevLocal --> Git
    Git --> Testing
    Testing --> FrontendBuild
    Testing --> BackendBuild
    Testing --> InfraBuild
    
    FrontendBuild --> DevEnv
    BackendBuild --> DevEnv
    InfraBuild --> DevEnv
    
    DevEnv --> |Manual Promotion| InfraDeploy
    InfraDeploy --> BackendDeploy
    BackendDeploy --> FrontendDeploy
    FrontendDeploy --> ProdEnv
    
    classDef devClass fill:#e3f2fd
    classDef buildClass fill:#f3e5f5
    classDef envClass fill:#e8f5e8
    classDef deployClass fill:#fff3e0
    
    class DevLocal,Git,Testing devClass
    class FrontendBuild,BackendBuild,InfraBuild buildClass
    class DevEnv,ProdEnv envClass
    class InfraDeploy,BackendDeploy,FrontendDeploy deployClass
```

## Infrastructure Deployment Sequence

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CDK as AWS CDK
    participant CF as CloudFormation
    participant AWS as AWS Services
    participant DNS as Route 53
    participant Verify as Verification
    
    Note over Dev,Verify: Phase 1: Certificate & DNS Setup
    
    Dev->>CDK: cdk deploy CertificateStack
    CDK->>CF: Create certificate stack
    CF->>AWS: Create ACM certificate
    AWS->>DNS: Validate domain ownership
    DNS-->>AWS: Domain validation complete
    AWS-->>CF: Certificate issued
    CF-->>CDK: Stack deployment complete
    CDK-->>Dev: Certificate stack ready
    
    Dev->>CDK: cdk deploy DnsStack
    CDK->>CF: Create DNS stack
    CF->>DNS: Create hosted zone & records
    DNS-->>CF: DNS configuration complete
    CF-->>CDK: DNS stack deployed
    CDK-->>Dev: DNS stack ready
    
    Note over Dev,Verify: Phase 2: Core Infrastructure
    
    Dev->>CDK: cdk deploy DatabaseStack
    CDK->>CF: Create database stack
    CF->>AWS: Create DynamoDB tables
    AWS->>AWS: Configure GSI indexes
    AWS-->>CF: Database resources ready
    CF-->>CDK: Database stack complete
    CDK-->>Dev: Database stack deployed
    
    Dev->>CDK: cdk deploy ParamsStack
    CDK->>CF: Create parameters stack
    CF->>AWS: Create SSM parameters
    AWS-->>CF: Parameters configured
    CF-->>CDK: Parameters stack complete
    CDK-->>Dev: Parameters ready
    
    Note over Dev,Verify: Phase 3: Security & Authorization
    
    Dev->>CDK: cdk deploy RoleStack
    CDK->>CF: Create IAM roles stack
    CF->>AWS: Create IAM roles & policies
    AWS-->>CF: Security configuration complete
    CF-->>CDK: Roles stack deployed
    CDK-->>Dev: Security ready
    
    Dev->>CDK: cdk deploy AuthStack
    CDK->>CF: Create auth stack
    CF->>AWS: Deploy Lambda authorizers
    AWS-->>CF: Auth functions deployed
    CF-->>CDK: Auth stack complete
    CDK-->>Dev: Authorization ready
    
    Note over Dev,Verify: Phase 4: API & Application Services
    
    Dev->>CDK: cdk deploy ApiStack
    CDK->>CF: Create API stack
    CF->>AWS: Create API Gateway
    CF->>AWS: Deploy Lambda functions
    AWS->>AWS: Configure API routes
    AWS-->>CF: API infrastructure ready
    CF-->>CDK: API stack deployed
    CDK-->>Dev: API services ready
    
    Note over Dev,Verify: Phase 5: Frontend & CDN
    
    Dev->>CDK: cdk deploy FrontendStack
    CDK->>CF: Create frontend stack
    CF->>AWS: Create S3 buckets
    CF->>AWS: Create CloudFront distribution
    AWS->>AWS: Configure CDN settings
    AWS-->>CF: Frontend infrastructure ready
    CF-->>CDK: Frontend stack deployed
    CDK-->>Dev: Frontend infrastructure ready
    
    Note over Dev,Verify: Phase 6: Application Deployment
    
    Dev->>Dev: Build frontend application
    Dev->>AWS: Upload assets to S3
    AWS-->>Dev: Assets uploaded
    Dev->>AWS: Invalidate CloudFront cache
    AWS-->>Dev: Cache invalidated
    
    Dev->>Verify: Test application endpoints
    Verify-->>Dev: All systems operational
```

## Environment Configuration Management

```mermaid
graph TB
    subgraph "Configuration Sources"
        LocalEnv[🏠 Local Environment<br/>- .env files<br/>- Development settings<br/>- Local test data]
        ParamStore[⚙️ AWS Parameter Store<br/>- Environment-specific configs<br/>- Secure credential storage<br/>- Runtime configuration]
        EnvVars[🌍 Environment Variables<br/>- Lambda function settings<br/>- Build-time configuration<br/>- Container settings]
    end
    
    subgraph "Development Environment"
        DevConfig[🧪 Dev Configuration<br/>- /Christephanie/dev/*<br/>- Test Auth0 tenant<br/>- Stripe test keys<br/>- Debug logging enabled]
        DevServices[🧪 Dev Services<br/>- dev.Christephanie.com<br/>- api-dev.Christephanie.com<br/>- Development DynamoDB tables]
    end
    
    subgraph "Production Environment"
        ProdConfig[🚀 Prod Configuration<br/>- /Christephanie/prod/*<br/>- Production Auth0 tenant<br/>- Stripe live keys<br/>- Error logging only]
        ProdServices[🚀 Prod Services<br/>- Christephanie.com<br/>- api.Christephanie.com<br/>- Production DynamoDB tables]
    end
    
    subgraph "Configuration Types"
        AuthConfig[🔑 Authentication Config<br/>- Auth0 domain & client ID<br/>- JWT audience settings<br/>- CORS origins]
        APIConfig[🔌 API Configuration<br/>- External service URLs<br/>- API rate limits<br/>- Timeout settings]
        DatabaseConfig[🗄️ Database Config<br/>- Table names<br/>- Index configurations<br/>- Connection settings]
        PaymentConfig[💳 Payment Config<br/>- Stripe publishable keys<br/>- Webhook secrets<br/>- Currency settings]
    end
    
    LocalEnv --> DevConfig
    ParamStore --> DevConfig
    ParamStore --> ProdConfig
    EnvVars --> DevServices
    EnvVars --> ProdServices
    
    DevConfig --> AuthConfig
    DevConfig --> APIConfig
    DevConfig --> DatabaseConfig
    DevConfig --> PaymentConfig
    
    ProdConfig --> AuthConfig
    ProdConfig --> APIConfig
    ProdConfig --> DatabaseConfig
    ProdConfig --> PaymentConfig
    
    AuthConfig --> DevServices
    APIConfig --> DevServices
    DatabaseConfig --> DevServices
    PaymentConfig --> DevServices
    
    AuthConfig --> ProdServices
    APIConfig --> ProdServices
    DatabaseConfig --> ProdServices
    PaymentConfig --> ProdServices
```

## Lambda Function Deployment Pipeline

```mermaid
graph LR
    subgraph "Source Code"
        SourceCode[📝 Lambda Source<br/>C# Project Files]
        Dependencies[📦 Dependencies<br/>NuGet Packages]
        Configuration[⚙️ Configuration<br/>aws-lambda-tools-defaults.json]
    end
    
    subgraph "Build Process"
        Compile[🔨 Compilation<br/>dotnet build]
        Package[📦 Packaging<br/>dotnet lambda package]
        Optimize[⚡ Optimization<br/>Trim unused code]
    end
    
    subgraph "Deployment"
        LambdaDeploy[🚀 Lambda Deploy<br/>dotnet lambda deploy-function]
        Versioning[📋 Versioning<br/>Function aliases & versions]
        Integration[🔗 API Integration<br/>API Gateway route updates]
    end
    
    subgraph "Verification"
        HealthCheck[❤️ Health Check<br/>Function invocation test]
        IntegrationTest[🧪 Integration Test<br/>End-to-end validation]
        Monitoring[📊 Monitoring<br/>CloudWatch metrics]
    end
    
    SourceCode --> Compile
    Dependencies --> Compile
    Configuration --> Package
    Compile --> Package
    Package --> Optimize
    
    Optimize --> LambdaDeploy
    LambdaDeploy --> Versioning
    Versioning --> Integration
    
    Integration --> HealthCheck
    HealthCheck --> IntegrationTest
    IntegrationTest --> Monitoring
```

## Frontend Deployment Pipeline

```mermaid
graph TB
    subgraph "Source Preparation"
        ReactSource[⚛️ React Source Code<br/>TypeScript Components]
        Dependencies[📦 Node Dependencies<br/>yarn install]
        EnvConfig[🌍 Environment Config<br/>Build-time variables]
    end
    
    subgraph "Build Pipeline"
        TypeCheck[✅ Type Checking<br/>tsc --noEmit]
        Linting[🔍 Linting<br/>ESLint validation]  
        Testing[🧪 Unit Testing<br/>Jest test runner]
        Build[🏗️ Production Build<br/>Vite build process]
    end
    
    subgraph "Asset Optimization"
        Bundling[📦 Code Bundling<br/>Module optimization]
        CodeSplitting[✂️ Code Splitting<br/>Route-based chunks]
        AssetOptim[🖼️ Asset Optimization<br/>Image compression]
        PWAGeneration[📱 PWA Generation<br/>Service worker & manifest]
    end
    
    subgraph "Deployment"
        S3Upload[🪣 S3 Upload<br/>Static asset deployment]
        CFInvalidation[☁️ CloudFront Invalidation<br/>Cache purging]
        DNSPropagation[🌐 DNS Propagation<br/>Route 53 updates]
        HealthCheck[❤️ Health Check<br/>Endpoint validation]
    end
    
    ReactSource --> TypeCheck
    Dependencies --> TypeCheck
    EnvConfig --> Build
    
    TypeCheck --> Linting
    Linting --> Testing
    Testing --> Build
    
    Build --> Bundling
    Bundling --> CodeSplitting
    CodeSplitting --> AssetOptim
    AssetOptim --> PWAGeneration
    
    PWAGeneration --> S3Upload
    S3Upload --> CFInvalidation
    CFInvalidation --> DNSPropagation
    DNSPropagation --> HealthCheck
```

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Metrics"
        LambdaMetrics[⚡ Lambda Metrics<br/>- Invocation count<br/>- Duration<br/>- Error rate<br/>- Cold starts]
        APIMetrics[🚪 API Gateway Metrics<br/>- Request count<br/>- Latency<br/>- Error responses<br/>- Throttling events]
        DatabaseMetrics[🗄️ DynamoDB Metrics<br/>- Read/write capacity<br/>- Throttled requests<br/>- Hot partitions<br/>- Item sizes]
    end
    
    subgraph "Infrastructure Metrics"
        CloudFrontMetrics[☁️ CloudFront Metrics<br/>- Cache hit ratio<br/>- Origin requests<br/>- Error rate<br/>- Geographic distribution]
        S3Metrics[🪣 S3 Metrics<br/>- Request count<br/>- Error rate<br/>- Storage utilization<br/>- Data transfer]
    end
    
    subgraph "Business Metrics"
        RSVPMetrics[👤 RSVP Metrics<br/>- Response rate<br/>- Completion time<br/>- Form abandonment<br/>- Guest engagement]
        PaymentMetrics[💳 Payment Metrics<br/>- Transaction success rate<br/>- Average gift amount<br/>- Payment method usage<br/>- Failed transactions]
    end
    
    subgraph "Alerting & Notifications"
        CloudWatchAlarms[🚨 CloudWatch Alarms<br/>- Error rate thresholds<br/>- Latency alerts<br/>- Resource utilization<br/>- Custom metrics]
        SNSNotifications[📧 SNS Notifications<br/>- Email alerts<br/>- SMS notifications<br/>- Slack integration<br/>- Escalation rules]
    end
    
    subgraph "Logging & Tracing"
        CloudWatchLogs[📊 CloudWatch Logs<br/>- Lambda function logs<br/>- API Gateway logs<br/>- Application errors<br/>- Structured logging]
        XRayTracing[🔍 X-Ray Tracing<br/>- Request tracing<br/>- Performance analysis<br/>- Dependency mapping<br/>- Error analysis]
    end
    
    LambdaMetrics --> CloudWatchAlarms
    APIMetrics --> CloudWatchAlarms
    DatabaseMetrics --> CloudWatchAlarms
    CloudFrontMetrics --> CloudWatchAlarms
    S3Metrics --> CloudWatchAlarms
    
    RSVPMetrics --> CloudWatchAlarms
    PaymentMetrics --> CloudWatchAlarms
    
    CloudWatchAlarms --> SNSNotifications
    
    LambdaMetrics --> CloudWatchLogs
    APIMetrics --> CloudWatchLogs
    CloudWatchLogs --> XRayTracing
```

## Disaster Recovery & Backup Strategy

```mermaid
graph LR
    subgraph "Data Backup"
        DynamoBackup[🗄️ DynamoDB Backup<br/>- Point-in-time recovery<br/>- Daily automated backups<br/>- Cross-region replication<br/>- 35-day retention]
        S3Versioning[🪣 S3 Versioning<br/>- Object versioning enabled<br/>- Lifecycle policies<br/>- Cross-region replication<br/>- Glacier archiving]
        ConfigBackup[⚙️ Configuration Backup<br/>- Parameter Store backup<br/>- IAM policy backup<br/>- Infrastructure as Code<br/>- Git repository backup]
    end
    
    subgraph "Recovery Procedures"
        DataRecovery[📊 Data Recovery<br/>- DynamoDB restore<br/>- S3 object recovery<br/>- Configuration restore<br/>- Validation procedures]
        InfraRecovery[🏛️ Infrastructure Recovery<br/>- CDK re-deployment<br/>- DNS failover<br/>- Certificate renewal<br/>- Service restoration]
        AppRecovery[⚛️ Application Recovery<br/>- Frontend re-deployment<br/>- Lambda re-deployment<br/>- Cache invalidation<br/>- End-to-end testing]
    end
    
    subgraph "Business Continuity"
        FailoverPlan[🔄 Failover Plan<br/>- Automated failover<br/>- Manual intervention<br/>- Communication plan<br/>- Recovery timeline]
        TestingSchedule[🧪 Testing Schedule<br/>- Monthly DR tests<br/>- Recovery validation<br/>- Documentation updates<br/>- Team training]
    end
    
    DynamoBackup --> DataRecovery
    S3Versioning --> DataRecovery
    ConfigBackup --> DataRecovery
    
    DataRecovery --> InfraRecovery
    InfraRecovery --> AppRecovery
    
    AppRecovery --> FailoverPlan
    FailoverPlan --> TestingSchedule
    TestingSchedule --> DynamoBackup
```