# DiaCare

DiaCare is a diabetes care management system designed as a prototype for Rwanda Diabetics Association. The system supports patients, doctors, and administrators with secure access to health records, glucose tracking, appointments, prescriptions, meal plans, notifications, dashboards, and real-time chat with SOS emergency escalation.

## Reference Organization

The reference organization for this project is Rwanda Diabetics Association. DiaCare is modeled as a digital support platform for an organization that coordinates diabetes care, patient follow-up, doctor communication, health education, and emergency response support.

## Main Features

- JWT-based authentication and role-based authorization
- Patient, doctor, and admin dashboards
- Admin CRUD for patients, doctors, and staff accounts, including activate, suspend, update, and delete
- Patient profile management with read-only target HbA1c for patients
- Glucose reading capture and history
- Health metrics tracking, including BMI, HbA1c, cholesterol, and doctor-updated lab results
- Doctor-managed target HbA1c setting, visible on the patient dashboard
- Appointment booking by patients and appointment scheduling by doctors
- Appointment review, rescheduling, cancellation, completion, and weekly calendar view
- Doctor dashboard critical glucose alerts grouped by patient, with expandable alert history
- Prescription management with insulin options `Lante`, `Rapid`, and `Abasaglar`, including three daily dose times
- Meal plan management
- Notifications
- Real-time chat using WebSocket, STOMP, and SockJS
- Patient SOS emergency messages with admin alerts and acknowledgement
- Dockerized deployment with PostgreSQL, Spring Boot, React, and Nginx

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Axios, React Router, Recharts |
| Backend | Spring Boot, Spring Security, Spring Data JPA, WebSocket/STOMP |
| Database | PostgreSQL |
| Auth | JWT |
| Deployment | Docker and Docker Compose |
| API Docs | Swagger/OpenAPI |

## Project Structure

```text
shema-placid/
  DiaCare/                  Spring Boot backend
  DiaCareFrontend/          React/Vite frontend
  docker-compose.yml        Full stack Docker orchestration
  PROJECT_DOCUMENTATION.md  Development, Docker, and test documentation
  clear-db.sql              Database helper script
```

## Quick Start With Docker

Requirements:

- Docker
- Docker Compose

Run the complete application:

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend Swagger UI: `http://localhost:8085/swagger-ui.html`
- Backend API base URL: `http://localhost:8085/api/v1`

Stop the stack:

```bash
docker compose down
```

## Default Test Users

The backend seed data prints these accounts during startup:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@diacare.com` | `Admin@123` |
| Doctor | `mugisha@diacare.com` | `Doctor@123` |
| Patient | `jean@diacare.com` | `Patient@123` |
| Patient | `alice@diacare.com` | `Patient@123` |

## Run Locally Without Docker

Backend:

```bash
cd DiaCare
mvn spring-boot:run
```

Frontend:

```bash
cd DiaCareFrontend
npm install
npm run dev
```

The backend requires PostgreSQL and environment variables for database, JWT, and mail settings. Docker Compose is the recommended development setup because it provides all services together.

## Architecture Diagram

```mermaid
flowchart LR
    Patient[Patient Browser] --> Frontend[React Frontend]
    Doctor[Doctor Browser] --> Frontend
    Admin[Admin Browser] --> Frontend

    Frontend -->|REST API /api/v1| Backend[Spring Boot Backend]
    Frontend -->|WebSocket /ws| Backend

    Backend --> Security[Spring Security + JWT]
    Backend --> Services[Service Layer]
    Services --> Repositories[Spring Data JPA Repositories]
    Repositories --> Database[(PostgreSQL)]

    Backend --> Swagger[Swagger UI]
```

## Component Diagram

```mermaid
flowchart TB
    subgraph Frontend["DiaCareFrontend"]
        Pages[Role Pages]
        Layouts[Admin Doctor Patient Layouts]
        Components[Reusable UI and Chat Components]
        ApiClient[Axios API Clients]
        AuthStore[Auth Store]
    end

    subgraph Backend["DiaCare Spring Boot API"]
        Controllers[Controllers]
        DTOs[DTOs]
        Services[Services]
        Repos[Repositories]
        Entities[JPA Entities]
        SecurityConfig[Security and JWT Filter]
        WebSocketConfig[WebSocket Config]
    end

    subgraph Data["Data Layer"]
        Postgres[(PostgreSQL)]
    end

    Pages --> Layouts
    Layouts --> Components
    Components --> ApiClient
    ApiClient --> Controllers
    AuthStore --> ApiClient
    Controllers --> DTOs
    Controllers --> Services
    Services --> Repos
    Repos --> Entities
    Repos --> Postgres
    SecurityConfig --> Controllers
    WebSocketConfig --> Controllers
