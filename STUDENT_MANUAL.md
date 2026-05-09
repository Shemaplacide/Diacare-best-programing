# DiaCare Student Manual

This manual explains the DiaCare project in simple terms so students can understand what it does, how it is organized, and how to run it.

<<<<<<< HEAD
=======
## Reference Organization

The reference organization for this project is Rwanda Diabetics Association. In simple terms, DiaCare is presented as a prototype system that such an organization could use to support diabetes care coordination, patient monitoring, doctor communication, and emergency follow-up.

The full project README includes the main diagrams needed for submission:

- architecture diagram
- component diagram
- use case diagram
- class diagram
- entity relationship diagram
- sequence diagram
- activity diagram
- deployment diagram

>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
## What DiaCare Is

DiaCare is a diabetes care management system. It helps different users manage health information in one place.

### Main User Roles

<<<<<<< HEAD
- Patient: records glucose readings, books appointments, and views prescriptions or meal plans
- Doctor: reviews patient data and manages care
- Admin: manages users, reports, and system records
=======
- Patient: records glucose readings, books appointments, views prescriptions or meal plans, and chats with their doctor or administration
- Doctor: reviews patient data, manages care, and communicates with patients and admin through chat
- Admin: manages users, reports, system records, and handles patient complaints and SOS emergencies through chat
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

## Main Features

- user registration and login
- secure access using JWT authentication
- glucose reading tracking
- appointment management
- prescription management
- meal plan viewing
- notifications
- dashboards for each user role
<<<<<<< HEAD
=======
- real-time chat between doctors, patients, and admin
- SOS emergency messaging with instant admin alerts
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

## Project Structure

The project has two major parts:

- `DiaCare`: Spring Boot backend
- `DiaCareFrontend`: React frontend

The backend provides the API and connects to the database. The frontend displays the screens and sends requests to the backend.

## Prototype Summary

The prototype is the first working version of the system. It was built to test the most important features before finishing the full application.

It shows that:

- users can log in securely
- data can be saved and read from the database
- different roles can access different features
- the frontend and backend can work together
<<<<<<< HEAD

## Design Pattern Used
=======
- users can communicate in real time through chat

## Design Patterns Used

### Repository Pattern
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

The project mainly uses the `Repository Pattern`.

This means:

- controllers handle requests
- services hold business logic
- repositories access the database

This keeps the code clean and easier to maintain.

<<<<<<< HEAD
=======
### Observer Pattern

The real-time chat uses an observer-style approach through WebSocket messaging. When a user sends a message, the server immediately pushes it to the recipient without the recipient needing to refresh the page. This is similar to how WhatsApp delivers messages instantly.

>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
## Software Best Practices Used

- code is organized into layers
- sensitive values are loaded from environment variables
- validation is used for input data
- errors are handled consistently
- API calls are centralized in one client file
- the frontend is built as reusable components
<<<<<<< HEAD
=======
- response DTOs are used to safely transfer data between the backend and frontend without exposing database internals

## Real-Time Chat Module

### What it does

The chat module allows any two users with different roles to message each other in real time. Messages are stored in the database so history is preserved when the page is refreshed.

### How conversations work

A conversation is a private thread between exactly two users. To start a new conversation, a user clicks the pencil icon in the Chats header and picks a person from a searchable list. The list only shows users with a different role, so patients see doctors and admins, doctors see patients and admins, and admins see everyone.

### Unread badges

A red badge appears on the Chat item in the sidebar navigation showing how many unread messages the user has. Inside the chat page, each conversation row also shows its own unread count. The badge clears automatically when the conversation is opened.

### Read receipts

Each sent message shows a tick icon in the bottom corner:

- a single grey tick means the message was sent
- a double blue tick means the recipient has read it

### SOS Emergency Messaging

Patients can flag a message as an SOS emergency by tapping the red triangle button in the input bar before sending. When this happens:

1. The message bubble turns red and shows an SOS label.
2. The admin receives an instant alert at the top of their chat page showing the patient name and message.
3. If no admin acknowledges the alert within five minutes, the system automatically re-sends the alert.
4. Doctors and admins can click Acknowledge on the message to confirm they have seen it. The label then changes to a green confirmed state.

This feature is designed so that patients in urgent situations can get help quickly even if their doctor is not immediately available.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

## How To Run The Project With Docker

### Requirements

- Docker
- Docker Compose

### Start the application

From the project root, run:

```bash
docker compose up --build
```

### Open the application

- Frontend: `http://localhost:5173`
- Backend Swagger UI: `http://localhost:8085/swagger-ui.html`

### Stop the application

```bash
docker compose down
```

## How Version Control Works Here

Version control is used to save project changes and prevent code loss. For this project, the important items to track are:

- source code
- database scripts
- Docker files
- documentation
- configuration files

Generated files like `node_modules` and `target` should not be tracked.

## Test Plan Summary

The software test plan checks whether the system works correctly before submission.

### What should be tested

- login and registration
- secured API access
- patient, doctor, and admin workflows
- glucose logging
- appointments
- prescriptions and meal plans
- notifications
<<<<<<< HEAD
=======
- real-time chat message delivery
- SOS emergency alerts and acknowledgement
- unread message badge counts
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
- Docker deployment

### Example test steps

1. Start the system with Docker Compose.
2. Register or log in a user.
3. Open protected screens.
4. Add and view health data.
<<<<<<< HEAD
5. Confirm the correct data is returned.

### Expected result

The system should run without errors, protect restricted pages, and save/retrieve data correctly.
=======
5. Open the Chat page and start a conversation with another user.
6. Send a message and confirm it appears instantly on the other side without refreshing.
7. Send an SOS message as a patient and confirm the admin sees the alert.
8. Acknowledge the SOS and confirm the label updates.
9. Confirm the unread badge clears when the conversation is opened.

### Expected result

The system should run without errors, protect restricted pages, save and retrieve data correctly, and deliver messages in real time.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

## Quick Student Checklist

- Read the prototype section first.
<<<<<<< HEAD
- Learn the repository pattern used in the backend.
- Review the Docker setup and run the project.
=======
- Learn the repository pattern and observer pattern used in the backend.
- Review the Docker setup and run the project.
- Test the chat feature between two different browser sessions logged in as different users.
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
- Use the test plan to verify the application.
- Include both documents in your submission.
