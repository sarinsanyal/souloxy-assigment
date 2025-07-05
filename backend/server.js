import express from 'express';
import cors from 'cors';
import registerAuth from './routes/auth/register.js';
import loginAuth from './routes/auth/login.js';
import chatUsersRoutes from './routes/users/chat-list.js';
import messagesRoutes from './routes/messages/messages.js';
import readMessagesRoutes from './routes/messages/read.js'

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
}
));
app.use(express.json());

const userSocketMap = new Map();

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("register", (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log(`Registered user ${userId} with socket ID ${socket.id}`);
    });

    socket.on("sendMessage", (message) => {
        console.log("Server received socket message:", message.content);

        const receiverSocketId = userSocketMap.get(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", message);
            console.log(`Message forwarded to user ${message.receiverId} at socket ${receiverSocketId}`);
        } else {
            console.log(`No active socket found for Id ${message.receiverId}`);
        }
    });

    socket.on("messagesRead", ({ senderId, readerId }) => {
    console.log(`Received messagesRead from ${readerId} for sender ${senderId}`);
    
    const socketId = userSocketMap.get(Number(senderId));
    if (socketId) {
        console.log(`Found socketId: ${socketId} for sender ${senderId}`);
        io.to(socketId).emit("readReceipt", {
            readerId: Number(readerId),
        });
    } else {
        console.log(`No socket found for senderId ${senderId}`);
    }
});


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
app.use('/api/messages/read', readMessagesRoutes);

// Start server
const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
    console.log(`\nServer is running at http://localhost:${PORT}`);
});
