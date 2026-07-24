import express, { Request, Response } from 'express';
import User from '../models/User';
import News from '../models/News';
import Feedback from '../models/Feedback';
import PageVisit from '../models/PageVisit';

const router = express.Router();

// Get public statistics for landing page
router.get('/stats', async (req: Request, res: Response) => {
    try {
        console.log('Fetching public stats...');
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const workingAlumni = await User.countDocuments({ role: 'alumni', 'profile.isWorking': true });
        const studyingAlumni = await User.countDocuments({ role: 'alumni', 'profile.isStudying': true });
        
        // Detailed college types
        const ptnCount = await User.countDocuments({ role: 'alumni', 'university.type': 'negeri' });
        const ptsCount = await User.countDocuments({ role: 'alumni', 'university.type': 'swasta' });
        const kedinasanCount = await User.countDocuments({ role: 'alumni', 'university.type': 'kedinasan' });
        
        // Total landing page visitors
        const totalVisits = await PageVisit.countDocuments({ path: '/' });

        const allUniversities = await User.distinct('university.name', { 
            role: 'alumni', 
            'university.name': { $exists: true, $nin: [null, ''] } 
        }) || [];
        const totalConnectedUniversities = allUniversities.length;

        const allMajors = await User.distinct('university.major', {
            role: 'alumni',
            'university.major': { $exists: true, $nin: [null, ''] }
        }) || [];
        const totalMajors = allMajors.length;

        const universityStats = await User.aggregate([
            {
                $match: {
                    role: 'alumni',
                    'university.name': { $exists: true, $nin: [null, ''] }
                }
            },
            {
                $group: {
                    _id: '$university.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const majorStats = await User.aggregate([
            {
                $match: {
                    role: 'alumni',
                    'university.major': { $exists: true, $nin: [null, ''] },
                    'university.name': { $exists: true, $nin: [null, ''] }
                }
            },
            {
                $group: {
                    _id: '$university.major',
                    count: { $sum: 1 },
                    universities: { $addToSet: '$university.name' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 6 }
        ]);

        res.json({
            totalAlumni,
            totalStudents,
            workingAlumni,
            studyingAlumni,
            ptnCount,
            ptsCount,
            kedinasanCount,
            totalConnectedUniversities,
            totalMajors,
            totalVisits,
            topUniversities: universityStats,
            topMajors: majorStats
        });
    } catch (error: any) {
        console.error('Error in /api/public/stats:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Log public page visits
router.post('/log-visit', async (req: Request, res: Response) => {
    try {
        const { path, menuName } = req.body;
        
        const visit = new PageVisit({
            path: path || '/',
            menuName: menuName || 'Landing Page',
            role: 'public'
        });

        await visit.save();
        res.status(201).json({ success: true });
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
        console.error('Error in /api/public/news:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Get testimonials (feedback that is set to be shown on landing page by admin)
router.get('/testimonials', async (req: Request, res: Response) => {
    try {
        const testimonials = await Feedback.find({ showOnLandingPage: true })
            .populate('user', 'profile.fullName role')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(testimonials);
    } catch (error: any) {
        console.error('Error in /api/public/testimonials:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

export default router;
