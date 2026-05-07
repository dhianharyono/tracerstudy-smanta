import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import alumniRoutes from './routes/alumni';
import adminRoutes from './routes/admin';
import studentRoutes from './routes/student';
import userRoutes from './routes/user';
import eventRoutes from './routes/events';
import analyticsRoutes from './routes/analytics';
import publicRoutes from './routes/public';
import schoolRoutes from './routes/school';
import jobRoutes from './routes/job';
import universityRoutes from './routes/university';
import majorRoutes from './routes/major';
import { seedUniversities } from './utils/seedUniversities';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());

// CORS configuration
const rawOrigins =
  process.env.ALLOWED_ORIGINS || process.env.allowed_origins || '';
const customOrigins = rawOrigins
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];
const allowedOrigins =
  customOrigins.length > 0 ? customOrigins : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isLocalhost =
        normalizedOrigin.startsWith('http://localhost') ||
        normalizedOrigin.startsWith('http://127.0.0.1');

      if (
        allowedOrigins.some((o) => o === normalizedOrigin) ||
        (isDevelopment && isLocalhost)
      ) {
        return callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  }),
);

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.set('trust proxy', 1);

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5000, // limit each IP to 5000 requests per windowMs
  message: 'Too many requests from this IP, please try again after a moment',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

app.use(express.json({ limit: '10mb' })); // Reduced limit for better security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cached MongoDB Connection for Serverless
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/tracer-study',
    );
    isConnected = db.connections[0].readyState === 1;
    console.log('New database connection successful');
    
    // Seed universities if collection is empty (run in background)
    seedUniversities();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/majors', majorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message;

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// For Local Development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

export default app;









