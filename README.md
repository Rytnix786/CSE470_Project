# BRACU Health — Doctor–Patient Consultation System

## Overview

**BRACU Health** is a full-stack doctor–patient consultation system designed to digitize the complete healthcare consultation lifecycle. The platform enables patients to discover verified doctors, book appointments, complete payments, consult in real time, receive prescriptions, and manage personal health records through a secure and user-friendly interface.

The system enforces **strict Role-Based Access Control (RBAC)** to ensure medical data privacy and security across three distinct user roles: **Patient**, **Doctor**, and **Administrator**. Each role is provided with clearly defined capabilities, ensuring proper data isolation and compliance with healthcare privacy principles.

Developed as part of the **CSE470: Software Engineering** course at **BRAC University**, this project emphasizes system correctness, security, scalability, and professional user experience.

---

## Key Capabilities

- **Appointment Management**: Book, reschedule, and cancel consultations with verified doctors
- **Secure Payment Processing**: Integrated payment flow with automated refund policy
- **Real-time Consultation**: Secure chat-based consultation with file sharing support
- **Electronic Prescriptions**: Digital prescription creation and patient access
- **Health Record Management**: Track vital health metrics securely
- **Health Snapshot Dashboard**: Visual overview of recent patient health metrics
- **Role-based Notifications**: Secure, scoped notification system for system events
- **RBAC Enforcement**: Strong role-based authorization and data isolation

---

## Features by Role

### Patient

- Search and browse verified doctors by specialization and availability
- Book, reschedule, and cancel appointments
- Secure online payment with refund policy support
- Real-time consultation chat with doctors
- Submit reviews and ratings after completed consultations
- Maintain personal health records (blood pressure, blood sugar, weight, height)
- View Health Snapshot dashboard
- Access and download electronic prescriptions
- Receive notifications for appointments, payments, and prescriptions

### Doctor

- Create and manage professional profile
- Define availability schedules with time slots
- View and manage assigned appointments
- Conduct secure real-time consultations
- Create and issue electronic prescriptions
- Access authorized patient health records and Health Snapshot
- View patient reviews and average ratings
- Receive notifications for appointment-related events

### Administrator

- Verify and approve doctor registrations
- Manage platform users
- Monitor system activity at a high level
- Receive notifications for doctor verification requests

---

## Core System Modules

### Appointments & Payments

Patients can browse doctor availability and schedule appointments. The payment system supports secure transactions and applies an automated refund policy:

- **Full refund** for cancellations more than 48 hours before appointment
- **50% refund** for cancellations between 24–48 hours
- **No refund** for cancellations within 24 hours

### Health Records & Health Snapshot

Patients can maintain personal health records including blood pressure, blood sugar levels, weight, and height. The **Health Snapshot** dashboard provides a concise visual summary of the most recent health metrics, accessible to both patients and authorized doctors.

### Consultation & Prescriptions

The consultation module enables secure, real-time communication between doctors and patients. Doctors can issue electronic prescriptions directly through the system, which patients can view and download.

---

## Notification System

The notification system is a secure, role-scoped subsystem designed to ensure users receive relevant updates without cross-role data leakage.

### Notification Scoping

Notifications are delivered using:
- **recipientUserId** — for user-specific notifications
- **recipientRole** — for role-specific notifications (e.g., admin alerts)

### Supported Events

- Appointment bookings, cancellations, and status updates
- Payment confirmations and refunds
- Prescription creation
- Doctor verification requests and decisions

### API Endpoints

- `GET /api/notifications` — Retrieve notifications for authenticated user
- `PATCH /api/notifications/:id/read` — Mark a notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

### User Interface Features

- Notification bell with unread count
- Type-based badges (Appointment, Payment, Prescription, Verification)
- Role-specific empty states
- Secure read/unread handling
- Loading skeletons for smooth UX

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JSON Web Tokens (JWT)

### Security & Validation
- Zod for request validation
- bcrypt.js for password hashing
- Helmet.js for HTTP security headers
- CORS configuration

---

## Project Structure

