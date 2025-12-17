# BRACU CSE470 Doctor-Patient Consultation System

A comprehensive full-stack telemedicine platform built with MERN stack (MongoDB, Express, React, Node.js).

## Features

### 👥 Role-Based Access Control
- **Patient**: Book appointments, consult doctors, manage health records
- **Doctor**: Manage profile, set availability, conduct consultations, write prescriptions
- **Admin**: Verify doctors, manage system

### 🔐 Authentication & Authorization
- JWT-based authentication
- Email verification system
- Role-based route protection

### 🩺 Doctor Management (FR5.1, FR5.2)
- Doctor profile creation with license verification
- Admin verification workflow
- Searchable doctor directory with filters

### 📅 Availability & Booking (FR5.4, FR1.1, FR1.2, FR1.3)
- Doctors set custom availability slots
- Patients search doctors by availability
- Real-time slot booking with conflict prevention
- Appointment rescheduling and cancellation

### 💳 Payment System (FR4.1-FR4.4)
- Mock payment gateway integration
- Payment status tracking
- Automated email receipts
- Refund processing

### 💬 Online Consultation (FR2.1-FR2.4)
- Real-time chat using Socket.IO
- File/image upload capability
- Consultation session management

### 📝 Prescriptions & Health Records (FR3.1-FR3.4)
- Digital prescription generation
- Patient health record management
- Prescription history and download

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB (Atlas/Local)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

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

### Prerequisites
- Node.js >= 18.x
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### 1. Clone and Install

```bash
# Navigate to project
cd bracu-consultation-system

# Install all dependencies (root, server, client)
npm run install-all
```

### 2. Environment Configuration

#### Server (.env)
Create `server/.env` based on `server/.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bracu-consultation
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bracu-consultation

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email (Optional - falls back to console logging if not provided)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@bracu-consultation.com

# Client URL
CLIENT_URL=http://localhost:5173
```

#### Client (.env)
Create `client/.env` based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the Application

#### Option 1: Run Both (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 4. Seed Database (Optional)

```bash
cd server
npm run seed
```

This creates:
- Default admin user: `admin@bracu.ac.bd` / `Admin@123`
- Sample doctors and patients
- Test appointments and data

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

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

## Contributing

This is a CSE470 course project. For academic use only.

## License

MIT License - Academic Project

## Contact

For questions: Contact BRACU CSE470 course instructors
