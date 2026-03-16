# Frontend Architecture

## React Application Structure

```mermaid
graph TB
    subgraph "Application Root"
        App[App.tsx<br/>Main Application Component]
        Root[Root.tsx<br/>Provider Wrapper]
    end
    
    subgraph "Routing & Navigation"
        Router[React Router DOM<br/>Route Configuration]
        Routes[Route Definitions<br/>Public/Protected Routes]
    end
    
    subgraph "State Management"
        Recoil[Recoil State<br/>Global Application State]
        ReactQuery[TanStack React Query<br/>Server State & Caching]
        LocalState[Component Local State<br/>useState/useReducer]
    end
    
    subgraph "Authentication"
        Auth0Provider[Auth0 React Provider<br/>Authentication Context]
        AuthHooks[Custom Auth Hooks<br/>useAuth0Utils]
        AuthGuards[Route Protection<br/>PrivateRoute Components]
    end
    
    subgraph "UI Components"
        Pages[📄 Pages<br/>Route-based Components]
        Sections[📋 Sections<br/>Page Section Components]
        Components[🧩 Components<br/>Reusable UI Elements]
        MUI[Material-UI (Joy)<br/>Design System]
    end
    
    subgraph "Business Logic"
        Hooks[Custom Hooks<br/>Business Logic Abstraction]
        API[API Layer<br/>HTTP Client & Types]
        Utils[Utilities<br/>Helper Functions]
    end
    
    subgraph "Theme & Styling"
        ThemeProvider[MUI Theme Provider<br/>Design Tokens]
        StyledComponents[Styled Components<br/>Component-specific Styles]
        ResponsiveDesign[Responsive Design<br/>Mobile-first Approach]
    end
    
    Root --> App
    App --> Router
    App --> Auth0Provider
    App --> Recoil
    App --> ReactQuery
    App --> ThemeProvider
    
    Router --> Routes
    Routes --> Pages
    Pages --> Sections
    Sections --> Components
    Components --> MUI
    
    Auth0Provider --> AuthHooks
    AuthHooks --> AuthGuards
    AuthGuards --> Pages
    
    Pages --> Hooks
    Sections --> Hooks
    Components --> Hooks
    Hooks --> API
    Hooks --> Utils
    
    Recoil --> LocalState
    ReactQuery --> API
    
    ThemeProvider --> StyledComponents
    StyledComponents --> ResponsiveDesign
    MUI --> ResponsiveDesign
    
    classDef appClass fill:#e1f5fe
    classDef routingClass fill:#f3e5f5
    classDef stateClass fill:#e8f5e8
    classDef authClass fill:#fff3e0
    classDef uiClass fill:#fce4ec
    classDef logicClass fill:#f1f8e9
    classDef themeClass fill:#f0f4c3
    
    class App,Root appClass
    class Router,Routes routingClass
    class Recoil,ReactQuery,LocalState stateClass
    class Auth0Provider,AuthHooks,AuthGuards authClass
    class Pages,Sections,Components,MUI uiClass
    class Hooks,API,Utils logicClass
    class ThemeProvider,StyledComponents,ResponsiveDesign themeClass
```

## Component Hierarchy & Data Flow

