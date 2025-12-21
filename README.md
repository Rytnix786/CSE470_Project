# BRACU Health — Doctor–Patient Consultation System

## Overview

BRACU Health is a comprehensive digital healthcare platform designed to facilitate secure and efficient communication between patients and healthcare providers. Built with modern web technologies, this full-stack application provides a complete telemedicine solution featuring appointment scheduling, real-time consultation, electronic prescriptions, and health record management.

The system implements robust role-based access control (RBAC) to ensure data privacy and security across three distinct user types: patients, doctors, and administrators. All medical data is handled with strict confidentiality protocols, adhering to healthcare data protection standards.

## Key Capabilities

- **Appointment Management**: Schedule, reschedule, and cancel medical consultations with verified healthcare professionals
- **Secure Payment Processing**: Integrated payment gateway with automated refund policies for canceled appointments
- **Real-time Consultation**: HIPAA-compliant chat system with file sharing capabilities for medical documents
- **Electronic Prescriptions**: Digital prescription creation and management with secure patient access
- **Health Record Tracking**: Comprehensive health monitoring with blood pressure, blood sugar, weight, and height tracking
- **Health Snapshot Dashboard**: Visual representation of patient health metrics with trend analysis
- **Role-based Notifications**: Secure, scoped notification system for all user interactions and system updates

## Features by Role

### Patient

- Search and browse verified doctors by specialization and availability
- Book, reschedule, and cancel appointments with healthcare providers
- Secure online payment processing with refund policy support
- Real-time consultation chat with file sharing capabilities
- Submit reviews and ratings for completed consultations
- Maintain personal health records with vital statistics tracking
- Access Health Snapshot dashboard for health trend visualization
- View and download electronic prescriptions from healthcare providers
- Receive role-specific notifications for appointment updates, payments, and prescriptions

### Doctor

- Create and manage professional profile with verification credentials
- Define availability schedules with customizable time slots
- Conduct real-time consultations with patients via secure chat
- Issue electronic prescriptions with medication details and instructions
- Access comprehensive patient health records and history
- View Health Snapshot for patient health trend analysis
- Review patient feedback and ratings for continuous improvement
- Receive notifications for appointment bookings, cancellations, and patient actions

### Administrator

- Verify doctor credentials and professional licenses
- Manage platform users and resolve account issues
- Monitor system activity and platform analytics
- Receive notifications for new doctor verification requests

## Core System Modules

### Appointments & Payments

The appointment system enables patients to browse doctor availability and schedule consultations. Integrated payment processing supports secure transactions with a comprehensive refund policy:
- Full refund for cancellations more than 48 hours before appointment
- 50% refund for cancellations between 24-48 hours before appointment
- No refund for cancellations within 24 hours of appointment

### Health Records & Health Snapshot

Patients can maintain comprehensive health records including blood pressure, blood sugar levels, weight, and height measurements. The Health Snapshot dashboard provides visual representations of health trends over time, enabling both patients and doctors to monitor health progress effectively.

### Consultation & Prescriptions

The real-time consultation system facilitates secure communication between patients and doctors through a HIPAA-compliant chat interface. Doctors can issue electronic prescriptions directly within the platform, which patients can access and download for pharmacy fulfillment.

## Notification System

The notification system is a secure, role-scoped subsystem that ensures users receive relevant updates while maintaining strict data privacy. Notifications are delivered through a centralized system with intelligent filtering based on:
- **recipientUserId**: Direct notifications to specific users
- **recipientRole**: Broadcast notifications to entire user roles

### Supported Event Types

- **Appointment Events**: Booking confirmations, cancellations, and rescheduling
- **Payment Events**: Transaction confirmations and refund processing
- **Prescription Events**: New prescription issuance from healthcare providers
- **Verification Events**: Doctor credential verification requests for administrators

### API Endpoints

- `GET /api/notifications` - Retrieve notifications for the authenticated user
- `PATCH /api/notifications/:id/read` - Mark specific notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### User Interface

The notification system features a responsive bell icon interface with:
- Real-time unread count indicators
- Type-specific badges for quick identification
- Role-appropriate empty states for each user type
- Loading skeletons for enhanced user experience
- Secure read/unread status management

## Tech Stack

### Frontend
- React.js for component-based user interface
- Tailwind CSS for responsive, utility-first styling
- React Router for client-side navigation
- Axios for HTTP client communication

### Backend
- Node.js runtime environment
- Express.js web application framework
- MongoDB NoSQL database with Mongoose ODM
- Socket.IO for real-time communication
- JSON Web Tokens (JWT) for authentication

### Security & Validation
- Zod for request validation and data sanitization
- bcrypt.js for password hashing
- Helmet.js for HTTP header security
- CORS configuration for cross-origin resource sharing

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