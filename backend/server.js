import express from 'express';
import cors from 'cors';
import path from 'path';
import registerAuth from './routes/auth/register.js'
import loginAuth from './routes/auth/login.js'

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

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});