import express from 'express';
import prisma from '../../lib/prisma.js'
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.post('/:receiverId', authenticateToken, async(req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = parseInt(req.params.receiverId);

        await prisma.message.updateMany({
            where: {
                senderId: receiverId,
                receiverId: senderId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        res.status(200).json({message: "Marked as read"});
    } catch (err){
        console.error("Something went wrong in marking messages read: ", err);
        return res.status(500).json({message: "Internal Server Error in marking messages read"});
    }
})

export default router;