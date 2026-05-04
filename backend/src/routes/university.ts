import express from 'express';
import University from '../models/University';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// @desc    Get all universities
// @route   GET /api/universities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Search universities
// @route   GET /api/universities/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const universities = await University.find({
      name: { $regex: q as string, $options: 'i' },
    })
      .limit(10)
      .sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add a new university
// @route   POST /api/universities
// @access  Private
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { name, type, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'University name is required' });
    }

    let university = await University.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (university) {
      return res.status(400).json({ message: 'University already exists' });
    }

    university = await University.create({
      name,
      type: type || '',
      location: location || '',
      addedBy: req.user._id,
      isVerified: req.user.role === 'admin',
    });

    res.status(201).json(university);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
