import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join room based on user ID
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
  });

  // Handle chat messages
  socket.on('sendMessage', ({ sender, receiver, message }) => {
    io.to(receiver).emit('receiveMessage', { sender, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
