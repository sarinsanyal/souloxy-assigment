import express from 'express';
import cors from 'cors';
import registerAuth from './routes/auth/register.js';
import loginAuth from './routes/auth/login.js';
import chatUsersRoutes from './routes/users/chat-list.js';
import messagesRoutes from './routes/messages/messages.js';

import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Map to store userId => socketId
const userSocketMap = new Map();

// Socket.io setup
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user registration
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`Registered user ${userId} with socket ID ${socket.id}`);
  });

  // Handle incoming messages
  socket.on("sendMessage", (message) => {
    console.log("Server received socket message:", message.content);

    const receiverSocketId = userSocketMap.get(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    //   console.log(`Message forwarded to user ${message.receiverId} at socket ${receiverSocketId}`);
    } else {
    //   console.log(`No active socket found for Id ${message.receiverId}`);
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    for (const [userId, id] of userSocketMap.entries()) {
      if (id === socket.id) {
        userSocketMap.delete(userId);
        console.log(`Disconnected user ${userId} and cleaned up`);
        break;
      }
    }
  });
});

// API routes
app.get('/', (req, res) => res.send("Backend server is running!"));
app.use('/api/register', registerAuth);
app.use('/api/login', loginAuth);
app.use('/api/users/chat-list', chatUsersRoutes);
app.use('/api/messages', messagesRoutes);

// Start server
const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`\nServer is running at http://localhost:${PORT}`);
});
