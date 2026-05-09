# DiaCare Project Documentation

This document summarizes the Dockerization process, the version control setup, and a software test plan for the DiaCare application.

<<<<<<< HEAD
=======
## Reference Organization

The reference organization for this project is Rwanda Diabetics Association. DiaCare is designed as a prototype digital diabetes care platform that can support an organization responsible for diabetes awareness, patient follow-up, doctor coordination, appointment support, and emergency communication. The features in this system are therefore aligned with the needs of patients living with diabetes, healthcare professionals, and administrative staff who coordinate care.

### Organizational Context

Rwanda Diabetics Association can use a system like DiaCare to:

- register and manage patients, doctors, and administrative users
- help patients monitor glucose readings and health metrics
- support doctor follow-up through appointments, prescriptions, and meal plans
- improve communication between patients and care teams
- provide an SOS escalation path for urgent patient messages
- keep records that can support reporting and decision-making

### Documentation And Diagram Location

The root `README.md` contains the submission-ready diagrams for this project, including architecture, component, use case, class, entity relationship, backend layer, sequence, activity, and deployment diagrams. These diagrams are written in Mermaid syntax so they render directly on GitHub and in many Markdown viewers.

>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
## PHASE 2. Software Development Prototype

The DiaCare prototype is an early working version of a diabetes care management system built to validate the main idea before full deployment. The prototype focuses on the core workflows that matter most:

- user registration and login
- role-based access for patient, doctor, and admin users
- glucose reading tracking
- appointments
- prescriptions and meal plans
- notifications
- dashboards and reports
<<<<<<< HEAD
=======
- real-time chat with emergency (SOS) escalation
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### Prototype Purpose

The purpose of the prototype is to prove that the application architecture works and that the major features can be used together in one system. It helps detect design problems early, especially around authentication, database structure, and API integration.

### Prototype Structure

The prototype is divided into two main parts:

- Backend: Spring Boot REST API in `DiaCare`
- Frontend: React/Vite user interface in `DiaCareFrontend`

The backend handles business rules, validation, security, persistence, and API endpoints. The frontend provides the screens the user interacts with.

### Programming Best Practices Followed

The implementation follows common Java and React best practices:

- separation of concerns between controller, service, repository, and model layers
- reusable DTOs for request and response payloads
- validation on incoming data
- JWT-based authentication for secured endpoints
- centralized exception handling for consistent API errors
- environment-based configuration instead of hardcoding secrets
- component-based frontend design
- API communication through a single axios client
<<<<<<< HEAD

### Design Pattern Used
=======
- response DTOs used at the service boundary to prevent lazy-loading serialization errors

### Design Patterns Used

#### Repository Pattern
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

The main design pattern used in the project is the `Repository Pattern`.

This pattern appears throughout the backend through interfaces such as:

- `UserRepository`
- `PatientRepository`
- `DoctorRepository`
- `AppointmentRepository`
- `PrescriptionRepository`
- `MealPlanRepository`
- `NotificationRepository`
- `HealthMetricsRepository`
- `GlucoseReadingRepository`
<<<<<<< HEAD

#### How the pattern is used

- Controllers call services.
- Services call repositories.
- Repositories handle database access through Spring Data JPA.

This keeps database logic separate from business logic and makes the application easier to maintain and test.
=======
- `ConversationRepository`
- `ChatMessageRepository`

Controllers call services. Services call repositories. Repositories handle database access through Spring Data JPA. This keeps database logic separate from business logic and makes the application easier to maintain and test.

#### Observer Pattern (WebSocket Messaging)

The real-time chat module uses an observer-style pattern through Spring's STOMP message broker. When a message is sent, the server pushes it to all subscribed clients without them needing to poll. The `SimpMessagingTemplate` acts as the publisher and each connected browser session acts as a subscriber on `/user/queue/messages`.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### Why This Prototype Is Useful

- It proves the system can support the intended users and features.
- It reduces risk before full-scale deployment.
- It gives a solid foundation for testing, Dockerization, and future improvement.

<<<<<<< HEAD
=======
---

## PHASE 3. Real-Time Chat Module

### Overview

A real-time messaging module was added to support communication between all user roles:

- Doctor ↔ Patient
- Doctor ↔ Admin
- Patient ↔ Admin (for complaints and support requests)

Patients can flag any message as an SOS emergency. Admins are notified immediately via WebSocket and again by a scheduled escalation job if the emergency is not acknowledged within five minutes.

### Backend Implementation

#### New Module Structure

