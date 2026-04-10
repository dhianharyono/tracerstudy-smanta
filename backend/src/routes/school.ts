import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import Feedback from '../models/Feedback';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

router.use(authenticate);
router.use(authorize('school'));

// Get school dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        // Profiles completion
        const completedAlumni = await User.countDocuments({ 
            role: 'alumni', 
            questionnaireCompleted: true 
        });

        // Employment stats
        const workingAlumni = await User.countDocuments({ role: 'alumni', 'profile.isWorking': true });
        const studyingAlumni = await User.countDocuments({ role: 'alumni', 'profile.isStudying': true });
        const bothAlumni = await User.countDocuments({ 
            role: 'alumni', 
            'profile.isWorking': true, 
            'profile.isStudying': true 
        });

        // Top Majors
        const topMajors = await User.aggregate([
            { $match: { role: 'alumni', 'university.major': { $exists: true, $ne: '' } } },
            { $group: { _id: '$university.major', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Alumni by Graduation Year
        const alumniByYear = await User.aggregate([
            { $match: { role: 'alumni', 'profile.graduationYear': { $exists: true, $ne: null } } },
            { $group: { _id: '$profile.graduationYear', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Students by Expected Graduation Year
        const studentsByYear = await User.aggregate([
            { $match: { role: 'student', 'profile.graduationYear': { $exists: true, $ne: null } } },
            { $group: { _id: '$profile.graduationYear', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalAlumni,
            totalStudents,
            completedAlumni,
            workingAlumni,
            studyingAlumni,
            bothAlumni,
            topMajors,
            alumniByYear,
            studentsByYear,
            employmentChart: [
                { name: 'Bekerja', value: workingAlumni - bothAlumni },
                { name: 'Kuliah', value: studyingAlumni - bothAlumni },
                { name: 'Kerja & Kuliah', value: bothAlumni },
                { name: 'Belum Terdata/Lainnya', value: totalAlumni - (workingAlumni + studyingAlumni - bothAlumni) }
            ]
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get alumni list for school monitoring
router.get('/alumni', async (req: Request, res: Response) => {
    try {
        const { search, graduationYear, status, surveyStatus, limit = 50, page = 1 } = req.query;
        
        const query: any = { role: 'alumni' };
        const andConditions: any[] = [];
        
        if (search) {
            andConditions.push({
                $or: [
                    { 'profile.fullName': { $regex: search, $options: 'i' } },
                    { 'university.name': { $regex: search, $options: 'i' } },
                    { 'university.major': { $regex: search, $options: 'i' } },
                    { 'job.institution': { $regex: search, $options: 'i' } }
                ]
            });
        }
        
        if (graduationYear) {
            query['profile.graduationYear'] = parseInt(graduationYear as string);
        }

        const jobExistsQuery = {
            $or: [
                { 'job.institution': { $exists: true, $ne: '' } },
                { 'job.position': { $exists: true, $ne: '' } },
                { 'job.jobTitle': { $exists: true, $ne: '' } }
            ]
        };

        if (status === 'working') {
            query['profile.isWorking'] = true;
            andConditions.push(jobExistsQuery);
        } else if (status === 'studying') {
            query['profile.isStudying'] = true;
        } else if (status === 'both') {
            query['profile.isWorking'] = true;
            query['profile.isStudying'] = true;
            andConditions.push(jobExistsQuery);
        } else if (status === 'none') {
            query['profile.isWorking'] = { $ne: true };
            query['profile.isStudying'] = { $ne: true };
        }

        if (surveyStatus === 'completed') {
            andConditions.push({
                'profile.fullName': { $exists: true, $ne: '' },
                'email': { $exists: true, $ne: '' },
                'profile.graduationYear': { $exists: true, $ne: null },
                'university.name': { $exists: true, $ne: '' }
            });
        } else if (surveyStatus === 'not_completed') {
            andConditions.push({
                $or: [
                    { 'profile.fullName': { $exists: false } },
                    { 'profile.fullName': '' },
                    { 'email': { $exists: false } },
                    { 'email': '' },
                    { 'profile.graduationYear': { $exists: false } },
                    { 'profile.graduationYear': null },
                    { 'university.name': { $exists: false } },
                    { 'university.name': '' }
                ]
            });
        }

        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const alumni = await User.find(query)
            .select('profile university job questionnaireCompleted email')
            .sort({ 'profile.graduationYear': -1, 'profile.fullName': 1 })
            .limit(parseInt(limit as string))
            .skip(skip);

        const total = await User.countDocuments(query);

        res.json({
            alumni,
            total,
            pages: Math.ceil(total / parseInt(limit as string))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get university distribution analytics
router.get('/analytics/universities', async (req: Request, res: Response) => {
    try {
        const stats = await User.aggregate([
            { $match: { role: 'alumni', 'university.name': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$university.name',
                    count: { $sum: 1 },
                    type: { $first: '$university.type' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});



// Feedback routes
router.get('/feedback/check', async (req: Request, res: Response) => {
    try {
        const feedback = await Feedback.findOne({ user: (req as any).user._id });
        if (feedback) {
            res.json({ exists: true, feedback });
        } else {
            res.json({ exists: false });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/feedback', async (req: Request, res: Response) => {
    try {
        const { rating, kritik, saran } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating harus antara 1-5' });
        }
        if (!kritik && !saran) {
            return res.status(400).json({ message: 'Kritik atau saran harus diisi' });
        }

        const existingFeedback = await Feedback.findOne({ user: (req as any).user._id });

        if (existingFeedback) {
            existingFeedback.rating = rating;
            existingFeedback.kritik = kritik || '';
            existingFeedback.saran = saran || '';
            await existingFeedback.save();
            res.json({ message: 'Feedback berhasil diperbarui', feedback: existingFeedback });
        } else {
            const feedback = new Feedback({
                user: (req as any).user._id,
                role: 'school',
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
});

router.put('/feedback', async (req: Request, res: Response) => {
    try {
        const { rating, kritik, saran } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating harus antara 1-5' });
        }

        const feedback = await Feedback.findOne({ user: (req as any).user._id });
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
});

router.get('/feedback/list', async (req: Request, res: Response) => {
    try {
        const feedbacks = await Feedback.find()
            .select('rating kritik saran reply createdAt role')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/feedback/stats', async (req: Request, res: Response) => {
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

        res.json({ total, average, ratings });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
