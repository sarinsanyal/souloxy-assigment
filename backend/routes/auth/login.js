import express from "express";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Both fields are necessarry" })
    }
    try {
        const User = await prisma.user.findUnique({ where: { email: email } })
        if (!User) {
            return res.status(404).json({ message: "User not found" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, User.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Wrong Password entered" });
        }

        const token = jwt.sign({
            userId: User.id,
            userName: User.name,
            userEmail: User.email,
            userRole: User.role,
        },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            message: `User ${User.name} logged in`,
            token 
        })


    } catch (err) {
        console.log("Login Error: ", err);
        res.status(500).json({ message: "Something went wrong " })
    }
})

export default router;