```
chat/
├── controller/  ChatController.java
├── dto/         ChatMessageDTO.java
│                ChatMessageResponse.java
│                ConversationDTO.java
│                ConversationResponse.java
├── model/       ChatMessage.java
│                Conversation.java
├── repository/  ChatMessageRepository.java
│                ConversationRepository.java
└── service/     ChatService.java
                 ChatServiceImpl.java
                 EmergencyEscalationScheduler.java
```

`common/config/WebSocketConfig.java` was added to configure the STOMP broker and SockJS endpoint.

#### Data Model

**Conversation** links two `User` records as `participantOne` and `participantTwo`. A unique constraint on the pair prevents duplicate conversations between the same two users.

**ChatMessage** belongs to a `Conversation` and records:

| Field | Purpose |
|---|---|
| `content` | Message text |
| `sender` | The user who sent it |
| `isRead` | Whether the recipient has read it |
| `isEmergency` | Whether the patient flagged it as SOS |
| `emergencyAcknowledged` | Whether a doctor or admin acknowledged the SOS |
| `sentAt` | Timestamp set on persist |

#### REST Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/chat/users` | List users available to chat with (filtered by role) |
| POST | `/api/v1/chat/conversations` | Get or create a conversation with another user |
| GET | `/api/v1/chat/conversations` | List all conversations for the current user |
| GET | `/api/v1/chat/conversations/{id}/messages` | Load message history |
| PUT | `/api/v1/chat/conversations/{id}/read` | Mark all messages as read |
| GET | `/api/v1/chat/unread/count` | Total unread count for nav badge |
| POST | `/api/v1/chat/unread/per-conversation` | Unread count per conversation |
| PUT | `/api/v1/chat/messages/{id}/acknowledge-emergency` | Acknowledge an SOS message |
| GET | `/api/v1/chat/emergencies` | List all unacknowledged SOS messages |

#### WebSocket

- Endpoint: `/ws` (SockJS fallback enabled)
- JWT is passed as a query parameter on the handshake: `/ws?token=<jwt>`
- Client sends messages to `/app/chat.send`
- Server pushes to `/user/{email}/queue/messages`
- Admin emergency alerts pushed to `/user/{email}/queue/emergency-alert`

#### Emergency Escalation Scheduler

`EmergencyEscalationScheduler` runs every 60 seconds. It finds SOS messages older than five minutes that have not been acknowledged and re-pushes an alert to all active admin users via WebSocket. This ensures no emergency is silently missed if the admin was offline when the message was first sent.

#### DTO Layer

All service methods return `ChatMessageResponse` or `ConversationResponse` DTOs instead of JPA entities. This prevents `LazyInitializationException` errors when Jackson serializes the response after the JPA session has closed (`open-in-view=false`). All lazy associations are resolved inside the `@Transactional` service method before the session closes.

#### Security Changes

- `/ws/**` is whitelisted in `SecurityConfig` so the WebSocket handshake is not blocked by the JWT filter.
- `JwtAuthFilter` skips `/ws/**` paths.
- `/api/v1/chat/**` requires any authenticated role (PATIENT, DOCTOR, or ADMIN).

#### Dependency Added

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### Frontend Implementation

#### New Files

| File | Purpose |
|---|---|
| `src/api/chat.js` | All chat REST API calls |
| `src/hooks/useChatUnread.js` | Hook that polls total unread count every 30 seconds |
| `src/components/chat/ChatPage.jsx` | Shared layout used by all three role chat pages |
| `src/components/chat/ChatWindow.jsx` | Real-time message UI with STOMP WebSocket |
| `src/components/chat/ConversationList.jsx` | Sidebar with conversation list and unread badges |
| `src/components/chat/NewChatModal.jsx` | Searchable modal to start a new conversation |
| `src/pages/admin/Chat.jsx` | Admin chat page |
| `src/pages/doctor/Chat.jsx` | Doctor chat page |
| `src/pages/patient/Chat.jsx` | Patient chat page with SOS hint banner |

#### npm Packages Added

```
@stomp/stompjs
sockjs-client
```

`vite.config.js` was updated with `define: { global: 'globalThis' }` to polyfill the Node.js `global` variable that `sockjs-client` expects, and `optimizeDeps.include` was set to pre-bundle both packages.

#### UX Design

The chat UI follows a WhatsApp-style layout:

