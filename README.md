# BRACU Health (Doctor–Patient Consultation System)

BRACU Health is a full-stack doctor–patient consultation system with secure authentication and role-based access control.

## 🔔 Notification System (Scoped & Secure)

The notification system solves critical privacy issues where all roles could previously see all notifications. Now, notifications are securely scoped to individual recipients.

### How Scoping Works
- Each notification has `recipientUserId` (specific user) or `recipientRole` (broadcast to role)
- Backend enforces strict access control - users can only read/mark notifications intended for them
- Cross-role leakage eliminated through database-level filtering

### Supported Event Types
- **Appointment**: Booking confirmation, cancellation, rescheduling
- **Payment/Refund**: Transaction success, refund processing
- **Prescription**: New prescription issued by doctor
- **Doctor Verification**: Admin notifications for pending verification requests

### API Endpoints
- `GET /api/notifications` - Get notifications for current user
- `PATCH /api/notifications/:id/read` - Mark specific notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### UI Behavior
- Type badges for quick identification (Appointment, Payment, Prescription, etc.)
- Role-specific empty states (different messages for Patient, Doctor, Admin)
- Loading skeletons for better UX during fetch
- Safe click handling with navigation guards

### Security Note
Only the intended recipient can read or mark notifications as read. Unauthorized access attempts are blocked at the backend level.

## Key Features

### PATIENT

- Doctor search & booking
- Online consultation (chat)
- Secure payment
- Reviews & ratings for doctors
- Health records management (BP, Sugar, Weight, Height)
- Health Snapshot dashboard
- View prescriptions
- Receive notifications for payments, prescriptions, and appointment updates

### DOCTOR

- Profile management
- Availability slots
- Consultation chat
- End consultation
- Create prescriptions
- View patient health records + Health Snapshot
- View patient reviews & average rating
- Receive notifications for appointment updates and patient actions

### ADMIN

- Verify doctors
- Manage platform users
- Receive notifications for new doctor verification requests

## Tech Stack

### Frontend

- React
- Tailwind CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose

### Validation

- Zod

### Realtime

- Socket.IO

## Health Snapshot

- Animated dashboard card
- Shows latest:
  - Blood Pressure
  - Blood Sugar
  - Weight
  - Height
  - Last updated date
- Supports light & dark mode

## UI / UX

- Tailwind CSS
- Neon-accent dark mode + light mode toggle
- Responsive design
- Modern dashboard components (uiverse-inspired)

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

## Default Test Accounts

After seeding:

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@bracu.ac.bd      | Admin@123  |
| Doctor  | doctor1@example.com    | Doctor@123 |
| Patient | patient1@example.com   | Patient@123|

## API Documentation

See `docs/API.md` for complete endpoint documentation or import `docs/postman-collection.json` into Postman.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email

#### Doctors (Public)
- `GET /api/doctors` - List verified doctors (with filters)
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/:id/slots` - Get doctor availability

#### Doctor (Protected)
- `POST /api/doctor/me/profile` - Create/update profile
- `POST /api/doctor/me/slots` - Create availability slot
- `GET /api/doctor/appointments/me` - Get appointments

#### Admin (Protected)
- `GET /api/admin/doctors/pending` - List pending doctors
- `PATCH /api/admin/doctors/:id/verify` - Verify/reject doctor

#### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/me` - Get user appointments
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule

#### Payments
- `POST /api/payments/init` - Initialize payment
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/refund` - Refund payment

#### Chat
- `GET /api/chat/:appointmentId/messages` - Get chat history
- Socket.IO events: `join-room`, `send-message`, `receive-message`

#### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/patient/:id` - Get patient prescriptions

#### Health Records
- `POST /api/health-records` - Create health record
- `GET /api/health-records/me` - Get user health records

#### Notifications
- `GET /api/notifications` - Get notifications for current user
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

## Security & RBAC

### Role-Based Route Protection
All API endpoints are protected with role-based access control:
- Patient routes require `PATIENT` role
- Doctor routes require `DOCTOR` role
- Admin routes require `ADMIN` role
- Public routes (doctor listings) require no authentication

### Data Isolation Rules
- Patients can only access their own appointments, prescriptions, and health records
- Doctors can only access their own slots, appointments, and prescriptions
- Admins can access verification requests but no patient/doctor data
- All data access is filtered at the database query level

### Notification Scoping
- Enforced on backend with recipient-based filtering
- Users cannot access notifications intended for other users or roles
- Read operations are secured with authorization checks

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

## Development

### Code Structure
- **MVC Pattern**: Models, Controllers, Routes separated
- **Middleware Chain**: Auth → Validation → Controller → Response
- **Error Handling**: Centralized error handler
- **Validation**: Zod schemas for all inputs

### Adding New Features
1. Create model in `server/src/models/`
2. Create module in `server/src/modules/[feature]/`
3. Add routes in module
4. Register routes in `app.js`
5. Create API service in `client/src/api/`
6. Create page components in `client/src/pages/`
7. Add routes in `App.jsx`

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running: `mongod --version`
- Verify MONGODB_URI in server/.env
- For Atlas: whitelist your IP

### Port Already in Use
- Change PORT in server/.env
- Change VITE_API_URL in client/.env accordingly

### Socket.IO Connection Failed
- Ensure VITE_SOCKET_URL matches backend server
- Check CORS configuration in server

### File Upload Not Working
- Verify `server/uploads/` directory exists
- Check file size limits in multer config

## Production Deployment

### Backend (Railway/Render/Heroku)
1. Set all environment variables
2. Use MongoDB Atlas for production DB
3. Set NODE_ENV=production
4. Configure CORS for production client URL

### Frontend (Vercel/Netlify)
1. Set VITE_API_URL to production backend
2. Build: `npm run build`
3. Deploy `dist/` folder

## Changelog / Recent Updates

### Notification System
- ✅ Implemented full notification system (server + client)
- ✅ Fixed privacy issue where all roles saw all notifications
- ✅ Added notifications module, model, controller, routes, utilities
- ✅ Integrated notifications into appointments, payments, prescriptions, doctor verification
- ✅ Added notifications API client + NotificationContext using real API
- ✅ Notification UI: NotificationBell + NotificationPanel with type badges
- ✅ Added role-specific empty states and safe click handling
- ✅ Implemented read/read-all endpoints with security checks
- ✅ Improved UX with loading skeletons and proper state management

### Other Improvements
- ✅ Fixed notification refetch issues on tab/route switching
- ✅ Fixed stale notifications appearing on refresh
- ✅ Enhanced UI/UX polish with modern components
- ✅ Improved error handling and crash prevention
- ✅ Added Height field to health records
- ✅ Implemented patient-side cancellation with refund policy

## Important Notes

- Do not commit .env
- node_modules is ignored
- Designed for academic project (CSE470)

## Contributing

This is a CSE470 course project. For academic use only.

## License

MIT License - Academic Project
