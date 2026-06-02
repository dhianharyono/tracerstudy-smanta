import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import Feedback from '../models/Feedback';

import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
    schoolRole?: string;
  };
}

const router = express.Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
    fileFilter: (req, file, cb) => {
        const filetypes = /xlsx|xls|spreadsheetml|ms-excel/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Hanya file Excel yang diperbolehkan (.xlsx atau .xls)'));
    }
});

router.use(authenticate);
router.use(authorize('school'));

// Get school dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        
                const completedAlumni = await User.countDocuments({ 
            role: 'alumni', 
            questionnaireCompleted: true,
            'university.name': { $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] }
        });

        const completedStudents = await User.countDocuments({
            role: 'student',
            'profile.fullName': { $exists: true, $nin: [null, ''] },
            'profile.entryYear': { $exists: true, $ne: null },
            'profile.graduationYear': { $exists: true, $ne: null }
        });

        const verifiedAlumni = await User.countDocuments({ 
            role: 'alumni', 
            isVerifiedBySchool: true 
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
            { 
                $group: { 
                    _id: '$profile.graduationYear', 
                    count: { $sum: 1 },
                    completedCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$questionnaireCompleted', true] },
                                        { $ne: ['$university.name', null] },
                                        { $ne: ['$university.name', ''] },
                                        { $ne: ['$university.name', '-'] },
                                        { $ne: ['$university.name', 'null'] },
                                        { $ne: ['$university.name', 'undefined'] },
                                        { $ne: ['$university.name', 'belum ada'] },
                                        { $ne: ['$university.name', 'tidak ada'] },
                                        { $ne: ['$university.name', '.'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                } 
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    completedCount: 1,
                    incompleteCount: { $subtract: ['$count', '$completedCount'] }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Students by Expected Graduation Year
        const studentsByYear = await User.aggregate([
            { $match: { role: 'student', 'profile.graduationYear': { $exists: true, $ne: null } } },
            { 
                $group: { 
                    _id: '$profile.graduationYear', 
                    count: { $sum: 1 },
                    completedCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$profile.fullName', null] },
                                        { $ne: ['$profile.fullName', ''] },
                                        { $ne: ['$profile.entryYear', null] },
                                        { $ne: ['$profile.graduationYear', null] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                } 
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    completedCount: 1,
                    incompleteCount: { $subtract: ['$count', '$completedCount'] }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Alumni with no graduation year
        const alumniWithoutYear = await User.countDocuments({
            role: 'alumni',
            $or: [
                { 'profile.graduationYear': { $exists: false } },
                { 'profile.graduationYear': null }
            ]
        });

        // Students with no graduation year
        const studentsWithoutYear = await User.countDocuments({
            role: 'student',
            $or: [
                { 'profile.graduationYear': { $exists: false } },
                { 'profile.graduationYear': null }
            ]
        });

        res.json({
            totalAlumni,
            totalStudents,
            completedAlumni,
            incompleteAlumni: totalAlumni - completedAlumni,
            completedStudents,
            incompleteStudents: totalStudents - completedStudents,
            verifiedAlumni,
            workingAlumni,
            studyingAlumni,
            bothAlumni,
            topMajors,
            alumniByYear,
            studentsByYear,
            alumniWithoutYear,
            studentsWithoutYear,
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
        const { search, graduationYear, status, surveyStatus, limit = 50, page = 1, university, major } = req.query;
        
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

        if (university) {
            query['university.name'] = university;
        }

        if (major) {
            query['university.major'] = major;
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
                questionnaireCompleted: true,
                'university.name': { $exists: true, $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] }
            });
        } else if (surveyStatus === 'not_completed') {
            andConditions.push({
                $or: [
                    { questionnaireCompleted: { $ne: true } },
                    { 'university.name': { $in: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] } }
                ]
            });
        }

        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const alumni = await User.find(query)
            .select('profile university job questionnaireCompleted email isVerifiedBySchool verifiedAt')
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

// Download excel template for verification
router.get('/alumni/template', (req: Request, res: Response) => {
    try {
        const wb = XLSX.utils.book_new();
        const data = [
            ['Nama Lengkap', 'Tahun Lulus', 'Status (Kuliah/Kerja/Lainnya)', 'Nama Universitas', 'Nama Perusahaan/Instansi'],
            ['Contoh: Budi Santoso', 2023, 'Kuliah', 'Universitas Indonesia', ''],
            ['Contoh: Siti Aminah', 2022, 'Kerja', '', 'PT Maju Jaya']
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // Nama
            { wch: 15 }, // Tahun Lulus
            { wch: 25 }, // Status
            { wch: 30 }, // Universitas
            { wch: 30 }  // Perusahaan
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Template Verifikasi');
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_verifikasi_alumni.xlsx');
        res.send(buffer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk verify alumni from excel
router.post('/alumni/verify-bulk', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user?.schoolRole !== 'bk') {
            return res.status(403).json({ message: 'Hanya Guru BK yang dapat melakukan sinkronisasi data' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'File tidak ditemukan' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const results = {
            verified: 0,
            mismatch: [] as any[],
            notFound: [] as any[]
        };

        for (const row of (data as any[])) {
            const rawName = row['Nama Lengkap'];
            const gradYear = parseInt(row['Tahun Lulus']);
            const excelStatus = row['Status (Kuliah/Kerja/Lainnya)']?.toLowerCase() || '';
            const excelUniv = row['Nama Universitas'] || '';
            const excelWork = row['Nama Perusahaan/Instansi'] || '';

            if (!rawName || isNaN(gradYear)) continue;

            // Find alumni in DB
            const alumni = await User.findOne({
                role: 'alumni',
                'profile.graduationYear': gradYear,
                'profile.fullName': { $regex: new RegExp(`^${rawName.trim()}$`, 'i') }
            });

            if (alumni) {
                // Check for mismatches
                let isMismatch = false;
                const dbStatus = alumni.profile?.isStudying ? 'kuliah' : (alumni.profile?.isWorking ? 'kerja' : 'lainnya');
                
                if (excelStatus && dbStatus !== excelStatus) {
                    isMismatch = true;
                }

                if (isMismatch) {
                    results.mismatch.push({
                        name: rawName,
                        gradYear,
                        dbData: {
                            status: dbStatus,
                            university: alumni.university?.name || '-',
                            institution: alumni.job?.institution || '-'
                        },
                        excelData: {
                            status: excelStatus,
                            university: excelUniv || '-',
                            institution: excelWork || '-'
                        }
                    });
                } else {
                    // Update as verified
                    alumni.isVerifiedBySchool = true;
                    alumni.verifiedAt = new Date();
                    await alumni.save();
                    results.verified++;
                }
            } else {
                results.notFound.push({ name: rawName, gradYear });
            }
        }

        res.json({
            message: 'Proses sinkronisasi selesai',
            summary: {
                totalProcessed: data.length,
                verifiedCount: results.verified,
                mismatchCount: results.mismatch.length,
                notFoundCount: results.notFound.length
            },
            details: results
        });

        // Add to audit log
        await AuditLog.create({
            action: 'VERIFY_BULK',
            actor: {
                userId: (req as any).user._id,
                username: (req as any).user.username,
                role: (req as any).user.role
            },
            target: {
                type: 'bulk',
                name: 'Data Alumni dari Sekolah'
            },
            details: `Sinkronisasi massal: ${results.verified} diverifikasi, ${results.mismatch.length} mismatch, ${results.notFound.length} tidak ditemukan.`
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