- Left panel: conversation list with last message preview, timestamp, and unread count badge per conversation
- Right panel: message thread with date separators, message bubbles (green for sent, white for received), read receipts (single tick = sent, double blue tick = read), and a growing textarea input
- New chat button (pencil icon) is placed in the conversation list header — not as a floating action button over the message area
- Clicking the pencil opens a modal with a searchable list of all users the current user can chat with, grouped by role
- On mobile, only one panel is visible at a time. Selecting a conversation switches to the chat view. A back arrow in the chat header returns to the conversation list

#### SOS Emergency Flow

1. Patient taps the red triangle button in the input bar to toggle SOS mode.
2. The input bar turns red and the placeholder changes to indicate an emergency message.
3. On send, the message is stored with `isEmergency = true`.
4. The server immediately pushes a WebSocket alert to all active admin users on `/user/queue/emergency-alert`.
5. The admin sees a pulsing red banner at the top of their chat page with the patient name, message preview, and two buttons: Open Chat and Acknowledge.
6. If no admin acknowledges within five minutes, the scheduler re-sends the alert.
7. Doctors and admins see an SOS label above the red bubble and an Acknowledge button. Once acknowledged, the label changes to a green checkmark.

#### Unread Badges

- Each sidebar (Admin, Doctor, Patient) shows a red badge on the Chat nav item with the total unread count.
- The badge appears on the icon when the sidebar is collapsed and as a pill on the right when expanded.
- Inside the chat page, the conversation list header shows the total unread count next to the Chats title.
- Each conversation row shows its own unread count badge.
- Counts are polled every 30 seconds via `useChatUnread` and cleared immediately when a conversation is opened.

---

>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
## 1. Brief Process To Dockerize An Application

Dockerizing an application means packaging the application code, runtime, and dependencies into containers so the application runs the same way in different environments.

The general process is:

1. Identify the application components.
   - DiaCare has a Spring Boot backend and a React/Vite frontend.
   - The backend also depends on PostgreSQL.

2. Create container instructions.
   - Write a `Dockerfile` for each service.
   - Use a multi-stage build for smaller production images.

3. Provide environment configuration.
   - Pass database, JWT, and mail settings as environment variables.
   - Build the frontend with the correct API base URL.

4. Orchestrate the services.
   - Use `docker-compose.yml` to start PostgreSQL, the backend, and the frontend together.

5. Test the containers.
   - Build the images.
   - Start the stack.
   - Confirm the frontend, backend API, and database are reachable.

### Dockerization Applied To DiaCare

The repository now includes:

- `DiaCare/Dockerfile` for the Spring Boot backend.
- `DiaCareFrontend/Dockerfile` for the React frontend.
- `DiaCareFrontend/nginx.conf` to serve the built frontend on port `5173`.
- `docker-compose.yml` at the project root to run the complete stack.

#### Runtime layout

- Backend: `http://localhost:8085`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

#### How to run

```bash
docker compose up --build
```

After startup:

- Open the frontend at `http://localhost:5173`
- Swagger UI is available at `http://localhost:8085/swagger-ui.html`

<<<<<<< HEAD
=======
---

>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
## 2. Version Control System Setup

This project is managed with Git, which is a distributed version control system. Git keeps track of code changes, makes collaboration easier, and allows the project to be restored to earlier versions when needed.

### SVN Alternative

If SVN is required instead of Git, the same project files should be added to an SVN working copy and committed to a central repository. The important files to capture are still the same:

- backend source code
- frontend source code
- build files
- Docker files
- documentation
- SQL scripts

### What should be captured in version control

The following parts of the application should be tracked:

- Backend source code under `DiaCare/src`
- Frontend source code under `DiaCareFrontend/src`
- Build configuration files such as `pom.xml` and `package.json`
- Docker files and compose files
- Documentation and SQL scripts

### What should not be tracked

Large generated or machine-specific files should be ignored, including:

- `target/`
- `node_modules/`
- local environment files such as `.env`
- IDE metadata and log files

### Practical Git workflow

1. Initialize the repository.
2. Add the project files.
3. Create a clear `.gitignore`.
4. Commit the backend, frontend, Docker, and documentation changes.
5. Push the repository to a remote server such as GitHub or GitLab.
6. Continue working with feature branches for future improvements.

<<<<<<< HEAD
If your lecturer specifically expects SVN terminology, the same idea still applies: source files, configuration, and documentation are versioned, while generated files are excluded.
=======
---
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

## 3. Software Test Plan

### 3.1 Test Plan Objective

