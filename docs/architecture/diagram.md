# TeqBook – System Architecture Diagram

Dette dokumentet viser systemarkitekturen til TeqBook med visuelle diagrammer.

---

## Høy-nivå Arkitektur

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Next.js Application"
        Pages[Pages/App Router]
        Components[React Components]
        Services[Services Layer]
        Repos[Repositories Layer]
    end

    subgraph "Supabase Backend"
        Auth[Supabase Auth]
        Postgres[(PostgreSQL Database)]
        RLS[Row Level Security]
        RPC[RPC Functions]
        Storage[Storage]
    end

    Browser --> Pages
    Mobile --> Pages
    Pages --> Components
    Components --> Services
    Services --> Repos
    Repos --> Auth
    Repos --> Postgres
    Repos --> RPC
    Postgres --> RLS
    RPC --> Postgres
    Components --> Storage
```

---

## Lagdelt Arkitektur

```mermaid
graph TD
    subgraph "UI Layer"
        A[Pages<br/>src/app/]
        B[Components<br/>src/components/]
    end

    subgraph "Service Layer"
        C[Business Logic<br/>src/lib/services/]
    end

    subgraph "Repository Layer"
        D[Data Access<br/>src/lib/repositories/]
    end

    subgraph "Supabase"
        E[Supabase Client<br/>supabase-client.ts]
        F[(PostgreSQL)]
        G[RPC Functions]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    G --> F

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#ffe1f5
    style E fill:#e1ffe1
    style F fill:#e1ffe1
    style G fill:#e1ffe1
```

**Regel:** Data flyter alltid nedover (UI → Services → Repositories → Supabase). UI-komponenter skal **aldri** kalle Supabase direkte.

---

## Data Flow: Booking Creation

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Service
    participant Repository
    participant Supabase
    participant Database

    User->>Component: Fill booking form
    Component->>Service: createBooking(input)
    Service->>Service: Validate input
    Service->>Repository: createBooking(input)
    Repository->>Supabase: RPC call
    Supabase->>Database: create_booking_with_validation()
    Database->>Database: Validate & create booking
    Database-->>Supabase: Booking created
    Supabase-->>Repository: { data, error }
    Repository-->>Service: { data, error }
    Service-->>Component: { data, error }
    Component->>User: Show success/error
```

---

## Multi-Tenant Data Isolation

```mermaid
graph LR
    subgraph "User A"
        UA[User A<br/>salon_id: 1]
        UA --> SA1[Salon 1 Data]
    end

    subgraph "User B"
        UB[User B<br/>salon_id: 2]
        UB --> SA2[Salon 2 Data]
    end

    subgraph "Database"
        DB[(PostgreSQL)]
        RLS[RLS Policies]
    end

    SA1 --> DB
    SA2 --> DB
    DB --> RLS

    RLS -.->|Filters by salon_id| SA1
    RLS -.->|Filters by salon_id| SA2
```

**RLS Policies sikrer:**
- User A kan kun se data for `salon_id = 1`
- User B kan kun se data for `salon_id = 2`
- Ingen data-lekkasje mellom salonger

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Next.js
    participant Supabase Auth
    participant Profiles Table
    participant Salon Provider

    User->>Next.js: Login
    Next.js->>Supabase Auth: signIn(email, password)
    Supabase Auth-->>Next.js: Session token
    Next.js->>Profiles Table: Get user profile
    Profiles Table-->>Next.js: { user_id, salon_id, role }
    Next.js->>Salon Provider: Set salon context
    Salon Provider->>Next.js: Salon data available
    Next.js->>User: Redirect to dashboard
```

---

## Public Booking Flow

```mermaid
graph TD
    A[Public User] --> B[Public Booking Page<br/>/book/salon-slug]
    B --> C{Salon Public?}
    C -->|No| D[Show Error]
    C -->|Yes| E[Load Services & Employees]
    E --> F[User Selects Service/Employee/Date]
    F --> G[Generate Availability<br/>RPC: generate_availability]
    G --> H[Show Available Slots]
    H --> I[User Selects Slot]
    I --> J[User Fills Customer Info]
    J --> K[Create Booking<br/>RPC: create_booking_with_validation]
    K --> L{Success?}
    L -->|Yes| M[Show Success Message]
    L -->|No| N[Show Error]
