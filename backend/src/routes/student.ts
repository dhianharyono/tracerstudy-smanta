import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import News from '../models/News';
import Feedback from '../models/Feedback';
import NewsRead from '../models/NewsRead';

import Badge from '../models/Badge';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

// Get all badges for filter
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find().sort({ name: 1 });
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/alumni-map', async (req: Request, res: Response) => {
  try {
    const universities = await User.aggregate([
      {
        $match: {
          role: 'alumni',
          'university.name': { $exists: true, $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$university.name',
          count: { $sum: 1 },
          type: { $first: '$university.type' },
          alumni: {
            $push: {
              id: '$_id',
              name: '$profile.fullName',
              major: '$university.major',
              graduationYear: '$profile.graduationYear',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const mapData = universities.map((u) => ({
      university: u._id,
      count: u.count,
      type: u.type,
      alumni: u.alumni,
    }));

    res.json(mapData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [
      totalAlumni,
      completedQuestionnaire,
      workingAlumni,
      studyingAlumni,
      activeMentors,
      negeriCount,
      swastaCount,
      kedinasanCount,
      majorStats,
      yearStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'alumni', questionnaireCompleted: true }),
      User.countDocuments({ role: 'alumni', 'profile.isWorking': true }),
      User.countDocuments({ role: 'alumni', 'profile.isStudying': true }),
      User.countDocuments({ role: 'alumni', isMentor: true }),
      User.countDocuments({ role: 'alumni', 'university.type': 'negeri' }),
      User.countDocuments({ role: 'alumni', 'university.type': 'swasta' }),
      User.countDocuments({ role: 'alumni', 'university.type': 'kedinasan' }),
      User.aggregate([
        {
          $match: {
            role: 'alumni',
            'university.major': { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$university.major',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        {
          $match: {
            role: 'alumni',
            'profile.graduationYear': { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$profile.graduationYear',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
    ]);

    res.json({
      totalAlumni,
      completedQuestionnaire,
      workingAlumni,
      studyingAlumni,
      activeMentors,
      universityTypes: {
        negeri: negeriCount,
        swasta: swastaCount,
        kedinasan: kedinasanCount,
      },
      majorStats,
      yearStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/universities', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;

    const matchQuery: any = {
      role: 'alumni',
      'university.name': { $exists: true, $ne: null },
    };

    if (type && ['negeri', 'swasta', 'kedinasan'].includes(type)) {
      matchQuery['university.type'] = type;
    }

    const universities = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            name: '$university.name',
            type: '$university.type',
          },
          count: { $sum: 1 },
          alumni: {
            $push: {
              id: '$_id',
              name: '$profile.fullName',
              graduationYear: '$profile.graduationYear',
              major: '$university.major',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(universities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/majors', async (req: Request, res: Response) => {
  try {
    const majors = await User.aggregate([
      {
        $match: {
          role: 'alumni',
          'university.major': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$university.major',
          count: { $sum: 1 },
          alumni: {
            $push: {
              id: '$_id',
              name: '$profile.fullName',
              university: '$university.name',
              graduationYear: '$profile.graduationYear',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(majors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/alumni', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const university = req.query.university as string;
    const graduationYear = req.query.graduationYear as string;
    const major = req.query.major as string;
    const name = req.query.name as string;
    const badgeId = req.query.badgeId as string;


    const filter: any = {
      role: 'alumni',
      'profile.fullName': { $exists: true, $nin: [null, ''] },
      'university.name': { $exists: true, $nin: [null, ''] },
    };

    if (university) {
      filter['university.name'] = university;
    }

    if (graduationYear) {
      filter['profile.graduationYear'] = parseInt(graduationYear);
    }

    if (major) {
      filter['university.major'] = major;
    }

    if (name) {
      filter['profile.fullName'] = { $regex: name, $options: 'i' };
    }

    if (badgeId) {
      filter['badges'] = { $in: [badgeId] };
    }

    if (req.query.isMentor === 'true') {
      filter['isMentor'] = true;
    }


    const alumni = await User.find(filter)
      .select('-password')
      .select(
        'profile.fullName profile.graduationYear university.name university.major job.position job.institution socialMedia.instagram badges isMentor'
      )
      .populate('badges')
      .skip(skip)
      .limit(limit)
      .sort({ 'profile.graduationYear': -1, createdAt: -1 });

    const total = await User.countDocuments(filter);

    const universitiesQuery = User.distinct('university.name', {
      role: 'alumni',
      'university.name': { $exists: true, $nin: [null, ''] },
    });

    const graduationYearsQuery = User.distinct('profile.graduationYear', {
      role: 'alumni',
      'profile.graduationYear': { $exists: true, $ne: null },
    }).sort();

    const majorsQuery = User.distinct('university.major', {
      role: 'alumni',
      'university.major': { $exists: true, $nin: [null, ''] },
    });

    const [universities, graduationYearsData, majors] = await Promise.all([
      universitiesQuery,
      graduationYearsQuery,
      majorsQuery,
    ]);

    const graduationYears = graduationYearsData.reverse();

    res.json({
      alumni,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        universities,
        graduationYears,
        majors,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/news', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const news = await News.find({
      isPublished: true,
      $or: [{ type: 'student' }, { type: 'all' }],
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    // Get read news IDs for this user
    const readNews = await NewsRead.find({ user: req.user!._id }).select(
      'news'
    );
    const readNewsIds = readNews.map((nr) => nr.news.toString());

    // Add isRead flag to each news
    const newsWithReadStatus = news.map((n) => ({
      ...n.toObject(),
      isRead: readNewsIds.includes(n._id.toString()),
    }));

    res.json(newsWithReadStatus);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single news detail
router.get('/news/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const news = await News.findOne({
      _id: req.params.id,
      isPublished: true,
      $or: [{ type: 'student' }, { type: 'all' }],
    }).populate('author', 'username');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark news as read
router.post(
  '/news/:id/read',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const news = await News.findOne({
        _id: req.params.id,
        isPublished: true,
      });

      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }

      // Check if already read
      const existingRead = await NewsRead.findOne({
        user: req.user!._id,
        news: req.params.id,
      });

      if (!existingRead) {
        const newsRead = new NewsRead({
          user: req.user!._id,
          news: req.params.id,
        });
        await newsRead.save();
      }

      res.json({ message: 'News marked as read' });
    } catch (error: any) {
      if (error.code === 11000) {
        // Already read
        res.json({ message: 'News already marked as read' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
);

// Removed news unread-count route

// Feedback routes
// Check if user has submitted feedback
router.get(
  '/feedback/check',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const feedback = await Feedback.findOne({ user: req.user!._id });
      if (feedback) {
        res.json({ exists: true, feedback });
      } else {
        res.json({ exists: false });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Submit or update feedback
router.post(
  '/feedback',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { rating, kritik, saran } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating harus antara 1-5' });
      }

      if (!kritik && !saran) {
        return res
          .status(400)
          .json({ message: 'Kritik atau saran harus diisi' });
      }

      const existingFeedback = await Feedback.findOne({ user: req.user!._id });

      if (existingFeedback) {
        existingFeedback.rating = rating;
        existingFeedback.kritik = kritik || '';
        existingFeedback.saran = saran || '';
        await existingFeedback.save();
        res.json({
          message: 'Feedback berhasil diperbarui',
          feedback: existingFeedback,
        });
      } else {
        const feedback = new Feedback({
          user: req.user!._id,
          role: 'student',
          rating,
          kritik: kritik || '',
          saran: saran || '',
        });
        await feedback.save();
        res.json({ message: 'Feedback berhasil dikirim', feedback });
      }
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'Anda sudah mengirim feedback' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
);

// Update feedback
router.put(
  '/feedback',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { rating, kritik, saran } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating harus antara 1-5' });
      }

      const feedback = await Feedback.findOne({ user: req.user!._id });

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback tidak ditemukan' });
      }

      feedback.rating = rating;
      feedback.kritik = kritik || '';
      feedback.saran = saran || '';
      await feedback.save();

      res.json({ message: 'Feedback berhasil diperbarui', feedback });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
