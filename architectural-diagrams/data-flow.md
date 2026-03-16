# Data Flow Diagrams

## RSVP User Journey Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant CF as CloudFront
    participant AG as API Gateway
    participant LA as Lambda Authorizer
    participant GL as Guest Lambda
    participant DB as DynamoDB
    participant S3 as S3 Bucket
    participant Email as SES Email
    
    Note over U,Email: Initial Access & Authentication
    U->>F: Access wedding website
    F->>CF: Request static assets
    CF-->>F: Serve cached assets from S3
    
    U->>F: Enter invitation code
    F->>AG: POST /guest/find {invitationCode}
    AG->>LA: Validate request (public endpoint)
    LA-->>AG: Allow anonymous access
    AG->>GL: Route to User.Find Lambda
    GL->>DB: Query guest by invitation code
    DB-->>GL: Return guest family data
    GL-->>AG: Guest family information
    AG-->>F: JSON response with guest details
    F->>F: Store guest data in Recoil state
    F-->>U: Display welcome message with names
    
    Note over U,Email: Authentication Flow
    U->>F: Click "Continue to RSVP"
    F->>F: Redirect to Auth0 login
    F->>F: Complete Auth0 authentication
    F->>F: Store JWT token
    
    Note over U,Email: RSVP Form Completion
    U->>F: Fill out RSVP form
    F->>F: Validate form data locally
    U->>F: Submit RSVP responses
    
    F->>AG: PATCH /guest/family {rsvpData, jwt}
    AG->>LA: Validate JWT token
    LA->>LA: Verify with Auth0
    LA-->>AG: Allow with user context
    AG->>GL: Route to FamilyUnit.Patch Lambda
    GL->>GL: Validate business rules
    GL->>DB: Update family RSVP status
    DB-->>GL: Confirm update
    GL->>GL: Prepare email notification
    GL->>Email: Send RSVP confirmation email
    Email-->>GL: Email sent confirmation
    GL-->>AG: Success response
    AG-->>F: JSON success response
    F->>F: Update UI to show confirmation
    F-->>U: Display "RSVP Submitted" message
    
    Note over U,Email: Profile Updates
    U->>F: Edit contact information
    F->>AG: PATCH /guest {profileData, jwt}
    AG->>LA: Validate JWT token
    LA-->>AG: Allow with user context
    AG->>GL: Route to Guest.Patch Lambda
    GL->>GL: Validate profile data
    GL->>DB: Update guest profile
    DB-->>GL: Confirm update
    GL-->>AG: Success response
    AG-->>F: Updated profile data
    F->>F: Update local state
    F-->>U: Show updated information
```

## Admin Family Management Data Flow

```mermaid
sequenceDiagram
    participant A as Admin User
    participant F as Frontend
    participant AG as API Gateway
    participant LA as Lambda Authorizer
    participant AL as Admin Lambda
    participant DB as DynamoDB
    participant S3 as S3 Setup Bucket
    participant Email as SES Email
    
    Note over A,Email: Admin Authentication
    A->>F: Access admin interface
    F->>F: Redirect to Auth0 with admin scope
    F->>F: Complete authentication
    F->>F: Verify admin role in JWT
    
    Note over A,Email: Bulk Family Upload
    A->>F: Upload CSV family data
    F->>F: Parse and validate CSV
    F->>S3: Upload CSV to setup bucket
    S3-->>F: Upload confirmation
    
    F->>AG: POST /admin/setup {csvS3Key, jwt}
    AG->>LA: Validate JWT token
    LA->>LA: Verify admin role
    LA-->>AG: Allow with admin context
    AG->>AL: Route to Admin.Setup Lambda
    AL->>S3: Download CSV from setup bucket
    S3-->>AL: Return CSV data
    AL->>AL: Parse and validate CSV data
    
    loop For each family in CSV
        AL->>AL: Create family unit object
        AL->>AL: Generate invitation codes
        AL->>DB: Insert family unit record
        DB-->>AL: Confirm insertion
    end
    
    AL->>Email: Send invitation emails
    Email-->>AL: Email delivery confirmations
    AL-->>AG: Bulk import summary
    AG-->>F: JSON response with results
    F-->>A: Display import results
    
    Note over A,Email: Individual Family Management
    A->>F: Search for specific family
    F->>AG: GET /admin/families?search={term}
    AG->>LA: Validate admin JWT
    LA-->>AG: Allow admin access
    AG->>AL: Route to Admin.FamilyUnit.Get Lambda
    AL->>DB: Query families by search term
    DB-->>AL: Return matching families
    AL-->>AG: Family search results
    AG-->>F: JSON family list
    F-->>A: Display family list
    
    A->>F: Edit family details
    F->>AG: PUT /admin/family/{id} {familyData, jwt}
    AG->>LA: Validate admin JWT
    LA-->>AG: Allow admin access
    AG->>AL: Route to Admin.FamilyUnit.Update Lambda
    AL->>AL: Validate family data
    AL->>DB: Update family record
    DB-->>AL: Confirm update
    AL->>Email: Send update notification if needed
    Email-->>AL: Email confirmation
    AL-->>AG: Update success response
    AG-->>F: Updated family data
    F-->>A: Show updated information
