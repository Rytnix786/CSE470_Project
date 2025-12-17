require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const ChatMessage = require('./models/ChatMessage');
const Appointment = require('./models/Appointment');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId}`);

  // Join appointment room
  socket.on('join-room', async (appointmentId) => {
    try {
      // Verify user has access to this appointment
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        socket.emit('error', { message: 'Appointment not found' });
        return;
      }

      const hasAccess = 
        appointment.patientId.toString() === socket.userId ||
        appointment.doctorId.toString() === socket.userId;

      if (!hasAccess) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      socket.join(appointmentId);
      console.log(`User ${socket.userId} joined room ${appointmentId}`);
      socket.emit('joined-room', { appointmentId });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { appointmentId, message, fileUrl } = data;

      // Save message to database
      const chatMessage = await ChatMessage.create({
        appointmentId,
        senderId: socket.userId,
        message: message || '',
        fileUrl: fileUrl || '',
      });

      await chatMessage.populate('senderId', 'name');

      // Broadcast to room
      io.to(appointmentId).emit('receive-message', {
        _id: chatMessage._id,
        appointmentId: chatMessage.appointmentId,
        senderId: chatMessage.senderId,
        message: chatMessage.message,
        fileUrl: chatMessage.fileUrl,
        createdAt: chatMessage.createdAt,
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // User is typing
  socket.on('typing', (appointmentId) => {
    socket.to(appointmentId).emit('user-typing', { userId: socket.userId });
  });

  // User stopped typing
  socket.on('stop-typing', (appointmentId) => {
    socket.to(appointmentId).emit('user-stop-typing', { userId: socket.userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

// Connect to database and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💬 Socket.IO enabled`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});
