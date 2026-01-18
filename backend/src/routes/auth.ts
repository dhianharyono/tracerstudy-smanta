import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

// Rate limiting untuk login dan register
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 10, // maksimal 10 request per menit
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper untuk verifikasi CAPTCHA
const verifyCaptcha = async (token: string) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Jika secret key tidak ada atau masih default, gunakan test key yang cocok dengan frontend
  const finalSecretKey = (!secretKey || secretKey === 'your_recaptcha_secret_key_here')
    ? '6LeIxAcTAAAAAGG-vFI1TnRWxMZ_S8yxS90vCPm5' // Global Google test secret key
    : secretKey;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${finalSecretKey}&response=${token}`
    );
    return response.data.success;
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return false;
  }
};

// Definisi Custom Request untuk menangani req.user dari middleware authenticate
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
    // Tambahkan properti lain yang mungkin ditambahkan oleh middleware auth
  };
}

const router = express.Router();

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['alumni', 'admin', 'student'])
      .withMessage('Invalid role'),
    body('captchaToken').notEmpty().withMessage('CAPTCHA is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role, captchaToken } = req.body;

      // Verifikasi CAPTCHA
      const isCaptchaValid = await verifyCaptcha(captchaToken);
      if (!isCaptchaValid) {
        return res.status(400).json({ message: 'Invalid CAPTCHA. Please try again.' });
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
      });

      await user.save();

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || jwtSecret === 'secret') {
        console.warn('WARNING: Using default or missing JWT_SECRET. This is insecure for production.');
      }

      const token = jwt.sign(
        { userId: user._id },
        jwtSecret || 'secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          badges: user.badges,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const user = await User.findOne({ username }).populate('badges');
      if (!user) {
        return res.status(400).json({ message: 'Username tidak ditemukan' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password salah' });
      }

      const jwtSecret = process.env.JWT_SECRET;
      const token = jwt.sign(
        { userId: user._id },
        jwtSecret || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          questionnaireCompleted: user.questionnaireCompleted,
          profile: user.profile,
          badges: user.badges,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get current user
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // req.user._id sekarang aman karena menggunakan AuthenticatedRequest
      const user = await User.findById(req.user!._id).select('-password').populate('badges');
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
