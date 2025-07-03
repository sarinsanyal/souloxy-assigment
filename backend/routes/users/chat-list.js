import express from "express";
import prisma from "../../lib/prisma.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express();

router.get('/', authenticateToken ,async (req,res) => {
    const {userId, userRole} = req.user;

    try{
        if (userRole === "PATIENT") {
            const User = await prisma.user.findUnique({
                where: {id: userId},
                include: {therapist: true}
            })
            if (!User.therapist) {
                return res.status(404).json({message: 'No assigned therapist'});
            }

            return res.json([{id: User.therapist.id, name: User.therapist.name}]);
        }

        if (userRole === "THERAPIST") {    
            const patients = await prisma.user.findMany({
                where: {assignedTherapistId: userId},
                select: {id: true, name: true}
            })

            return res.json(patients);
        }
        return res.json(403).json({message: "Unauthorized Role"});
    } catch (err) {
        console.log('Fetch Chat Users error: ', err);
        res.status(500).json({message: 'Server Error'});
    }
})

export default router;