```

## Payment Processing Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant AG as API Gateway
    participant LA as Lambda Authorizer
    participant PL as Payment Lambda
    participant DB as DynamoDB
    participant Stripe as Stripe API
    participant WH as Webhook Handler
    participant Email as SES Email
    
    Note over U,Email: Gift Payment Initiation
    U->>F: Navigate to registry/gift page
    F->>F: Display gift options
    U->>F: Select gift amount and details
    F->>F: Show Stripe payment form
    
    U->>F: Enter payment information
    F->>F: Create Stripe payment method
    F->>AG: POST /payments/intent {amount, guestId, jwt}
    AG->>LA: Validate JWT token
    LA-->>AG: Allow authenticated user
    AG->>PL: Route to Payments.Intent Lambda
    
    PL->>PL: Validate payment request
    PL->>Stripe: Create payment intent
    Stripe-->>PL: Return client_secret
    PL->>DB: Store payment intent record
    DB-->>PL: Confirm storage
    PL-->>AG: Payment intent response
    AG-->>F: JSON with client_secret
    
    F->>F: Initialize Stripe.js with client_secret
    U->>F: Confirm payment
    F->>Stripe: Submit payment to Stripe
    Stripe-->>F: Payment confirmation
    F-->>U: Show payment processing message
    
    Note over U,Email: Webhook Processing
    Stripe->>WH: POST webhook {payment_intent.succeeded}
    WH->>WH: Verify webhook signature
    WH->>DB: Update payment intent status
    DB-->>WH: Confirm status update
    WH->>DB: Create contribution record
    DB-->>WH: Confirm contribution creation
    WH->>Email: Send thank you email
    Email-->>WH: Email sent confirmation
    WH-->>Stripe: Webhook acknowledged
    
    Note over U,Email: Payment Status Check
    F->>AG: GET /payments/status/{intentId} {jwt}
    AG->>LA: Validate JWT token
    LA-->>AG: Allow authenticated user
    AG->>PL: Route to Payment Status Lambda
    PL->>DB: Query payment intent status
    DB-->>PL: Return current status
    PL-->>AG: Payment status response
    AG-->>F: JSON status update
    F->>F: Update UI with payment result
    F-->>U: Display payment confirmation
```

## Address Validation Data Flow

```mermaid
graph TD
    subgraph "User Input"
        UserForm[User enters address<br/>in contact form]
        FormValidation[Frontend validation<br/>Required fields check]
    end
    
    subgraph "API Processing"
        APIRequest[POST /validate/address<br/>with address data]
        AuthCheck[JWT token validation<br/>via Lambda Authorizer]
        ValidationLambda[Address Validation Lambda<br/>Business logic processing]
    end
    
    subgraph "External Validation"
        USPSClient[USPS API Client<br/>Address standardization]
        AddressNormalization[Address format normalization<br/>Street, City, State, ZIP]
        ValidationResult[Validation result processing<br/>Match confidence scoring]
    end
    
    subgraph "Response Processing"
        DatabaseLog[Log validation attempt<br/>to DynamoDB audit table]
        ResponseFormat[Format standardized response<br/>Original vs Corrected address]
        UIUpdate[Update frontend form<br/>with validated address]
    end
    
    UserForm --> FormValidation
    FormValidation --> APIRequest
    APIRequest --> AuthCheck
    AuthCheck --> ValidationLambda
    
    ValidationLambda --> USPSClient
    USPSClient --> AddressNormalization
    AddressNormalization --> ValidationResult
    
    ValidationResult --> DatabaseLog
    DatabaseLog --> ResponseFormat
    ResponseFormat --> UIUpdate
    
    ValidationResult --> |Cache for 24hrs| ValidationLambda
```

