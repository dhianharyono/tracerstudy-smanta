import express, { Request, Response } from 'express';
import Major from '../models/Major';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// GET all majors
router.get('/', async (req: Request, res: Response) => {
  try {
    const majors = await Major.find().sort({ name: 1 });
    res.json(majors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH majors
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const query = q ? { name: { $regex: q as string, $options: 'i' } } : {};
    const majors = await Major.find(query).limit(20).sort({ name: 1 });
    res.json(majors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ADD new major (Authenticated users)
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Major name is required' });

    const existing = await Major.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existing) return res.status(400).json({ message: 'Major already exists' });

    const major = new Major({
      name: name.trim(),
      addedBy: req.user?._id,
      isVerified: req.user?.role === 'admin',
    });

    await major.save();
    res.status(201).json(major);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
