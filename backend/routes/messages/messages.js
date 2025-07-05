import express from 'express';
import prisma from '../../lib/prisma.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const { content, type, receiverId } = req.body;
    const senderId = req.user.userId;

    if (!content || !type || !receiverId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const message = await prisma.message.create({
            data: {
                content,
                type,
                senderId,
                receiverId,
                isRead: false,
            },
            select: {
                id: true,
                content: true,
                type: true,
                createdAt: true,
                senderId: true,
                receiverId: true,
                isRead: true,
            }
        });

        const formatted = {
            ...message,
            isSender: true, 
        };

        return res.status(201).json(formatted);
    } catch (err) {
        console.log("Unexpected Error: ", err);
        return res.status(500).json({ message: "Some unknown error occurred" });
    }
});


router.get('/:receiverId', authenticateToken, async (req, res) => {
    const senderId = req.user.userId;
    const receiverId = parseInt(req.params.receiverId);

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ],
            },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                content: true,
                type: true,
                createdAt: true,
                senderId: true,
                receiverId: true,
                isRead: true,
            },
        });

        const mapped = messages.map(msg => ({
            ...msg,
            isSender: msg.senderId === senderId
        }));

        res.json(mapped);

    }
    catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Something went wrong while fetching messages" });
    }
})


export default router;