```

## Use Case Diagram

```mermaid
flowchart LR
    Patient((Patient))
    Doctor((Doctor))
    Admin((Admin))

    Login[Login and manage account]
    Glucose[Record glucose readings]
    Metrics[View health metrics]
    Book[Book appointment]
    Prescriptions[View prescriptions]
    Meals[View meal plans]
    Chat[Chat with users]
    SOS[Send SOS emergency]

    ReviewPatients[Review patient records]
    ManageAppointments[Schedule and manage appointments]
    SetHbA1c[Set target HbA1c]
    UpdateLabs[Add and update lab results]
    CreatePrescription[Create prescriptions]
    CreateMealPlan[Create meal plans]
    AcknowledgeSOS[Acknowledge SOS]

    ManageUsers[Manage users]
    Reports[View reports]
    AdminAlerts[Handle emergency alerts]

    Patient --> Login
    Patient --> Glucose
    Patient --> Metrics
    Patient --> Book
    Patient --> Prescriptions
    Patient --> Meals
    Patient --> Chat
    Patient --> SOS

    Doctor --> Login
    Doctor --> ReviewPatients
    Doctor --> ManageAppointments
    Doctor --> SetHbA1c
    Doctor --> UpdateLabs
    Doctor --> CreatePrescription
    Doctor --> CreateMealPlan
    Doctor --> Chat
    Doctor --> AcknowledgeSOS

    Admin --> Login
    Admin --> ManageUsers
    Admin --> Reports
    Admin --> Chat
    Admin --> AdminAlerts
    Admin --> AcknowledgeSOS
