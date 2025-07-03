import express from 'express';
import cors from 'cors';
import registerAuth from './routes/auth/register.js'
import loginAuth from './routes/auth/login.js'
import chatUsersRoutes from './routes/users/chat-list.js'

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Backend server is running!");
})

app.use('/api/register', registerAuth);
app.use('/api/login', loginAuth);
app.use('/api/users/chat-list', chatUsersRoutes);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});