<<<<<<< HEAD
The purpose of the test plan is to verify that DiaCare behaves correctly across authentication, patient management, doctor workflows, glucose tracking, appointments, prescriptions, notifications, and deployment in Docker containers.
=======
The purpose of the test plan is to verify that DiaCare behaves correctly across authentication, patient management, doctor workflows, glucose tracking, appointments, prescriptions, notifications, real-time chat, and deployment in Docker containers.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### 3.2 Test Items

- User authentication and authorization
- Patient registration and profile updates
- Doctor, admin, and patient dashboard functions
- Glucose reading capture and trend viewing
- Appointment booking, rescheduling, and cancellation
- Prescription and meal-plan retrieval
- Notification creation and retrieval
<<<<<<< HEAD
=======
- Real-time chat between all user roles
- SOS emergency flagging and admin acknowledgement
- Unread message badge counts
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
- Docker deployment and service startup

### 3.3 Test Strategy

The system should be tested at three levels:

1. Unit testing
   - Validate individual service methods and utility classes.
   - Use JUnit and Mockito where needed.

2. Integration testing
   - Verify controller-to-database flows.
   - Confirm secured endpoints respect roles and JWT authentication.
<<<<<<< HEAD
=======
   - Verify WebSocket connections authenticate correctly via JWT query parameter.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

3. System and acceptance testing
   - Test the complete web application from the user interface.
   - Confirm the deployed Docker stack works end to end.
<<<<<<< HEAD
=======
   - Test real-time message delivery between two browser sessions.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### 3.4 Test Environment

- Backend: Spring Boot 3.4 on Java 21
- Frontend: React 19 with Vite
- Database: PostgreSQL
- Container platform: Docker and Docker Compose
<<<<<<< HEAD
=======
- WebSocket: STOMP over SockJS
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### 3.5 Entry Criteria

Testing should start when:

- the application builds successfully
- database connection settings are available
- the frontend can reach the backend API
<<<<<<< HEAD
=======
- the WebSocket endpoint `/ws` is reachable
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### 3.6 Exit Criteria

Testing is complete when:

- critical endpoints work as expected
- login and role-based access pass
- main user workflows succeed
<<<<<<< HEAD
=======
- real-time messages are delivered without page refresh
- SOS alerts reach admin in real time
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
- no blocking deployment errors remain

### 3.7 Sample Test Cases

| ID | Test Case | Expected Result |
| --- | --- | --- |
| TC-01 | Register a new user | User account is created successfully |
| TC-02 | Login with valid credentials | JWT token is returned and session starts |
| TC-03 | Login with invalid credentials | Authentication fails with an error message |
| TC-04 | Access a protected endpoint without a token | Request is rejected with 401 |
| TC-05 | Access an admin endpoint as a patient | Request is rejected with 403 |
| TC-06 | Add a glucose reading | Reading is stored and returned in history |
| TC-07 | View glucose trend | Trend data is displayed correctly |
| TC-08 | Book an appointment | Appointment is saved and visible in the list |
| TC-09 | Reschedule or cancel an appointment | Appointment status is updated correctly |
| TC-10 | View prescriptions and meal plans | Records are loaded for the authenticated user |
| TC-11 | Send and view notifications | Notification is stored and can be retrieved |
| TC-12 | Start the app with Docker Compose | Backend, frontend, and database all start correctly |
<<<<<<< HEAD
=======
| TC-13 | Patient starts a chat with a doctor | Conversation is created and both users can see it |
| TC-14 | Send a message in a conversation | Message appears in real time without page refresh |
| TC-15 | Receive a message from another user | Message appears in real time without page refresh |
| TC-16 | Open a conversation with unread messages | Unread badge clears and messages are marked as read |
| TC-17 | Patient sends an SOS emergency message | Red bubble appears, admin receives instant WebSocket alert |
| TC-18 | Admin acknowledges an SOS message | SOS label changes to green acknowledged state |
| TC-19 | SOS message not acknowledged for 5 minutes | Scheduler re-sends alert to all admins |
| TC-20 | Unread badge on Chat nav item | Badge shows correct count and clears when chat is opened |
| TC-21 | New chat modal search | Filtering by name or role shows correct users |
| TC-22 | Chat on mobile screen | List and chat panels switch correctly with back button |
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

### 3.8 Recommended Test Execution

Run the following checks:

```bash
cd DiaCare
<<<<<<< HEAD
mvn test
=======
mvn clean test
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

cd ../DiaCareFrontend
npm run build

cd ..
docker compose up --build
```

### 3.9 Test Reporting

For each test run, record:

- test case ID
- date and time
- environment used
- actual result
- pass or fail status
- defects found

This gives a clear trace from requirements to implementation and to verification.
