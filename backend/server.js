import express from 'express';
import cors from 'cors';
import registerAuth from './routes/auth/register.js';
import loginAuth from './routes/auth/login.js';
import chatUsersRoutes from './routes/users/chat-list.js';
import messagesRoutes from './routes/messages/messages.js';
import readMessagesRoutes from './routes/messages/read.js';

import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://souloxy-assigment.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ["http://localhost:3000", "https://souloxy-assigment.vercel.app"],
  credentials: true
}));
app.use(express.json());

const userSocketMap = new Map();

//socket
io.on("connection", (socket) => {
  console.log(` User connected: ${socket.id}`);

  socket.on("register", (userId) => {
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);
    console.log(`Registered userId ${userId} with socket ${socket.id}`);
  });

  socket.on("sendMessage", (message) => {
    // console.log("Server received socket message:", message);

    const receiverSockets = userSocketMap.get(message.receiverId);
    if (receiverSockets && receiverSockets.size > 0) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", message);
        // console.log(`Forwarded to socket ${socketId}`);
      });
    } else {
      console.log(`No active socket for receiverId ${message.receiverId}`);
    }
  });

  socket.on("messagesRead", ({ senderId, readerId }) => {
    const senderSockets = userSocketMap.get(Number(senderId));
    if (senderSockets) {
      senderSockets.forEach((socketId) => {
        io.to(socketId).emit("readReceipt", {
          readerId: Number(readerId),
        });
      });
    } else {
      console.log(`No socket found for senderId ${senderId}`);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketSet] of userSocketMap.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          userSocketMap.delete(userId);
        }
        console.log(`Disconnected ${socket.id}, cleaned up for user ${userId}`);
        break;
      }
    }
  });
});

// API Routes
app.get('/', (req, res) => res.send("Backend server is running!"));
app.use('/api/register', registerAuth);
app.use('/api/login', loginAuth);
app.use('/api/users/chat-list', chatUsersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/messages/read', readMessagesRoutes);

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`\nServer is running at http://localhost:${PORT}`);
});

export default app;