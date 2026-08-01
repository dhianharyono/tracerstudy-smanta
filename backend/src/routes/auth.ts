import express, { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { sendPasswordResetEmail, sendEmailVerification } from '../utils/mailer';

// Rate limiting untuk login dan register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request
  message: 'Terlalu banyak permintaan akses, silakan coba lagi dalam 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Pengetatan login brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 kali percobaan gagal sebelum diblokir sementara
  skipSuccessfulRequests: true,
  message: 'Terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.',
});

// Helper untuk verifikasi CAPTCHA
const verifyCaptcha = async (token: string) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Jika secret key tidak ada atau masih default, gunakan test key yang cocok dengan frontend
  const finalSecretKey =
    !secretKey || secretKey === 'your_recaptcha_secret_key_here'
      ? '6LeIxAcTAAAAAGG-vFI1TnRWxMZ_S8yxS90vCPm5' // Global Google test secret key
      : secretKey;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${finalSecretKey}&response=${token}`,
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
      .isLength({ min: 8 })
      .withMessage('Password minimal harus 8 karakter')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'),
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
        return res
          .status(400)
          .json({ message: 'Invalid CAPTCHA. Please try again.' });
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        isEmailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
      });

      await user.save();

      // Kirim email verifikasi
      await sendEmailVerification(user.email, verificationToken, user.username);

      // Jangan auto-login — user harus verifikasi email dulu
      res.status(201).json({
        requiresEmailVerification: true,
        email: user.email,
        message: 'Pendaftaran berhasil! Silakan cek email Anda untuk melakukan verifikasi akun.',
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Login
router.post(
  '/login',
  authLimiter,
  loginLimiter,
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
        return res.status(400).json({
          message: 'Username atau password yang Anda masukkan salah',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Username atau password yang Anda masukkan salah' });
      }

      // Cek verifikasi email — user lama (yang tidak memiliki token verifikasi atau isEmailVerified bukan false) dianggap sudah verified
      if (user.isEmailVerified === false && user.emailVerificationToken) {
        return res.status(403).json({
          message: 'Email Anda belum diverifikasi. Silakan cek kotak masuk email Anda dan klik tautan verifikasi.',
          requiresEmailVerification: true,
          email: user.email,
        });
      }

      const jwtSecret = process.env.JWT_SECRET;
      const token = jwt.sign({ userId: user._id }, jwtSecret || 'secret', {
        expiresIn: '2d',
      });

      // Set cookie for security
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      });

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          schoolRole: user.schoolRole,
          questionnaireCompleted: user.questionnaireCompleted,
          isHidden: user.isHidden,
          profile: user.profile,
          university: user.university,
          job: user.job,
          badges: user.badges,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // req.user._id sekarang aman karena menggunakan AuthenticatedRequest
      const user = await User.findById(req.user!._id)
        .select('-password')
        .populate('badges');
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Forgot Password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Silakan masukkan email yang valid')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          message: 'Email tidak terdaftar dalam sistem Tracer Study SMANTA. Silakan periksa kembali email Anda.',
        });
      }

      // Cegah permintaan berulang dalam kurun waktu 60 detik (cooldown 60s)
      if (user.resetPasswordExpires) {
        const createdTime = user.resetPasswordExpires.getTime() - 60 * 60 * 1000;
        const secondsPassed = Math.floor((Date.now() - createdTime) / 1000);
        if (secondsPassed < 60) {
          const waitSeconds = 60 - secondsPassed;
          return res.status(429).json({
            message: `Instruksi reset password baru saja dikirim. Silakan tunggu ${waitSeconds} detik sebelum mencoba lagi.`,
          });
        }
      }

      // Generate random 32-byte hex token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam expiry
      await user.save();

      // Kirim email reset password via Nodemailer
      const emailResult = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.profile?.fullName || user.username,
      );

      res.json({
        message: 'Instruksi reset password telah dikirim ke email Anda.',
        emailSent: emailResult.success,
        emailError: emailResult.error,
        resetToken: resetToken,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Reset Password
router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Token reset password diperlukan'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password minimal harus 8 karakter')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          message: 'Token reset password tidak valid atau sudah kadaluarsa.',
        });
      }

      // Hash password baru
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Clear reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({
        message: 'Password berhasil diperbarui. Silakan login kembali dengan password baru Anda.',
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Verify Email
router.get(
  '/verify-email',
  async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Token verifikasi tidak valid.' });
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
      });

      if (!user) {
        return res.status(400).json({
          message: 'Token verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta pengiriman ulang email verifikasi.',
          expired: true,
        });
      }

      // Jika user sudah terverifikasi sebelumnya (misal dari klik ganda atau email scanner)
      if (user.isEmailVerified) {
        return res.json({
          message: 'Email Anda sudah terverifikasi sebelumnya. Silakan login.',
          success: true,
        });
      }

      // Cek apakah token sudah kedaluwarsa
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return res.status(400).json({
          message: 'Token verifikasi sudah kedaluwarsa. Silakan minta pengiriman ulang email verifikasi.',
          expired: true,
        });
      }

      user.isEmailVerified = true;
      await user.save();

      res.json({
        message: 'Email berhasil diverifikasi! Akun Anda sekarang aktif. Silakan login.',
        success: true,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Resend Verification Email
const resendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 1,
  message: 'Silakan tunggu 60 detik sebelum mengirim ulang email verifikasi.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/resend-verification',
  resendLimiter,
  [body('email').isEmail().withMessage('Email tidak valid')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      // Selalu kembalikan response yang sama untuk menghindari user enumeration
      const genericMessage = 'Jika email terdaftar dan belum diverifikasi, email verifikasi baru telah dikirim.';

      if (!user || user.isEmailVerified === true || user.isEmailVerified === undefined) {
        return res.json({ message: genericMessage });
      }

      // Generate token baru
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      user.emailVerificationToken = hashedVerificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      await sendEmailVerification(user.email, verificationToken, user.username);

      res.json({ message: genericMessage });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