```

## Class Diagram

```mermaid
classDiagram
    class User {
        Long id
        UUID publicId
        String username
        String email
        String password
        Role role
        boolean isActive
        LocalDateTime createdAt
    }

    class Patient {
        Long id
        String diabetesType
        LocalDate dateOfBirth
        String gender
        Double targetHbA1c
    }

    class Doctor {
        Long id
        String specialization
        String licenseNumber
        Integer yearsOfExperience
    }

    class Admin {
        Long id
        String department
    }

    class Appointment {
        Long id
        LocalDateTime appointmentDate
        Status status
        String notes
    }

    class GlucoseReading {
        Long id
        Double value
        Unit unit
        MealContext mealContext
        LocalDateTime recordedAt
        String notes
    }

    class HealthMetrics {
        Long id
        Double weight
        Double height
        Double bmi
        Double hba1c
        Integer bloodPressureSystolic
        Integer bloodPressureDiastolic
        Double cholesterol
    }

    class Prescription {
        Long id
        String medication
        String dosage
        String instructions
        LocalDate startDate
        LocalDate endDate
    }

    class MealPlan {
        Long id
        String diabetesType
        String calorieGoal
        String breakfast
        String lunch
        String dinner
        String snacks
        String notes
    }

    class Notification {
        Long id
        Type type
        String message
        boolean isRead
    }

    class Conversation {
        Long id
        LocalDateTime createdAt
    }

    class ChatMessage {
        Long id
        String content
        boolean isRead
        boolean isEmergency
        boolean emergencyAcknowledged
        LocalDateTime sentAt
    }

    User "1" --> "0..1" Patient
    User "1" --> "0..1" Doctor
    User "1" --> "0..1" Admin
    Patient "1" --> "0..*" Appointment
    Doctor "1" --> "0..*" Appointment
    Patient "1" --> "0..*" GlucoseReading
    Patient "1" --> "0..*" HealthMetrics
    Patient "1" --> "0..*" Prescription
    Doctor "1" --> "0..*" Prescription
    Appointment "0..1" --> "0..*" Prescription
    Patient "1" --> "0..*" MealPlan
    Doctor "1" --> "0..*" MealPlan
    User "1" --> "0..*" Notification
    User "1" --> "0..*" Conversation : participantOne
    User "1" --> "0..*" Conversation : participantTwo
    Conversation "1" --> "0..*" ChatMessage
    User "1" --> "0..*" ChatMessage : sender
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| PATIENTS : owns
    USERS ||--o| DOCTORS : owns
    USERS ||--o| ADMINS : owns
    PATIENTS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : attends
    PATIENTS ||--o{ GLUCOSE_READINGS : records
    PATIENTS ||--o{ HEALTH_METRICS : has
    PATIENTS ||--o{ PRESCRIPTIONS : receives
    DOCTORS ||--o{ PRESCRIPTIONS : writes
    APPOINTMENTS ||--o{ PRESCRIPTIONS : may_generate
    PATIENTS ||--o{ MEAL_PLANS : receives
    DOCTORS ||--o{ MEAL_PLANS : creates
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ CONVERSATIONS : participant_one
    USERS ||--o{ CONVERSATIONS : participant_two
    CONVERSATIONS ||--o{ CHAT_MESSAGES : contains
    USERS ||--o{ CHAT_MESSAGES : sends
```

## Backend Layer Diagram

```mermaid
flowchart TB
    Controller[Controller Layer]
    Service[Service Layer]
    Repository[Repository Layer]
    Entity[JPA Entity Layer]
    DB[(PostgreSQL)]

    Controller -->|validates request and maps endpoints| Service
    Service -->|business rules and transactions| Repository
    Repository -->|Spring Data JPA| Entity
    Entity --> DB
```

## Chat Sequence Diagram

```mermaid
sequenceDiagram
    participant Patient
    participant Frontend
    participant API as Spring Boot API
    participant DB as PostgreSQL
    participant Admin

    Patient->>Frontend: Type message and send
    Frontend->>API: STOMP /app/chat.send
    API->>DB: Save ChatMessage
    API-->>Patient: Push /user/queue/messages
    API-->>Admin: Push /user/queue/messages
    alt SOS emergency message
        API-->>Admin: Push /user/queue/emergency-alert
        Admin->>Frontend: Click Acknowledge
        Frontend->>API: PUT /chat/messages/{id}/acknowledge-emergency
        API->>DB: Mark emergencyAcknowledged = true
    end
```

## Appointment Activity Diagram

```mermaid
flowchart TD
    Start([Start])
    Login[Patient logs in]
    ChooseDoctor[Select doctor]
    PickTime[Pick appointment date and time]
    Validate{Valid weekday and time?}
    Save[Save appointment as PENDING]
    Notify[Notify relevant users]
    DoctorReview[Doctor/Admin reviews appointment]
    Status{Decision}
    Confirm[Set status CONFIRMED]
    Cancel[Set status CANCELLED]
    End([End])

    Start --> Login --> ChooseDoctor --> PickTime --> Validate
    Validate -- No --> PickTime
    Validate -- Yes --> Save --> Notify --> DoctorReview --> Status
    Status -- Confirm --> Confirm --> End
    Status -- Cancel --> Cancel --> End
```

## Deployment Diagram

```mermaid
flowchart LR
    Browser[User Browser]
    Nginx[Frontend Container Nginx on 5173]
    Backend[Backend Container Spring Boot on 8085]
    Database[PostgreSQL Container on 5432]

    Browser -->|HTTP| Nginx
    Browser -->|REST and WebSocket| Backend
    Backend -->|JDBC| Database
```

## API Summary

| Module | Main Paths |
| --- | --- |
| Authentication | `/api/v1/auth/**` |
| Admin | `/api/v1/admin/**` |
| Doctor | `/api/v1/doctors/**` |
| Patient | `/api/v1/patients/**` |
| Appointments | `/api/v1/appointments/**` |
| Glucose | `/api/v1/glucose/**` |
| Metrics | `/api/v1/metrics/**` |
| Prescriptions | `/api/v1/prescriptions/**` |
| Meal Plans | `/api/v1/meal-plans/**` |
| Notifications | `/api/v1/notifications/**` |
| Chat | `/api/v1/chat/**` |
| WebSocket | `/ws` |

Important implemented endpoints include:

- `POST /api/v1/appointments/for-patient` for doctors to schedule appointments for patients
- `PUT /api/v1/patients/{publicId}/target-hba1c` for doctors/admins to set target HbA1c
- `POST /api/v1/metrics/for-patient/{patientPublicId}` for doctors to add lab results
- `PUT /api/v1/metrics/{id}` and `POST /api/v1/metrics/{id}/update` for updating lab results
- `DELETE /api/v1/admin/doctors/{publicId}` and `PUT /api/v1/admin/doctors/{publicId}` for admin doctor CRUD

## Design Patterns And Best Practices

- Repository Pattern through Spring Data JPA repositories
- Service Layer Pattern for business logic and transactions
- DTO Pattern for request and response data transfer
- Observer-style messaging through WebSocket subscriptions
- Centralized exception handling
- Environment-based configuration
- Role-based access control
- Component-based frontend structure
- Docker multi-container deployment

## Testing

Automated backend tests were added under `DiaCare/src/test/java`:

- `AppointmentServiceImplTest` checks appointment date validation.
- `HealthMetricsServiceImplTest` checks lab result updates.
- `DoctorServiceImplTest` checks that one patient with many critical glucose readings is counted once.

Run automated tests:

```bash
cd DiaCare
./mvnw test
```

On Windows PowerShell:

```powershell
cd DiaCare
.\mvnw.cmd test
```

Recommended additional checks:

```bash
cd ../DiaCareFrontend
npm run build

cd ..
docker compose up --build
```

Main workflows to test:

- Register and log in as each role
- Access protected pages with and without a token
- Record glucose readings and health metrics
- Book appointments as a patient
- Schedule appointments as a doctor
- Add and update lab results as a doctor
- Set target HbA1c as a doctor and confirm the patient dashboard shows it
- Confirm doctor dashboard critical alerts show one row per patient
- Create prescriptions using Lante, Rapid, or Abasaglar with three dose times
- Create and view meal plans
- Send normal chat messages between two browser sessions
- Send an SOS emergency message as a patient
- Acknowledge SOS as doctor or admin
- Confirm unread badges update correctly

## Submission Notes

For academic submission, include:

- This README
- `PROJECT_DOCUMENTATION.md`
- Source code for both `DiaCare` and `DiaCareFrontend`
- `docker-compose.yml`
- Any database helper scripts

The project demonstrates prototype development, software design diagrams, Dockerization, version control setup, test planning, and implementation of selected programming best practices.
