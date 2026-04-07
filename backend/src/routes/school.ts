import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';

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
        
        if (search) {
            query.$or = [
                { 'profile.fullName': { $regex: search, $options: 'i' } },
                { 'university.name': { $regex: search, $options: 'i' } },
                { 'university.major': { $regex: search, $options: 'i' } },
                { 'job.institution': { $regex: search, $options: 'i' } }
            ];
        }
        
        if (graduationYear) {
            query['profile.graduationYear'] = parseInt(graduationYear as string);
        }

        if (status === 'working') {
            query['profile.isWorking'] = true;
            query['profile.isStudying'] = false;
        } else if (status === 'studying') {
            query['profile.isStudying'] = true;
            query['profile.isWorking'] = false;
        } else if (status === 'both') {
            query['profile.isWorking'] = true;
            query['profile.isStudying'] = true;
        } else if (status === 'none') {
            query['profile.isWorking'] = false;
            query['profile.isStudying'] = false;
        }

        if (surveyStatus === 'completed') {
            query.questionnaireCompleted = true;
        } else if (surveyStatus === 'not_completed') {
            query.questionnaireCompleted = { $ne: true };
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
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);
        
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
