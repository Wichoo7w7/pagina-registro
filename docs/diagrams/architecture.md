# Diagrama de Arquitectura (Alta Nivel)

```mermaid
digraph G {
  rankdir=LR;
  subgraph cluster_client {
    label="Frontend (React/Vite)";
    Browser["Navegador/SPA"];
  }
  subgraph cluster_backend {
    label="Backend (NestJS)";
    API["REST API Controllers"];
    Services["Services / Use Cases"];
    Queue["Bull Queue (emails)"];
  }
  DB[(PostgreSQL)]
  Redis[(Redis)]
  Mail["SMTP Provider"]

  Browser -> API [label="HTTPS JSON"];
  API -> Services;
  Services -> DB;
  Services -> Queue;
  Queue -> Redis;
  Queue -> Mail [label="Send email"];
}
```

# Flujo de Datos (Pago)
```mermaid
sequenceDiagram
  participant U as Usuario
  participant FE as Frontend
  participant BE as Backend
  participant Q as Cola Emails
  participant SMTP as SMTP

  U->>FE: Subir comprobante pago
  FE->>BE: POST /payments (multipart)
  BE->>BE: Validar y guardar registro
  BE->>Q: Enqueue email confirmación
  Q->>SMTP: Enviar correo
  BE-->>FE: 201 Created
```

# Esquema Base de Datos (simplificado)
```mermaid
erDiagram
  USERS ||--o{ PAYMENTS : has
  USERS ||--o{ ENROLLMENTS : has
  WORKSHOPS ||--o{ ENROLLMENTS : has
  USERS ||--o{ EMAIL_LOGS : triggers

  USERS {
    uuid id PK
    string name
    string email
    string password_hash
    string roles[]
    timestamp created_at
  }
  PAYMENTS {
    uuid id PK
    uuid user_id FK
    numeric amount
    string status
    string proof_path
    timestamp created_at
  }
  WORKSHOPS {
    uuid id PK
    string title
    int capacity
    timestamp start_date
    timestamp end_date
  }
  ENROLLMENTS {
    uuid id PK
    uuid user_id FK
    uuid workshop_id FK
    timestamp created_at
  }
  EMAIL_LOGS {
    uuid id PK
    string to
    string subject
    string type
    string status
    int attempts
    text last_error
    json meta
    timestamp created_at
  }
```