```
bracu-consultation-system/
├── server/              # Express backend
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── models/      # MongoDB models
│   │   ├── modules/     # Feature modules (auth, doctor, etc.)
│   │   ├── middlewares/ # Auth, error handling
│   │   ├── utils/       # Helper functions
│   │   ├── app.js       # Express app setup
│   │   └── server.js    # Server entry point
│   ├── uploads/         # File uploads storage
│   ├── .env.example     # Environment template
│   └── package.json
├── client/              # React frontend
│   ├── src/
│   │   ├── api/         # API service layer
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React Context providers
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Helper functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── .env.example     # Environment template
│   └── package.json
└── package.json         # Root package for scripts
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```
3. Setup environment variables:
   - Copy `.env.example` to `.env` in both `server/` and `client/` directories
   - Configure `MONGODB_URI` in `server/.env`
   - Configure `JWT_SECRET` in `server/.env`
   - Configure `VITE_API_URL` and `VITE_SOCKET_URL` in `client/.env`
4. Run the application:
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm run dev
   ```

## API Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Retrieve authenticated user details

### Doctors
- `GET /api/doctors` - List verified doctors with filtering options
- `GET /api/doctors/:id` - Retrieve specific doctor details
- `GET /api/doctors/:id/slots` - Retrieve doctor availability slots

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/me` - Retrieve user appointments
- `PATCH /api/appointments/:id/cancel` - Cancel specific appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule appointment

### Payments
- `POST /api/payments/init` - Initialize payment transaction
- `POST /api/payments/confirm` - Confirm payment completion
- `POST /api/payments/refund` - Process payment refund

### Consultation
- `GET /api/chat/:appointmentId/messages` - Retrieve chat history
- Socket.IO events: `join-room`, `send-message`, `receive-message`

### Prescriptions
- `POST /api/prescriptions` - Create new prescription
- `GET /api/prescriptions/patient/:id` - Retrieve patient prescriptions

### Health Records
- `POST /api/health-records` - Create new health record
- `GET /api/health-records/me` - Retrieve user health records

### Notifications
- `GET /api/notifications` - Retrieve user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

## Testing Guide

### Phase 1: Authentication & Doctor Verification
1. Register as Patient
2. Register as Doctor with license details
3. Login as Admin (admin@bracu.ac.bd)
4. Navigate to Verify Doctors
5. Verify the doctor
6. Login as Doctor - confirm profile is verified

### Phase 2: Availability & Search
1. Login as Doctor
2. Go to Manage Slots
3. Create availability slots for various dates
4. Login as Patient
5. Search doctors by specialization/availability
6. View doctor details and available slots

### Phase 3: Booking
1. As Patient, select a doctor and time slot
2. Book appointment
3. Verify slot is locked (not available to other patients)
4. Check appointment status
5. Test cancel/reschedule

### Phase 4: Payment
1. Navigate to pending appointment
2. Click "Pay Now"
3. Complete mock payment
4. Verify payment receipt email/console
5. Confirm appointment status changes to CONFIRMED

### Phase 5: Consultation
1. At appointment time, click "Start Consultation"
2. Test real-time messaging
3. Upload test file/image
4. Doctor ends consultation
5. Verify appointment status = COMPLETED

### Phase 6: Prescription & Records
1. After consultation, doctor creates prescription
2. Patient views prescription history
3. Patient adds health records (BP, sugar, weight)
4. Verify data persistence

## Security & RBAC Implementation

### Role-Based Access Control
All API endpoints implement strict role-based access control:
- Patient routes require `PATIENT` role authentication
- Doctor routes require `DOCTOR` role authentication
- Admin routes require `ADMIN` role authentication
- Public routes (doctor listings) require no authentication

### Data Isolation
The system enforces comprehensive data isolation through:
- Database query-level filtering for all user-specific data
- Patient access restricted to personal appointments, prescriptions, and health records
- Doctor access limited to their own availability slots, appointments, and prescriptions
- Admin access confined to verification requests without patient/doctor data exposure

### Notification Security
The notification system implements robust security measures:
- Recipient-based filtering enforced at the database level
- Prevention of cross-role notification access
- Authorization checks for all read operations

## Future Improvements

- Integration with external medical databases for comprehensive patient history
- Mobile application development for iOS and Android platforms
- Advanced analytics dashboard for healthcare providers
- Multi-language support for diverse patient populations
- Integration with third-party payment processors
- Video consultation capabilities
- Machine learning-based health trend prediction

## Authors

This project was developed as part of the CSE470: Software Engineering course at BRAC University.

**Course**: CSE470 - Software Engineering  
**University**: BRAC University  
**Academic Year**: 2025

## License

This project is licensed under the MIT License for academic purposes only.