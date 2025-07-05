import express from 'express';
import multer from 'multer';
import { storage } from '../../utils/cloudinary.js';

const upload = multer({ storage });
const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    return res.json({ url: req.file.path });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
