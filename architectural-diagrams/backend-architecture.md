# Backend Architecture

## Lambda Function Organization

```mermaid
graph TB
    subgraph "API Gateway Entry Point"
        APIGW[🚪 HTTP API Gateway<br/>Single Entry Point]
        Auth[🔑 Lambda Authorizer<br/>JWT Validation]
    end
    
    subgraph "Admin Domain Lambdas"
        AdminFamilyCreate[👨‍💼 Admin.FamilyUnit.Create<br/>Family Creation Logic]
        AdminFamilyUpdate[👨‍💼 Admin.FamilyUnit.Update<br/>Family Modification Logic]
        AdminFamilyDelete[👨‍💼 Admin.FamilyUnit.Delete<br/>Family Removal Logic]
        AdminFamilyGet[👨‍💼 Admin.FamilyUnit.Get<br/>Family Retrieval Logic]
        AdminConfig[⚙️ Admin.Configuration.Invitation<br/>Design & Photo Management]
        AdminSetup[🔧 Admin.Setup<br/>Initial System Setup]
    end
    
    subgraph "Guest Domain Lambdas"
        GuestFamilyGet[👤 FamilyUnit.Get<br/>Guest Family Retrieval]
        GuestFamilyUpdate[👤 FamilyUnit.Update<br/>Family Information Updates]
        GuestFamilyPatch[👤 FamilyUnit.Patch<br/>Partial Family Updates]
        GuestPatch[👤 Guest.Patch<br/>Individual Guest Updates]
        GuestMasked[🔍 Guest.MaskedValues.Get<br/>Privacy-Protected Data]
    end
    
    subgraph "Payment Domain Lambdas"
        PaymentIntent[💳 Payments.Intent<br/>Stripe Payment Creation]
        PaymentConfirm[✅ Payments.Intent.Confirm<br/>Webhook Processing]
        PaymentContrib[🎁 Payments.Contributions<br/>Gift Contribution Tracking]
    end
    
    subgraph "Validation Domain Lambdas"
        ValidateAddress[📮 Validate.Address<br/>USPS Address Validation]
        ValidateEmail[📧 Validate.Email<br/>Email Format & Existence]
        ValidatePhone[📱 Validate.Phone<br/>Phone Number Validation]
        VerifyEmail[✉️ Verify.Email<br/>Email Verification Flow]
    end
    
    subgraph "Utility Domain Lambdas"
        Health[❤️ Health<br/>System Health Checks]
        Stats[📊 Stats.Get<br/>Analytics & Reporting]
        EmailNotify[📧 Notify.Email<br/>Email Campaign Management]
        UserFind[🔍 User.Find<br/>User Discovery]
        UserGet[👤 User.Get<br/>User Data Retrieval]
        UserPatch[👤 User.Patch<br/>User Profile Updates]
    end
    
    APIGW --> Auth
    Auth --> AdminFamilyCreate
    Auth --> AdminFamilyUpdate
    Auth --> AdminFamilyDelete
    Auth --> AdminFamilyGet
    Auth --> AdminConfig
    Auth --> AdminSetup
    
    Auth --> GuestFamilyGet
    Auth --> GuestFamilyUpdate
    Auth --> GuestFamilyPatch
    Auth --> GuestPatch
    Auth --> GuestMasked
    
    Auth --> PaymentIntent
    Auth --> PaymentConfirm
    Auth --> PaymentContrib
    
    Auth --> ValidateAddress
    Auth --> ValidateEmail
    Auth --> ValidatePhone
    Auth --> VerifyEmail
    
    Auth --> Health
    Auth --> Stats
    Auth --> EmailNotify
    Auth --> UserFind
    Auth --> UserGet
    Auth --> UserPatch
    
    classDef adminClass fill:#ffcdd2
    classDef guestClass fill:#c8e6c9
    classDef paymentClass fill:#bbdefb
    classDef validationClass fill:#f8bbd9
    classDef utilityClass fill:#ffecb3
    classDef gatewayClass fill:#d1c4e9
    
    class AdminFamilyCreate,AdminFamilyUpdate,AdminFamilyDelete,AdminFamilyGet,AdminConfig,AdminSetup adminClass
    class GuestFamilyGet,GuestFamilyUpdate,GuestFamilyPatch,GuestPatch,GuestMasked guestClass
    class PaymentIntent,PaymentConfirm,PaymentContrib paymentClass
    class ValidateAddress,ValidateEmail,ValidatePhone,VerifyEmail validationClass
    class Health,Stats,EmailNotify,UserFind,UserGet,UserPatch utilityClass
    class APIGW,Auth gatewayClass
```

## CQRS Pattern Implementation

