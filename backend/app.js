import express from 'express';
import cors from 'cors';

import registerAuth from './routes/auth/register.js';
import loginAuth from './routes/auth/login.js';
import chatUsersRoutes from './routes/users/chat-list.js';
import messagesRoutes from './routes/messages/messages.js';
import readMessagesRoutes from './routes/messages/read.js';

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://souloxy-assigment.vercel.app"],
  credentials: true
}));

app.use(express.json());

// API Routes
app.get('/', (req, res) => res.send("Backend server is running!"));
app.use('/api/register', registerAuth);
app.use('/api/login', loginAuth);
app.use('/api/users/chat-list', chatUsersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/messages/read', readMessagesRoutes);

export default app;
