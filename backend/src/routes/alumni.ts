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
    questionnaireCompleted: boolean;
  };
}

const router = express.Router();

// Get filtered alumni list
router.get(
  '/',
  authenticate,
  authorize('alumni', 'student', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { university, major, isMentor } = req.query;
      const query: any = { role: 'alumni' };

      if (university) {
        query['university.name'] = university;
      }
      if (major) {
        query['university.major'] = major;
      }
      if (isMentor === 'true') {
        query['isMentor'] = true;
      }

      const alumni = await User.find(query)
        .select('-password')
        .populate('badges')
        .sort({ 'profile.fullName': 1 });

      res.json(alumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get(
  '/profile',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!._id)
        .select('-password')
        .populate('badges');
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Get mutual alumni (same graduation year)
router.get(
  '/mutual-alumni',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!._id);
      if (!user || !user.profile?.graduationYear) {
        return res.json([]);
      }

      const mutualAlumni = await User.find({
        role: 'alumni',
        'profile.graduationYear': user.profile.graduationYear,
        _id: { $ne: user._id },
      })
        .select('-password -email -socialMedia.email')
        .populate('badges')
        .sort({ 'profile.fullName': 1 });

      res.json(mutualAlumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.put(
  '/profile',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        profile,
        university,
        job,
        socialMedia,
        questionnaireCompleted,
        isMentor,
      } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user!._id,
        {
          $set: {
            profile,
            university,
            job,
            socialMedia,
            questionnaireCompleted:
              questionnaireCompleted !== undefined
                ? questionnaireCompleted
                : req.user!.questionnaireCompleted,
            isMentor: isMentor !== undefined ? isMentor : false,
          },
        },
        { new: true, runValidators: true },
      ).select('-password');

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.post(
  '/questionnaire',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { profile, university, job, socialMedia } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user!._id,
        {
          $set: {
            profile,
            university,
            job,
            socialMedia,
            questionnaireCompleted: true,
          },
        },
        { new: true, runValidators: true },
      ).select('-password');

      res.json({ message: 'Questionnaire submitted successfully', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.put(
  '/questionnaire',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { profile, university, job, socialMedia } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user!._id,
        {
          $set: {
            profile,
            university,
            job,
            socialMedia,
            questionnaireCompleted: true,
          },
        },
        { new: true, runValidators: true },
      ).select('-password');

      res.json({ message: 'Questionnaire updated successfully', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get(
  '/universities',
  authenticate,
  authorize('alumni', 'student'),
  async (req: Request, res: Response) => {
    try {
      const { major } = req.query;
      const matchQuery: any = {
        role: 'alumni',
        'university.name': { $exists: true, $nin: [null, ''] },
      };

      if (major) {
        matchQuery['university.major'] = major;
      }

      const universities = await User.aggregate([
        {
          $match: matchQuery,
        },
        {
          $group: {
            _id: '$university.name',
            count: { $sum: 1 },
            type: { $first: '$university.type' },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            count: 1,
            type: 1,
          },
        },
        { $sort: { count: -1, name: 1 } },
      ]);

      res.json(universities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get(
  '/majors',
  authenticate,
  authorize('alumni', 'student'),
  async (req: Request, res: Response) => {
    try {
      const { university } = req.query;
      const matchQuery: any = {
        role: 'alumni',
        'university.major': { $exists: true, $nin: [null, ''] },
      };

      if (university) {
        matchQuery['university.name'] = university;
      }

      const majors = await User.aggregate([
        {
          $match: matchQuery,
        },
        {
          $group: {
            _id: '$university.major',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1, name: 1 } },
      ]);

      res.json(majors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get(
  '/alumni-map',
  authenticate,
  authorize('alumni'),
  async (req: Request, res: Response) => {
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
  },
);

router.get(
  '/dashboard',
  authenticate,
  authorize('alumni'),
  async (req: Request, res: Response) => {
    try {
      const [stats] = await User.aggregate([
        {
          $facet: {
            totalAlumni: [{ $match: { role: 'alumni' } }, { $count: 'count' }],
            completedQuestionnaire: [
              { $match: { role: 'alumni', questionnaireCompleted: true } },
              { $count: 'count' },
            ],
            workingAlumni: [
              { $match: { role: 'alumni', 'profile.isWorking': true } },
              { $count: 'count' },
            ],
            studyingAlumni: [
              { $match: { role: 'alumni', 'profile.isStudying': true } },
              { $count: 'count' },
            ],
            activeMentors: [
              { $match: { role: 'alumni', isMentor: true } },
              { $count: 'count' },
            ],
            universityTypes: [
              {
                $match: {
                  role: 'alumni',
                  'university.type': { $in: ['negeri', 'swasta', 'kedinasan'] },
                },
              },
              {
                $group: {
                  _id: '$university.type',
                  count: { $sum: 1 },
                },
              },
            ],
            totalStudents: [
              { $match: { role: 'student' } },
              { $count: 'count' }
            ],
            majorStats: [
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
            ],
            yearStats: [
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
            ],
          },
        },
      ]);

      const getCount = (arr: any[]) => (arr && arr.length > 0 ? arr[0].count : 0);
      const getMap = (arr: any[]) =>
        arr.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {
          negeri: 0,
          swasta: 0,
          kedinasan: 0,
        });

      res.json({
        totalAlumni: getCount(stats.totalAlumni),
        completedQuestionnaire: getCount(stats.completedQuestionnaire),
        workingAlumni: getCount(stats.workingAlumni),
        studyingAlumni: getCount(stats.studyingAlumni),
        activeMentors: getCount(stats.activeMentors),
        universityTypes: getMap(stats.universityTypes),
        totalStudents: getCount(stats.totalStudents),
        majorStats: stats.majorStats,
        yearStats: stats.yearStats,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get(
  '/news',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = News.find({
        isPublished: true,
        $or: [{ type: 'alumni' }, { type: 'all' }],
      });

      if (req.query.limit) {
        query.limit(parseInt(req.query.limit as string));
      }

      const news = await query
        .populate('author', 'username')
        .sort({ createdAt: -1 });

      const readNews = await NewsRead.find({ user: req.user!._id }).select(
        'news',
      );
      const readNewsIds = readNews.map((nr) => nr.news.toString());

      const newsWithReadStatus = news.map((n) => ({
        ...n.toObject(),
        isRead: readNewsIds.includes(n._id.toString()),
      }));

      res.json(newsWithReadStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get(
  '/news/:id',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const news = await News.findOne({
        _id: req.params.id,
        isPublished: true,
        $or: [{ type: 'alumni' }, { type: 'all' }],
      }).populate('author', 'username');

      if (!news) return res.status(404).json({ message: 'News not found' });
      res.json(news);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.post(
  '/news/:id/read',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const news = await News.findOne({
        _id: req.params.id,
        isPublished: true,
      });
      if (!news) return res.status(404).json({ message: 'News not found' });

      const existingRead = await NewsRead.findOne({
        user: req.user!._id,
        news: req.params.id,
      });

      if (!existingRead) {
        await new NewsRead({ user: req.user!._id, news: req.params.id }).save();
      }

      res.json({ message: 'News marked as read' });
    } catch (error: any) {
      if (error.code === 11000) {
        res.json({ message: 'News already marked as read' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  },
);

router.get(
  '/feedback/check',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const feedback = await Feedback.findOne({ user: req.user!._id });
      res.json(feedback ? { exists: true, feedback } : { exists: false });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.post(
  '/feedback',
  authenticate,
  authorize('alumni'),
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

      const feedback = await Feedback.findOneAndUpdate(
        { user: req.user!._id },
        {
          $set: {
            rating,
            kritik: kritik || '',
            saran: saran || '',
            role: 'alumni',
          },
        },
        { upsert: true, new: true },
      );

      res.json({ message: 'Feedback berhasil diproses', feedback });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.put(
  '/feedback',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { rating, kritik, saran } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating harus antara 1-5' });
      }

      const feedback = await Feedback.findOneAndUpdate(
        { user: req.user!._id },
        { $set: { rating, kritik: kritik || '', saran: saran || '' } },
        { new: true },
      );

      if (!feedback)
        return res.status(404).json({ message: 'Feedback tidak ditemukan' });
      res.json({ message: 'Feedback berhasil diperbarui', feedback });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);


// Get public feedback list (Anonymous)
router.get('/feedback/list', authenticate, authorize('alumni'), async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find()
      .select('rating kritik saran reply createdAt role')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get feedback stats
router.get('/feedback/stats', authenticate, authorize('alumni'), async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find();
    const total = feedbacks.length;
    const ratings: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    feedbacks.forEach((feedback) => {
      ratings[feedback.rating as keyof typeof ratings]++;
      sum += feedback.rating;
    });

    const average = total > 0 ? sum / total : 0;

    res.json({
      total,
      average,
      ratings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  '/badges/claim',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ message: 'Code is required' });

      const badge = await Badge.findOne({ code });
      if (!badge)
        return res
          .status(404)
          .json({ message: 'Invalid or expired badge code' });

      if (new Date() > badge.expiredDate) {
        return res.status(400).json({ message: 'Badge code has expired' });
      }

      const user = await User.findById(req.user!._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Check if user already has badge
      // Note: badges is array of ObjectId, need to check string equality or use mongoose methods
      const alreadyClaimed = user.badges.some(
        (b: any) => b.toString() === badge._id.toString(),
      );

      if (alreadyClaimed) {
        return res.status(400).json({ message: 'Badge already claimed' });
      }

      user.badges.push(badge._id as any);
      await user.save();

      res.json({ message: 'Badge claimed successfully', badge });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