```mermaid
graph TD
    subgraph "Application Entry"
        main[main.tsx<br/>React.StrictMode]
        app[App.tsx<br/>Main App Component]
    end
    
    subgraph "Global Providers"
        providers[Providers.tsx<br/>Context Providers Wrapper]
        auth0[Auth0Provider<br/>Authentication]
        recoil[RecoilRoot<br/>State Management]
        query[QueryClient<br/>Server State]
        theme[ThemeProvider<br/>MUI Theme]
        error[ErrorBoundary<br/>Error Handling]
    end
    
    subgraph "Routing Layer"
        router[BrowserRouter<br/>Routing Context]
        routes[Route Definitions<br/>Public & Protected]
    end
    
    subgraph "Page Components"
        welcome[Welcome Page<br/>Landing & Authentication]
        rsvp[RSVP Page<br/>Guest Response Form]
        details[Details Page<br/>Wedding Information]
        travel[Travel Page<br/>Accommodation Info]
        registry[Registry Page<br/>Gift Information]
        admin[Admin Pages<br/>Administrative Interface]
    end
    
    subgraph "Section Components"
        rsvpForm[RSVP Form Section<br/>Multi-step Form]
        guestInfo[Guest Info Section<br/>Contact Details]
        paymentSection[Payment Section<br/>Stripe Integration]
        accommodations[Accommodations Section<br/>Hotel Information]
        adminControls[Admin Controls<br/>Family Management]
    end
    
    subgraph "Reusable Components"
        loading[Loading Components<br/>Spinners & Skeletons]
        forms[Form Components<br/>Input & Validation]
        modals[Modal Components<br/>Overlays & Dialogs]
        layout[Layout Components<br/>Headers & Navigation]
    end
    
    main --> app
    app --> providers
    
    providers --> auth0
    providers --> recoil
    providers --> query
    providers --> theme
    providers --> error
    
    providers --> router
    router --> routes
    
    routes --> welcome
    routes --> rsvp
    routes --> details
    routes --> travel
    routes --> registry
    routes --> admin
    
    rsvp --> rsvpForm
    rsvp --> guestInfo
    rsvp --> paymentSection
    travel --> accommodations
    admin --> adminControls
    
    rsvpForm --> forms
    guestInfo --> forms
    paymentSection --> forms
    accommodations --> layout
    adminControls --> modals
    
    welcome --> loading
    rsvp --> loading
    details --> loading
    travel --> loading
    registry --> loading
    admin --> loading
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> AppInit
    
    state AppInit {
        [*] --> LoadingAuth
        LoadingAuth --> Authenticated : Auth0 Success
        LoadingAuth --> Unauthenticated : Auth0 Error/No Token
        
        state Authenticated {
            [*] --> LoadingUserData
            LoadingUserData --> UserDataLoaded : API Success
            LoadingUserData --> UserDataError : API Error
            
            state UserDataLoaded {
                [*] --> RSVP_Pending
                [*] --> RSVP_Completed
                [*] --> Admin_Access
                
                RSVP_Pending --> RSVP_InProgress : Start RSVP
                RSVP_InProgress --> RSVP_Completed : Submit RSVP
                RSVP_Completed --> RSVP_InProgress : Edit RSVP
                
                Admin_Access --> Managing_Families : Admin Actions
                Managing_Families --> Admin_Access : Complete Action
            }
        }
        
        state Unauthenticated {
            [*] --> ShowLogin
            ShowLogin --> LoadingAuth : Login Attempt
        }
    }
    
    UserDataError --> LoadingUserData : Retry
    RSVP_InProgress --> RSVP_Pending : Cancel
```

## API Integration Architecture

```mermaid
graph LR
    subgraph "Frontend API Layer"
        ApiClient[API Client<br/>Axios Configuration]
        TypeGen[Generated Types<br/>OpenAPI → TypeScript]
        QueryHooks[React Query Hooks<br/>Data Fetching Abstraction]
    end
    
    subgraph "Custom Hooks"
        AuthQueries[useAuth0Queries<br/>Authentication Hooks]
        AdminQueries[useAdminQueries<br/>Admin Operations]
        GuestHooks[Guest Data Hooks<br/>RSVP & Profile Operations]
    end
    
    subgraph "Components"
        RSVPComponents[RSVP Components<br/>Form & Display]
        AdminComponents[Admin Components<br/>Management Interface]
        SharedComponents[Shared Components<br/>Common UI Elements]
    end
    
    subgraph "Backend APIs"
        GuestAPI[Guest Endpoints<br/>RSVP & Profile APIs]
        AdminAPI[Admin Endpoints<br/>Family Management APIs]
        PaymentAPI[Payment Endpoints<br/>Stripe Integration APIs]
        ValidationAPI[Validation Endpoints<br/>Address/Email/Phone APIs]
    end
    
    ApiClient --> TypeGen
    TypeGen --> QueryHooks
    QueryHooks --> AuthQueries
    QueryHooks --> AdminQueries
    QueryHooks --> GuestHooks
    
    AuthQueries --> RSVPComponents
    AuthQueries --> AdminComponents
    AdminQueries --> AdminComponents
    GuestHooks --> RSVPComponents
    GuestHooks --> SharedComponents
    
    QueryHooks --> GuestAPI
    QueryHooks --> AdminAPI
    QueryHooks --> PaymentAPI
    QueryHooks --> ValidationAPI
```