## Email Notification Data Flow

```mermaid
graph TB
    subgraph "Trigger Events"
        RSVPSubmit[RSVP Submission<br/>Guest completes RSVP]
        PaymentComplete[Payment Completion<br/>Gift payment processed]
        AdminAction[Admin Action<br/>Family data updates]
        SystemEvent[System Event<br/>Reminders, Updates]
    end
    
    subgraph "Email Processing Pipeline"
        EventCapture[Event Capture<br/>Lambda function receives trigger]
        TemplateSelection[Template Selection<br/>Choose appropriate email template]
        DataGathering[Data Gathering<br/>Collect personalization data]
        TemplateRendering[Template Rendering<br/>Merge data with HTML template]
    end
    
    subgraph "Delivery Management"
        SESClient[Amazon SES Client<br/>Email delivery service]
        DeliveryTracking[Delivery Tracking<br/>Track email status]
        DatabaseLogging[Database Logging<br/>Record email history]
    end
    
    subgraph "Email Templates"
        RSVPConfirmation[RSVP Confirmation<br/>Thank you + event details]
        PaymentThankYou[Payment Thank You<br/>Gift acknowledgment]
        AdminNotification[Admin Notification<br/>System updates]
        Reminder[Reminder Email<br/>Deadline notifications]
    end
    
    RSVPSubmit --> EventCapture
    PaymentComplete --> EventCapture
    AdminAction --> EventCapture
    SystemEvent --> EventCapture
    
    EventCapture --> TemplateSelection
    TemplateSelection --> DataGathering
    DataGathering --> TemplateRendering
    
    TemplateRendering --> RSVPConfirmation
    TemplateRendering --> PaymentThankYou
    TemplateRendering --> AdminNotification
    TemplateRendering --> Reminder
    
    RSVPConfirmation --> SESClient
    PaymentThankYou --> SESClient
    AdminNotification --> SESClient
    Reminder --> SESClient
    
    SESClient --> DeliveryTracking
    DeliveryTracking --> DatabaseLogging
```

## Real-time Data Synchronization

```mermaid
sequenceDiagram
    participant U1 as User 1 (Guest)
    participant U2 as User 2 (Admin)
    participant F1 as Frontend 1
    participant F2 as Frontend 2
    participant AG as API Gateway
    participant L as Lambda Functions
    participant DB as DynamoDB
    participant Cache as React Query Cache
    
    Note over U1,Cache: Concurrent User Scenario
    
    U1->>F1: Update RSVP information
    F1->>AG: PATCH /guest/family {updatedData}
    AG->>L: Process update request
    L->>DB: Update family record
    DB-->>L: Confirm update with timestamp
    L-->>AG: Success with updated data
    AG-->>F1: Return updated family data
    F1->>Cache: Update local cache
    F1-->>U1: Show updated information
    
    Note over U1,Cache: Admin views same data
    
    U2->>F2: View family management dashboard
    F2->>AG: GET /admin/families
    AG->>L: Fetch family data
    L->>DB: Query all families
    DB-->>L: Return family list with timestamps
    L-->>AG: Family data response
    AG-->>F2: JSON family list
    F2->>Cache: Cache family data
    F2-->>U2: Display current family list
    
    Note over U1,Cache: Cache Invalidation Strategy
    
    F1->>F1: Set cache stale time (5 minutes)
    F2->>F2: Set cache stale time (1 minute for admin)
    
    alt Cache Expired
        F2->>AG: Background refetch
        AG->>L: Get latest data
        L->>DB: Query updated records
        DB-->>L: Return fresh data
        L-->>AG: Latest family data
        AG-->>F2: Updated information
        F2->>Cache: Refresh cache
        F2->>F2: Update UI if data changed
    end
```