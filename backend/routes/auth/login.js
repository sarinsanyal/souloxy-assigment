import express from "express";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";

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

        else {
            return res.status(200).json({
                message: `User ${User.name} logged in`
            })
        }


    } catch (err) {
        console.log("Login Error: ", err);
        res.status(500).json({ message: "Something went wrong " })
    }
})

export default router;