```

---

## Database Schema (Simplified)

```mermaid
erDiagram
    SALONS ||--o{ PROFILES : "has"
    SALONS ||--o{ EMPLOYEES : "has"
    SALONS ||--o{ SERVICES : "has"
    SALONS ||--o{ BOOKINGS : "has"
    SALONS ||--o{ CUSTOMERS : "has"
    SALONS ||--o{ SHIFTS : "has"
    SALONS ||--o{ OPENING_HOURS : "has"
    
    EMPLOYEES ||--o{ BOOKINGS : "handles"
    SERVICES ||--o{ BOOKINGS : "used_in"
    CUSTOMERS ||--o{ BOOKINGS : "books"
    EMPLOYEES ||--o{ SHIFTS : "has"
    EMPLOYEES }o--o{ SERVICES : "provides"
    
    SALONS {
        uuid id PK
        string name
        string slug
        boolean is_public
        string preferred_language
    }
    
    PROFILES {
        uuid user_id PK
        uuid salon_id FK
        string role
        boolean is_superadmin
    }
    
    EMPLOYEES {
        uuid id PK
        uuid salon_id FK
        string full_name
        boolean is_active
    }
    
    SERVICES {
        uuid id PK
        uuid salon_id FK
        string name
        int duration_minutes
        int price_cents
    }
    
    BOOKINGS {
        uuid id PK
        uuid salon_id FK
        uuid employee_id FK
        uuid service_id FK
        uuid customer_id FK
        timestamp start_time
        timestamp end_time
        string status
    }
```

---

## Component Hierarchy

```mermaid
graph TD
    A[App Layout] --> B[Dashboard Shell]
    B --> C[Sidebar]
    B --> D[Header]
    B --> E[Main Content]
    
    E --> F[Page Header]
    E --> G[Page Content]
    
    G --> H[Table Toolbar]
    G --> I[Data Table]
    G --> J[Empty State]
    
    D --> K[Current User Badge]
    D --> L[Current Salon Badge]
    D --> M[Command Palette]
    D --> N[Notification Center]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style E fill:#ffe1f5
```

---

## Service Layer Pattern

```mermaid
graph LR
    A[UI Component] -->|Calls| B[Service Function]
    B -->|Validates| C{Valid?}
    C -->|No| D[Return Error]
    C -->|Yes| E[Call Repository]
    E -->|Returns| F[Data or Error]
    F -->|Returns| B
    B -->|Returns| A
    
    style B fill:#fff4e1
    style E fill:#ffe1f5
```

**Service Layer ansvar:**
- Validering av input
- Business logic
- Error-håndtering
- Orchestrering av repository-kall

---

## Repository Layer Pattern

```mermaid
graph LR
    A[Service] -->|Calls| B[Repository Function]
    B -->|Uses| C[Supabase Client]
    C -->|Queries| D[(PostgreSQL)]
    C -->|Calls| E[RPC Functions]
    E -->|Executes| D
    D -->|Returns| C
    C -->|Returns| B
    B -->|Returns| A
    
    style B fill:#ffe1f5
    style C fill:#e1ffe1
    style D fill:#e1ffe1
```

**Repository Layer ansvar:**
- Data access abstraksjon
- Supabase query-bygging
- Type-safe return values
- Error-håndtering

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Local Dev Server<br/>localhost:3000]
    end

    subgraph "CI/CD"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        Build[Build Process]
    end

    subgraph "Production"
        Pages[GitHub Pages]
        CDN[CDN]
        Users[End Users]
    end

    subgraph "Backend"
        Supabase[Supabase Cloud]
        DB[(PostgreSQL)]
    end

    Dev --> GitHub
    GitHub --> Actions
    Actions --> Build
    Build --> Pages
    Pages --> CDN
    CDN --> Users
    Users --> Supabase
    Supabase --> DB
    
    style Dev fill:#e1f5ff
    style GitHub fill:#fff4e1
    style Pages fill:#ffe1f5
    style Supabase fill:#e1ffe1
```

---

## Relaterte Dokumenter

- `docs/architecture/layers.md` - Detaljert lag-beskrivelse
- `docs/architecture/service-standards.md` - Service-standarder
- `docs/architecture/repository-standards.md` - Repository-standarder
- `docs/backend/supabase-foundation.md` - Supabase foundation
- `docs/features/public-booking.md` - Public booking flow

