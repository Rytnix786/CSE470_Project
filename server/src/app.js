require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api', require('./modules/doctor/doctor.routes'));
app.use('/api', require('./modules/slots/slots.routes'));
app.use('/api', require('./modules/appointments/appointments.routes'));
app.use('/api', require('./modules/payments/payments.routes'));
app.use('/api', require('./modules/chat/chat.routes'));
app.use('/api', require('./modules/prescriptions/prescriptions.routes'));
app.use('/api', require('./modules/healthRecords/healthRecords.routes'));
app.use('/api', require('./modules/upload/upload.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BRACU Consultation API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
