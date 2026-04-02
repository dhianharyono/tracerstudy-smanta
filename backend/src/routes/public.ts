import express, { Request, Response } from 'express';
import User from '../models/User';
import News from '../models/News';
import Feedback from '../models/Feedback';

const router = express.Router();

// Get public statistics for landing page
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const workingAlumni = await User.countDocuments({ role: 'alumni', 'profile.isWorking': true });
        const studyingAlumni = await User.countDocuments({ role: 'alumni', 'profile.isStudying': true });

        const universityStats = await User.aggregate([
            {
                $match: {
                    role: 'alumni',
                    'university.name': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$university.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const majorStats = await User.aggregate([
            {
                $match: {
                    role: 'alumni',
                    'university.major': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$university.major',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalAlumni,
            totalStudents,
            workingAlumni,
            studyingAlumni,
            topUniversities: universityStats,
            topMajors: majorStats
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get latest public news
router.get('/news', async (req: Request, res: Response) => {
    try {
        const news = await News.find({ isPublished: true, type: 'all' })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .limit(3);
        res.json(news);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get testimonials (feedback with high rating)
router.get('/testimonials', async (req: Request, res: Response) => {
    try {
        const testimonials = await Feedback.find({ rating: { $gte: 4 } })
            .populate('user', 'profile.fullName role')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(testimonials);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
