import express from 'express';
import cors from 'cors';
import path from 'path';
// import dotenv from 'dotenv';

// dotenv.config();

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send("Backend server is running!");
})

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});