import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import News from '../models/News';
import Feedback from '../models/Feedback';
import NewsRead from '../models/NewsRead';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
    questionnaireCompleted: boolean;
  };
}

const router = express.Router();

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
        .sort({ 'profile.fullName': 1 });

      res.json(mutualAlumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  '/profile',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!._id).select('-password');
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  '/profile',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { profile, university, job, socialMedia, questionnaireCompleted } =
        req.body;

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
          },
        },
        { new: true, runValidators: true }
      ).select('-password');

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
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
        { new: true, runValidators: true }
      ).select('-password');

      res.json({ message: 'Questionnaire submitted successfully', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
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
        { new: true, runValidators: true }
      ).select('-password');

      res.json({ message: 'Questionnaire updated successfully', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  '/universities',
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
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
          },
        },
        { $sort: { name: 1 } },
      ]);

      res.json(universities.map((u: any) => u.name));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  '/majors',
  authenticate,
  authorize('alumni'),
  async (req: Request, res: Response) => {
    try {
      const majors = await User.aggregate([
        {
          $match: {
            role: 'alumni',
            'university.major': { $exists: true, $nin: [null, ''] },
          },
        },
        {
          $group: {
            _id: '$university.major',
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
          },
        },
        { $sort: { name: 1 } },
      ]);

      res.json(majors.map((m: any) => m.name));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
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
  }
);

router.get(
  '/dashboard',
  authenticate,
  authorize('alumni'),
  async (req: Request, res: Response) => {
    try {
      const totalAlumni = await User.countDocuments({ role: 'alumni' });
      const completedQuestionnaire = await User.countDocuments({
        role: 'alumni',
        questionnaireCompleted: true,
      });
      const workingAlumni = await User.countDocuments({
        role: 'alumni',
        'profile.isWorking': true,
      });
      const studyingAlumni = await User.countDocuments({
        role: 'alumni',
        'profile.isStudying': true,
      });

      const negeriCount = await User.countDocuments({
        role: 'alumni',
        'university.type': 'negeri',
      });
      const swastaCount = await User.countDocuments({
        role: 'alumni',
        'university.type': 'swasta',
      });
      const kedinasanCount = await User.countDocuments({
        role: 'alumni',
        'university.type': 'kedinasan',
      });

      const majorStats = await User.aggregate([
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
      ]);

      const yearStats = await User.aggregate([
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
      ]);

      res.json({
        totalAlumni,
        completedQuestionnaire,
        workingAlumni,
        studyingAlumni,
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
  }
);

router.get(
  '/news/unread-count',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const totalNews = await News.countDocuments({
        isPublished: true,
        $or: [{ type: 'alumni' }, { type: 'all' }],
      });
      const readCount = await NewsRead.countDocuments({ user: req.user!._id });
      res.json({ count: Math.max(0, totalNews - readCount) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  '/news',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const news = await News.find({
        isPublished: true,
        $or: [{ type: 'alumni' }, { type: 'all' }],
      })
        .populate('author', 'username')
        .sort({ createdAt: -1 });

      const readNews = await NewsRead.find({ user: req.user!._id }).select('news');
      const readNewsIds = readNews.map((nr) => nr.news.toString());

      const newsWithReadStatus = news.map((n) => ({
        ...n.toObject(),
        isRead: readNewsIds.includes(n._id.toString()),
      }));

      res.json(newsWithReadStatus);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
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
  }
);

router.post(
  '/news/:id/read',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const news = await News.findOne({ _id: req.params.id, isPublished: true });
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
  }
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
  }
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
        return res.status(400).json({ message: 'Kritik atau saran harus diisi' });
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
        { upsert: true, new: true }
      );

      res.json({ message: 'Feedback berhasil diproses', feedback });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
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
        { new: true }
      );

      if (!feedback) return res.status(404).json({ message: 'Feedback tidak ditemukan' });
      res.json({ message: 'Feedback berhasil diperbarui', feedback });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;