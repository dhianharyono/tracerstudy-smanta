import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
    };
}

const router = express.Router();

// Get profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id).select('-password').populate('badges');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { username, email, password, profile, isMentor } = req.body;
        const userId = req.user!._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ... existing username/email checks ...
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already taken' });
            }
            user.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }

        if (isMentor !== undefined && user.role === 'alumni') {
            user.isMentor = isMentor;
        }

        await user.save();

        const updatedUser = await User.findById(userId).select('-password');
        res.json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Graduate student to alumni
router.post('/graduate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'student') {
            return res.status(400).json({ message: 'Hanya akun student yang dapat dikonversi menjadi alumni' });
        }

        if (!user.profile?.graduationYear) {
            return res.status(400).json({ message: 'Harap isi tahun lulus terlebih dahulu di profil Anda' });
        }

        user.role = 'alumni';
        await user.save();

        res.json({ message: 'Selamat! Akun Anda telah menjadi alumni', role: 'alumni' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
