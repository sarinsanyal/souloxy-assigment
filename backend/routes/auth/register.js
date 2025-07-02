import express from 'express';
import prisma from '../../lib/prisma.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name, !email, !password, !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists. Use a different email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        return res.status(201).json({
            message: `User: ${name} created successfully as ${role}`,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        console.log("Signup Error: ", err);
        res.status(500).json({ message: "Something went wrong " })
    }
})

export default router;