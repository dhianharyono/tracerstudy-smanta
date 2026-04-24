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

        // Validation
        if (!username) return res.status(400).json({ message: 'Username wajib diisi' });
        if (!email) return res.status(400).json({ message: 'Email wajib diisi' });
        
        const fullName = profile?.fullName?.trim();
        if (!fullName) return res.status(400).json({ message: 'Nama lengkap wajib diisi' });
        if (fullName.length < 3) return res.status(400).json({ message: 'Nama lengkap terlalu pendek (minimal 3 karakter)' });
        if (!/^[a-zA-Z\s\.\']+$/.test(fullName)) return res.status(400).json({ message: 'Nama lengkap hanya boleh berisi huruf' });
        if (/^[\.\-\_\s]+$/.test(fullName) || ['null', 'undefined', '-', '.'].includes(fullName.toLowerCase())) {
            return res.status(400).json({ message: 'Nama lengkap tidak valid' });
        }

        if (user.role !== 'admin' && user.role !== 'school') {
            if (!profile?.entryYear) return res.status(400).json({ message: 'Tahun masuk wajib diisi' });
            if (!profile?.graduationYear) return res.status(400).json({ message: 'Tahun lulus wajib diisi' });
        }

        // Check for existing username/email
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username sudah digunakan' });
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email sudah digunakan' });
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

        // Auto-complete questionnaire status if university data is now complete
        if (user.role === 'alumni' && !user.questionnaireCompleted) {
            if (user.university?.name && user.university?.major) {
                user.questionnaireCompleted = true;
            }
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
