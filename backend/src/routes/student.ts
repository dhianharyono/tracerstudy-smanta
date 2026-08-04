import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import News from '../models/News';
import Feedback from '../models/Feedback';
import NewsRead from '../models/NewsRead';
import CollegePlan from '../models/CollegePlan';

import Badge from '../models/Badge';
import { ensureUniversityExists } from '../utils/universityHelper';
import { ensureMajorExists } from '../utils/majorHelper';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

router.use(authenticate);

// Public / Shared routes for student and alumni
router.get(
  '/universities',
  authorize('student', 'alumni', 'school', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string;
      const graduationYear = (req.query.graduationYear || req.query.year) as string;

      const matchQuery: any = {
        role: 'alumni',
        'university.name': { $exists: true, $ne: null },
        isHidden: { $ne: true },
      };

      if (type && ['negeri', 'swasta', 'kedinasan'].includes(type)) {
        matchQuery['university.type'] = type;
      }

      if (graduationYear) {
        const parsedYear = parseInt(graduationYear, 10);
        if (!isNaN(parsedYear)) {
          matchQuery['profile.graduationYear'] = parsedYear;
        }
      }

      const universities = await User.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$university.name',
            types: { $addToSet: '$university.type' },
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
        {
          $addFields: {
            // Find the first valid type (non-null, non-empty)
            validType: {
              $first: {
                $filter: {
                  input: '$types',
                  as: 't',
                  cond: { $and: [{ $ne: ['$$t', null] }, { $ne: ['$$t', ''] }] },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: {
              name: '$_id',
              type: { $ifNull: ['$validType', 'Umum'] },
            },
            count: 1,
            alumni: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      res.json(universities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  '/majors',
  authorize('student', 'alumni', 'school', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const graduationYear = (req.query.graduationYear || req.query.year) as string;

      const matchQuery: any = {
        role: 'alumni',
        'university.major': { $exists: true, $ne: null },
        isHidden: { $ne: true },
      };

      if (graduationYear) {
        const parsedYear = parseInt(graduationYear, 10);
        if (!isNaN(parsedYear)) {
          matchQuery['profile.graduationYear'] = parsedYear;
        }
      }

      const majors = await User.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$university.major',
            count: { $sum: 1 },
            alumni: {
              $push: {
                id: '$_id',
                name: '$profile.fullName',
                university: '$university.name',
                universityType: '$university.type',
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
  }
);

router.get(
  '/alumni',
  authorize('student', 'alumni', 'school', 'admin'),
  async (req: Request, res: Response) => {
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
        'profile.fullName': { $exists: true, $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] },
        'university.name': { $exists: true, $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] },
        isHidden: { $ne: true },
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
          'profile.fullName profile.graduationYear university.name university.major job.position job.institution socialMedia.instagram socialMedia.linkedin badges isMentor',
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
  }
);

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
    const [stats] = await User.aggregate([
      {
        $facet: {
          totalAlumni: [
            {
              $match: {
                role: 'alumni',
                'profile.fullName': { $exists: true, $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] },
                'university.name': { $exists: true, $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] },
                isHidden: { $ne: true },
              },
            },
            { $count: 'count' },
          ],
          totalStudents: [{ $match: { role: 'student' } }, { $count: 'count' }],
          completedStudents: [
            {
              $match: {
                role: 'student',
                'profile.fullName': { $exists: true, $nin: [null, ''] },
                'profile.entryYear': { $exists: true, $ne: null },
                'profile.graduationYear': { $exists: true, $ne: null }
              }
            },
            { $count: 'count' },
          ],
          incompleteStudents: [
            {
              $match: {
                role: 'student',
                $or: [
                  { 'profile': { $exists: false } },
                  { 'profile.fullName': { $exists: false } },
                  { 'profile.fullName': { $in: [null, ''] } },
                  { 'profile.entryYear': { $exists: false } },
                  { 'profile.entryYear': null },
                  { 'profile.graduationYear': { $exists: false } },
                  { 'profile.graduationYear': null }
                ]
              }
            },
            { $count: 'count' },
          ],
          studentYearStats: [
            {
              $match: {
                role: 'student',
                'profile.graduationYear': { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: '$profile.graduationYear',
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
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
          universityStats: [
            {
              $match: {
                role: 'alumni',
                'university.name': { $exists: true, $ne: null, $nin: ['', 'null'] },
              },
            },
            {
              $group: {
                _id: '$university.name',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
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
          statusStats: [
            {
              $match: {
                role: 'alumni',
                questionnaireCompleted: true,
              },
            },
            {
              $group: {
                _id: {
                  isWorking: '$profile.isWorking',
                  isStudying: '$profile.isStudying',
                },
                count: { $sum: 1 },
              },
            },
          ],
          completedData: [
            { $match: { role: 'alumni', questionnaireCompleted: true } },
            { $count: 'count' },
          ],
          incompleteData: [
            { $match: { role: 'alumni', questionnaireCompleted: false } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const getCount = (arr: any[]) => (arr && arr.length > 0 ? arr[0].count : 0);
    const getMap = (arr: any[]) =>
      arr.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {
        negeri: 0,
        swasta: 0,
        kedinasan: 0,
      });

    const statusStats = stats.statusStats.map((s: any) => {
      let label = 'Mencari Kerja';
      if (s._id.isWorking && s._id.isStudying) label = 'Kerja & Kuliah';
      else if (s._id.isWorking) label = 'Bekerja';
      else if (s._id.isStudying) label = 'Kuliah';
      return { name: label, count: s.count };
    });

    res.status(200).json({
      totalAlumni: getCount(stats.totalAlumni),
      totalStudents: getCount(stats.totalStudents),
      completedStudentsCount: getCount(stats.completedStudents),
      incompleteStudentsCount: getCount(stats.incompleteStudents),
      workingAlumni: getCount(stats.workingAlumni),
      studyingAlumni: getCount(stats.studyingAlumni),
      activeMentors: getCount(stats.activeMentors),
      completedCount: getCount(stats.completedData),
      incompleteCount: getCount(stats.incompleteData),
      studentYearStats: stats.studentYearStats || [],
      universityTypes: getMap(stats.universityTypes),
      universityStats: stats.universityStats,
      majorStats: stats.majorStats,
      statusStats,
      yearStats: stats.yearStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
// Get all news
router.get('/news', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = News.find({
      isPublished: true,
      $or: [{ type: 'student' }, { type: 'all' }],
    });

    if (req.query.limit) {
      query.limit(parseInt(req.query.limit as string));
    }

    const news = await query
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    // Get read news IDs for this user
    const readNews = await NewsRead.find({ user: req.user!._id }).select(
      'news',
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
  },
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
  },
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
  },
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
  },
);


// Get public feedback list (Anonymous)
router.get('/feedback/list', authenticate, authorize('student'), async (req: Request, res: Response) => {
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
router.get('/feedback/stats', authenticate, authorize('student'), async (req: Request, res: Response) => {
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

// --- College Plan Routes ---

// Get current user's college plan
router.get(
  '/college-plan',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plan = await CollegePlan.findOne({ user: req.user!._id });
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Create or Update college plan
router.post(
  '/college-plan',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        targetUniversity,
        targetMajor,
        rumpun,
        entryPath,
        readinessStatus,
        isAnonymous,
      } = req.body;

      // Ensure university exists in master list
      if (targetUniversity) {
        await ensureUniversityExists(targetUniversity, req.user!._id);
      }
      
      // Ensure major exists in master list
      if (targetMajor) {
        await ensureMajorExists(targetMajor, req.user!._id);
      }

      let plan = await CollegePlan.findOne({ user: req.user!._id });

      if (plan) {
        plan.targetUniversity = targetUniversity;
        plan.targetMajor = targetMajor;
        plan.rumpun = rumpun || 'Saintek';
        plan.entryPath = entryPath || 'SNBP';
        plan.readinessStatus = readinessStatus || 'Yakin';
        plan.isAnonymous = typeof isAnonymous === 'boolean' ? isAnonymous : false;
        plan.lockCount += 1;
        await plan.save();
      } else {
        plan = new CollegePlan({
          user: req.user!._id,
          targetUniversity,
          targetMajor,
          rumpun: rumpun || 'Saintek',
          entryPath: entryPath || 'SNBP',
          readinessStatus: readinessStatus || 'Yakin',
          isAnonymous: typeof isAnonymous === 'boolean' ? isAnonymous : false,
          lockCount: 0,
        });
        await plan.save();
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Get aggregated stats for college plans
router.get(
  '/college-plans/stats',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUser = await User.findById(req.user!._id);
      const gradYear = currentUser?.profile?.graduationYear;

      // Pipeline stage to filter by same graduation year
      const filterPipeline: any[] = gradYear
        ? [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          { $unwind: '$userDetails' },
          {
            $match: {
              'userDetails.profile.graduationYear': gradYear,
            },
          },
        ]
        : [];

      const [
        topUniversitiesRaw,
        majorDistribution,
        entryPathStats,
        rumpunStats,
      ] = await Promise.all([
        CollegePlan.aggregate([
          ...filterPipeline,
          { $group: { _id: '$targetUniversity', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        CollegePlan.aggregate([
          ...filterPipeline,
          { $group: { _id: '$targetMajor', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        CollegePlan.aggregate([
          ...filterPipeline,
          { $group: { _id: '$entryPath', count: { $sum: 1 } } },
        ]),
        CollegePlan.aggregate([
          ...filterPipeline,
          { $group: { _id: '$rumpun', count: { $sum: 1 } } },
        ]),
      ]);

      const topUniversities = await Promise.all(
        topUniversitiesRaw.map(async (item) => {
          const alumniCount = await User.countDocuments({
            role: 'alumni',
            'university.name': { $regex: new RegExp(item._id, 'i') },
          });
          return {
            name: item._id,
            studentCount: item.count,
            alumniCount,
          };
        }),
      );

      res.json({
        topUniversities,
        majorDistribution,
        entryPathStats,
        rumpunStats,
        userGradYear: gradYear,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Explore Friends (List)
router.get(
  '/college-plans/list',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { university, major } = req.query;
      const currentUser = await User.findById(req.user!._id);
      const gradYear = currentUser?.profile?.graduationYear;

      const filter: any = {};
      if (university) filter.targetUniversity = university;
      if (major) filter.targetMajor = major;

      const plansQuery = CollegePlan.find(filter)
        .populate('user', 'username profile.fullName profile.graduationYear')
        .sort({ createdAt: -1 });

      const plans = await plansQuery;

      // Filter in memory for graduation year (simpler than complex aggregation for list with populate)
      // or we could find user IDs first.
      // Doing in-memory filtering for now as dataset per year isn't huge yet.
      const filteredPlans = gradYear
        ? plans.filter((p: any) => p.user?.profile?.graduationYear === gradYear)
        : plans;

      const result = filteredPlans.map((p: any) => {
        const pObj = p.toObject() as any;
        if (p.isAnonymous) {
          return {
            ...pObj,
            user: { username: 'Anonymous', profile: { fullName: 'Anonymous' } },
          };
        }
        return pObj;
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Confirm graduation (student -> alumni)
router.post(
  '/confirm-graduation',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!._id);
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      user.role = 'alumni';
      user.questionnaireCompleted = false;
      await user.save();

      // Delete college plan if exists (since they have graduated)
      await CollegePlan.findOneAndDelete({ user: req.user!._id });

      res.json({ 
        message: 'Selamat! Role Anda telah dikonversi menjadi Alumni.',
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
          questionnaireCompleted: user.questionnaireCompleted
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get Smart College Match & Analytics
router.get(
  '/college-plan/match',
  authenticate,
  authorize('student'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Menerima override via query atau ambil dari plan user
      let targetUniv = (req.query.targetUniversity as string) || '';
      let targetMaj = (req.query.targetMajor as string) || '';

      const userPlan = await CollegePlan.findOne({ user: req.user!._id });

      if (!targetUniv && userPlan?.targetUniversity) {
        targetUniv = userPlan.targetUniversity;
      }
      if (!targetMaj && userPlan?.targetMajor) {
        targetMaj = userPlan.targetMajor;
      }

      if (!targetUniv && !targetMaj) {
        return res.json({
          hasPlan: false,
          message: 'Belum ada rencana studi. Silakan atur target perguruan tinggi dan jurusan Anda.',
        });
      }

      const univRegex = targetUniv ? new RegExp(targetUniv, 'i') : null;
      const majRegex = targetMaj ? new RegExp(targetMaj, 'i') : null;

      // 1. Filter alumni berdasarkan target kampus & jurusan
      const alumniFilter: any = { role: 'alumni' };
      if (univRegex && majRegex) {
        alumniFilter.$or = [
          { 'university.name': univRegex },
          { 'university.major': majRegex },
        ];
      } else if (univRegex) {
        alumniFilter['university.name'] = univRegex;
      } else if (majRegex) {
        alumniFilter['university.major'] = majRegex;
      }

      const alumniList = await User.find(alumniFilter).select(
        'username profile.fullName profile.graduationYear university job socialMedia email isMentor'
      );

      // Hitung exact match (kampus & jurusan sama)
      const exactMatchAlumni = alumniList.filter((a) => {
        const uMatch = univRegex ? univRegex.test(a.university?.name || '') : true;
        const mMatch = majRegex ? majRegex.test(a.university?.major || '') : true;
        return uMatch && mMatch;
      });

      // Filter mentor & alumni network
      const mentors = alumniList
        .filter((a) => a.isMentor)
        .map((a) => ({
          _id: a._id,
          fullName: a.profile?.fullName || a.username,
          graduationYear: a.profile?.graduationYear,
          universityName: a.university?.name || '-',
          major: a.university?.major || '-',
          position: a.job?.position || a.job?.jobTitle || 'Mahasiswa / Lulusan',
          institution: a.job?.institution || '-',
          isMentor: true,
          socialMedia: a.socialMedia || {},
          email: a.email,
        }));

      // Map daftar seluruh alumni (dengan urutan Mentor terlebih dahulu)
      const targetAlumniSet = exactMatchAlumni.length > 0 ? exactMatchAlumni : alumniList;
      const alumniNetwork = targetAlumniSet
        .map((a) => ({
          _id: a._id,
          fullName: a.profile?.fullName || a.username,
          graduationYear: a.profile?.graduationYear,
          universityName: a.university?.name || '-',
          major: a.university?.major || '-',
          position: a.job?.position || a.job?.jobTitle || 'Mahasiswa / Lulusan',
          institution: a.job?.institution || '-',
          isMentor: !!a.isMentor,
          socialMedia: a.socialMedia || {},
          email: a.email,
        }))
        .sort((a, b) => (b.isMentor ? 1 : 0) - (a.isMentor ? 1 : 0));

      // 2. Realita Karir Alumni (Job Outcomes)
      const jobPositionsMap: { [key: string]: number } = {};
      const institutionsMap: { [key: string]: number } = {};

      exactMatchAlumni.forEach((a) => {
        if (a.job?.position || a.job?.jobTitle) {
          const pos = a.job.position || a.job.jobTitle || 'Lainnya';
          jobPositionsMap[pos] = (jobPositionsMap[pos] || 0) + 1;
        }
        if (a.job?.institution) {
          institutionsMap[a.job.institution] = (institutionsMap[a.job.institution] || 0) + 1;
        }
      });

      const totalJobs = Object.values(jobPositionsMap).reduce((acc, curr) => acc + curr, 0);
      const careerOutcomes = Object.entries(jobPositionsMap)
        .map(([title, count]) => ({
          title,
          count,
          percentage: totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topInstitutions = Object.entries(institutionsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([inst]) => inst);

      // 4. Rekomendasi Perguruan Tinggi Alternatif
      // Mencari perguruan tinggi lain yang memiliki alumni dari jurusan yang dicari (targetMaj)
      const altMatchFilter: any = {
        role: 'alumni',
        'university.name': { $exists: true, $ne: '' },
      };
      if (univRegex) {
        altMatchFilter['university.name'] = { $not: univRegex };
      }
      if (majRegex) {
        altMatchFilter['university.major'] = majRegex;
      }

      let isSameMajorFound = true;
      let topAlumniUnivs = await User.aggregate([
        { $match: altMatchFilter },
        {
          $group: {
            _id: '$university.name',
            total: { $sum: 1 },
            mentorCount: { $sum: { $cond: ['$isMentor', 1, 0] } },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 6 },
      ]);

      // Fallback jika belum ada kampus lain dengan jurusan yang persis sama
      if (topAlumniUnivs.length === 0) {
        isSameMajorFound = false;
        const fallbackFilter: any = {
          role: 'alumni',
          'university.name': { $exists: true, $ne: '' },
        };
        if (univRegex) {
          fallbackFilter['university.name'] = { $not: univRegex };
        }

        topAlumniUnivs = await User.aggregate([
          { $match: fallbackFilter },
          {
            $group: {
              _id: '$university.name',
              total: { $sum: 1 },
              mentorCount: { $sum: { $cond: ['$isMentor', 1, 0] } },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 4 },
        ]);
      }

      const alternativeUniversities = await Promise.all(
        topAlumniUnivs.slice(0, 4).map(async (u) => {
          const alumniQuery: any = {
            role: 'alumni',
            'university.name': new RegExp(`^${u._id}$`, 'i'),
          };

          if (isSameMajorFound && majRegex) {
            alumniQuery['university.major'] = majRegex;
          }

          const alumniInUniv = await User.find(alumniQuery)
            .select('username profile.fullName profile.graduationYear university job isMentor')
            .limit(5);

          const exactAlumniCount = await User.countDocuments(alumniQuery);
          const exactMentorCount = await User.countDocuments({
            ...alumniQuery,
            isMentor: true,
          });

          return {
            name: u._id,
            isSameMajor: isSameMajorFound,
            alumniCount: exactAlumniCount,
            mentorCount: exactMentorCount,
            alumniList: alumniInUniv.map((a) => ({
              _id: a._id,
              fullName: a.profile?.fullName || a.username,
              graduationYear: a.profile?.graduationYear,
              major: a.university?.major || targetMaj || '-',
              position: a.job?.position || a.job?.jobTitle || 'Mahasiswa / Lulusan',
              institution: a.job?.institution || '-',
              isMentor: !!a.isMentor,
            })),
          };
        })
      );

      // 5. Kalkulasi Smart Match Score (0 - 100)
      let score = 50; // Base score

      // Alumni support (Max 35 point)
      if (exactMatchAlumni.length >= 5) score += 35;
      else if (exactMatchAlumni.length >= 2) score += 25;
      else if (alumniList.length > 0) score += 15;

      // Mentor support (Max 15 point)
      if (mentors.length >= 3) score += 15;
      else if (mentors.length >= 1) score += 10;

      const matchScore = Math.min(100, Math.max(20, score));

      res.json({
        hasPlan: true,
        targetUniversity: targetUniv,
        targetMajor: targetMaj,
        matchScore,
        alumniCount: alumniList.length,
        exactMatchAlumniCount: exactMatchAlumni.length,
        mentorCount: mentors.length,
        alumniNetwork,
        mentors,
        careerOutcomes,
        topInstitutions,
        alternativeUniversities,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