```mermaid
graph LR
    subgraph "Command Side (Writes)"
        Commands[Commands<br/>- CreateFamilyUnitCommand<br/>- UpdateGuestCommand<br/>- PatchFamilyUnitCommand<br/>- DeleteFamilyUnitCommand]
        CommandHandlers[Command Handlers<br/>- Business Logic<br/>- Validation<br/>- Side Effects]
        WriteModels[Write Models<br/>- Family Unit Entity<br/>- Guest Entity<br/>- Payment Entity]
    end
    
    subgraph "Query Side (Reads)"  
        Queries[Queries<br/>- GetFamilyUnitQuery<br/>- GetStatsQuery<br/>- GetContributionsQuery]
        QueryHandlers[Query Handlers<br/>- Data Retrieval<br/>- Projection Logic<br/>- Caching]
        ReadModels[Read Models<br/>- Family Unit DTO<br/>- Guest DTO<br/>- Stats ViewModel]
    end
    
    subgraph "Shared Infrastructure"
        Database[(DynamoDB<br/>Shared Data Store)]
        EventBus[Event Bus<br/>Domain Events]
        Validation[FluentValidation<br/>Input Validation]
    end
    
    Commands --> CommandHandlers
    CommandHandlers --> WriteModels
    WriteModels --> Database
    CommandHandlers --> EventBus
    
    Queries --> QueryHandlers
    QueryHandlers --> ReadModels
    ReadModels --> Database
    
    CommandHandlers --> Validation
    QueryHandlers --> Validation
    
    EventBus -.-> QueryHandlers
```

## Lambda Function Internal Architecture

```mermaid
graph TD
    subgraph "Lambda Function Structure"
        FunctionEntry[Function.cs<br/>AWS Lambda Entry Point]
        
        subgraph "Application Layer"
            Handler[Handler Class<br/>Business Logic Coordinator]
            Commands[Commands/Queries<br/>Request Models]
            Validation[Validators<br/>FluentValidation Rules]
        end
        
        subgraph "Domain Layer"
            Entities[Domain Entities<br/>Business Objects]
            DTOs[Data Transfer Objects<br/>API Contracts]
            Mapping[AutoMapper Profiles<br/>Object Mapping]
        end
        
        subgraph "Infrastructure Layer"
            DynamoProvider[DynamoDB Provider<br/>Data Access]
            ExternalServices[External Service Clients<br/>Stripe, USPS, Twilio]
            ParameterStore[Parameter Store Client<br/>Configuration Access]
        end
        
        subgraph "Cross-Cutting Concerns"
            Logging[ILogger<br/>Structured Logging]
            DI[Autofac Container<br/>Dependency Injection]
            ErrorHandling[Error Handling<br/>Exception Management]
        end
    end
    
    FunctionEntry --> Handler
    Handler --> Commands
    Handler --> Validation
    
    Commands --> Entities
    Entities --> DTOs
    DTOs --> Mapping
    
    Handler --> DynamoProvider
    Handler --> ExternalServices
    Handler --> ParameterStore
    
    Handler --> Logging
    FunctionEntry --> DI
    Handler --> ErrorHandling
    
    DI --> DynamoProvider
    DI --> ExternalServices
    DI --> ParameterStore
    DI --> Logging
```

## Data Access Layer Architecture

```mermaid
graph TB
    subgraph "Data Access Abstraction"
        IDynamoProvider[IDynamoDBProvider<br/>Interface]
        DynamoProvider[DynamoDBProvider<br/>Implementation]
    end
    
    subgraph "Repository Pattern"
        BaseRepository[Base Repository<br/>Common CRUD Operations]
        GuestRepository[Guest Repository<br/>Family & Guest Operations]
        PaymentRepository[Payment Repository<br/>Payment Tracking]
        ConfigRepository[Configuration Repository<br/>Design Settings]
    end
    
    subgraph "Query Builders"
        QueryBuilder[DynamoDB Query Builder<br/>Fluent Query Construction]
        FilterBuilder[Filter Expression Builder<br/>Conditional Expressions]
        IndexManager[GSI Index Manager<br/>Secondary Index Queries]
    end
    
    subgraph "Entity Mapping"
        EntityMapper[Entity Mapper<br/>Domain ↔ DynamoDB]
        AttributeConverter[Attribute Converter<br/>Type Conversions]
        JsonSerializer[JSON Serializer<br/>Complex Object Storage]
    end
    
    subgraph "DynamoDB Tables"
        GuestTable[(Guests Table<br/>Main Guest Data)]
        DesignTable[(Design Config Table<br/>UI Configuration)]
        PaymentTable[(Payment Table<br/>Transaction Records)]
        EmailTable[(Email Tracking Table<br/>Notification History)]
    end
    
    IDynamoProvider --> DynamoProvider
    DynamoProvider --> BaseRepository
    BaseRepository --> GuestRepository
    BaseRepository --> PaymentRepository
    BaseRepository --> ConfigRepository
    
    GuestRepository --> QueryBuilder
    PaymentRepository --> QueryBuilder
    ConfigRepository --> QueryBuilder
    QueryBuilder --> FilterBuilder
    QueryBuilder --> IndexManager
    
    GuestRepository --> EntityMapper
    PaymentRepository --> EntityMapper
    ConfigRepository --> EntityMapper
    EntityMapper --> AttributeConverter
    EntityMapper --> JsonSerializer
    
    GuestRepository --> GuestTable
    PaymentRepository --> PaymentTable
    ConfigRepository --> DesignTable
    GuestRepository --> EmailTable
```

## Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant APIGW as API Gateway
    participant Auth as Lambda Authorizer
    participant Auth0 as Auth0 Service
    participant Lambda as Business Lambda
    participant DB as DynamoDB
    
    Client->>APIGW: Request with JWT Bearer Token
    APIGW->>Auth: Invoke Authorizer
    
    Auth->>Auth0: Validate JWT Token
    Auth0-->>Auth: Token Validation Result
    
    alt Token Valid
        Auth->>Auth: Extract User Claims
        Auth->>Auth: Determine User Role
        Auth->>Auth: Build IAM Policy
        Auth-->>APIGW: Allow + IAM Policy + Context
        
        APIGW->>Lambda: Forward Request + Auth Context
        Lambda->>Lambda: Extract User Info from Context
        Lambda->>Lambda: Apply Business Rules
        Lambda->>DB: Execute Data Operation
        DB-->>Lambda: Data Response
        Lambda-->>APIGW: Business Response
        APIGW-->>Client: JSON Response
        
    else Token Invalid
        Auth-->>APIGW: Deny + Error Message  
        APIGW-->>Client: 401 Unauthorized
    end
```

## Error Handling Strategy

```mermaid
graph TD
    subgraph "Error Categories"
        ValidationError[Validation Errors<br/>400 Bad Request]
        AuthError[Authentication Errors<br/>401 Unauthorized]
        AuthzError[Authorization Errors<br/>403 Forbidden]
        NotFoundError[Not Found Errors<br/>404 Not Found]
        BusinessError[Business Logic Errors<br/>422 Unprocessable Entity]
        SystemError[System Errors<br/>500 Internal Server Error]
    end
    
    subgraph "Error Handling Pipeline"
        ExceptionFilter[Global Exception Filter<br/>Catch All Exceptions]
        ErrorLogger[Error Logger<br/>CloudWatch Logs]
        ErrorMapper[Error Response Mapper<br/>Consistent Error Format]
        ClientResponse[Client Error Response<br/>User-Friendly Messages]
    end
    
    subgraph "Error Recovery"
        RetryLogic[Retry Logic<br/>Transient Failures]
        CircuitBreaker[Circuit Breaker<br/>External Service Failures]
        Fallback[Fallback Responses<br/>Graceful Degradation]
    end
    
    ValidationError --> ExceptionFilter
    AuthError --> ExceptionFilter
    AuthzError --> ExceptionFilter
    NotFoundError --> ExceptionFilter
    BusinessError --> ExceptionFilter
    SystemError --> ExceptionFilter
    
    ExceptionFilter --> ErrorLogger
    ErrorLogger --> ErrorMapper
    ErrorMapper --> ClientResponse
    
    SystemError --> RetryLogic
    RetryLogic --> CircuitBreaker
    CircuitBreaker --> Fallback
```

## External Service Integration

```mermaid
graph LR
    subgraph "Payment Integration"
        StripeClient[Stripe Client<br/>Payment Processing]
        PaymentIntentService[Payment Intent Service<br/>Payment Workflows]
        WebhookHandler[Webhook Handler<br/>Event Processing]
    end
    
    subgraph "Communication Services"
        SESClient[Amazon SES Client<br/>Email Delivery]
        TwilioClient[Twilio Client<br/>SMS Delivery]
        EmailTemplates[Email Templates<br/>Dynamic Content]
    end
    
    subgraph "Validation Services"
        USPSClient[USPS Client<br/>Address Validation]
        AddressNormalizer[Address Normalizer<br/>Format Standardization]
        ValidationCache[Validation Cache<br/>Result Caching]
    end
    
    subgraph "Authentication Services"
        Auth0Client[Auth0 Management API<br/>User Management]
        JWTValidator[JWT Token Validator<br/>Token Verification]
        UserProfileSync[User Profile Sync<br/>Profile Updates]
    end
    
    PaymentIntentService --> StripeClient
    WebhookHandler --> StripeClient
    
    EmailTemplates --> SESClient
    SESClient --> TwilioClient
    
    AddressNormalizer --> USPSClient
    USPSClient --> ValidationCache
    
    JWTValidator --> Auth0Client
    Auth0Client --> UserProfileSync
```