## Responsive Design Strategy

```mermaid
graph TD
    subgraph "Breakpoint Strategy"
        Mobile[📱 Mobile First<br/>Base Styles<br/>0px - 600px]
        Tablet[📊 Tablet<br/>theme.breakpoints.up('sm')<br/>600px - 960px]
        Desktop[🖥️ Desktop<br/>theme.breakpoints.up('md')<br/>960px - 1280px]
        LargeDesktop[🖥️ Large Desktop<br/>theme.breakpoints.up('lg')<br/>1280px+]
    end
    
    subgraph "Component Adaptation"
        Navigation[Navigation<br/>Drawer → Tabs → Header]
        Forms[Forms<br/>Stacked → Side-by-side]
        Cards[Cards<br/>Full Width → Grid]
        Modals[Modals<br/>Full Screen → Centered]
    end
    
    subgraph "Layout Systems"
        MUIGrid[MUI Grid System<br/>12-column Responsive]
        Flexbox[Flexbox Layout<br/>Direction & Wrap]
        Container[Container Component<br/>Max-width Control]
    end
    
    Mobile --> Tablet
    Tablet --> Desktop
    Desktop --> LargeDesktop
    
    Mobile --> Navigation
    Mobile --> Forms
    Mobile --> Cards
    Mobile --> Modals
    
    Navigation --> MUIGrid
    Forms --> MUIGrid
    Cards --> Flexbox
    Modals --> Container
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Build Optimization"
        Vite[Vite Build Tool<br/>Fast HMR & Building]
        CodeSplitting[Code Splitting<br/>Route-based & Component-based]
        TreeShaking[Tree Shaking<br/>Dead Code Elimination]
        Minification[Minification<br/>CSS & JS Compression]
    end
    
    subgraph "Runtime Optimization"
        ReactMemo[React.memo<br/>Component Memoization]
        UseMemo[useMemo/useCallback<br/>Value & Function Memoization]
        LazyLoading[Lazy Loading<br/>React.lazy & Suspense]
        VirtualizationReady[Virtualization Ready<br/>Large List Handling]
    end
    
    subgraph "Caching Strategy"
        ReactQueryCache[React Query Cache<br/>Server State Caching]
        ServiceWorker[Service Worker<br/>PWA Asset Caching]
        BrowserCache[Browser Cache<br/>Long-term Asset Caching]
    end
    
    subgraph "Bundle Analysis"
        BundleAnalyzer[Bundle Analyzer<br/>Size Monitoring]
        LighthouseCI[Lighthouse CI<br/>Performance Metrics]
        WebVitals[Core Web Vitals<br/>User Experience Metrics]
    end
    
    Vite --> CodeSplitting
    CodeSplitting --> TreeShaking
    TreeShaking --> Minification
    
    ReactMemo --> UseMemo
    UseMemo --> LazyLoading
    LazyLoading --> VirtualizationReady
    
    ReactQueryCache --> ServiceWorker
    ServiceWorker --> BrowserCache
    
    BundleAnalyzer --> LighthouseCI
    LighthouseCI --> WebVitals
    
    Minification -.-> ReactQueryCache
    VirtualizationReady -.-> BundleAnalyzer
```