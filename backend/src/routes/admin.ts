import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import News from '../models/News';
import AuditLog from '../models/AuditLog';
import Feedback from '../models/Feedback';
import Settings from '../models/Settings';
import Badge from '../models/Badge';
import CollegePlan from '../models/CollegePlan';
import University from '../models/University';
import { ensureUniversityExists, inferUniversityType, syncAllReferencedUniversities } from '../utils/universityHelper';
import { ensureMajorExists } from '../utils/majorHelper';
import { sendAlumniUpgradeReminder, sendAlumniIncompleteReminder, sendStudentIncompleteReminder } from '../utils/mailer';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

// Public route for checking feedback visibility (must be before auth middleware)
router.get(
  '/settings/feedback-visible',
  async (req: Request, res: Response) => {
    try {
      let setting = await Settings.findOne({ key: 'feedbackVisible' });

      if (!setting) {
        // Default to visible
        setting = new Settings({ key: 'feedbackVisible', value: true });
        await setting.save();
      }

      res.json({ visible: setting.value });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// All other admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get verification stats
router.get('/verification-stats', async (req: Request, res: Response) => {
  try {
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    const completedAlumni = await User.countDocuments({
      role: 'alumni',
      questionnaireCompleted: true,
      'university.name': {
        $nin: [
          null,
          '',
          '-',
          'null',
          'undefined',
          'belum ada',
          'tidak ada',
          '.',
        ],
      },
    });
    const verifiedAlumni = await User.countDocuments({
      role: 'alumni',
      isVerifiedBySchool: true,
    });

    res.json({
      totalAlumni,
      completedAlumni,
      verifiedAlumni,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get alumni map data (universities with alumni count)
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

// Dashboard statistics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [stats] = await User.aggregate([
      {
        $facet: {
          totalAlumni: [{ $match: { role: 'alumni' } }, { $count: 'count' }],
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
          completedQuestionnaire: [
            {
              $match: {
                role: 'alumni',
                questionnaireCompleted: true,
                'university.name': {
                  $exists: true,
                  $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'],
                },
              },
            },
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
          universityTypes: [
            {
              $match: {
                role: 'alumni',
                'university.type': { $in: ['negeri', 'swasta', 'kedinasan'] },
                'university.name': {
                  $exists: true,
                  $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'],
                },
              },
            },
            {
              $group: {
                _id: '$university.type',
                count: { $sum: 1 },
              },
            },
          ],
          totalMentors: [
            { $match: { role: 'alumni', isMentor: true } },
            { $count: 'count' },
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
                'university.name': {
                  $exists: true,
                  $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'],
                },
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
                'university.name': {
                  $exists: true,
                  $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'],
                },
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
            {
              $match: {
                role: 'alumni',
                questionnaireCompleted: true,
                'university.name': {
                  $exists: true,
                  $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'],
                },
              },
            },
            { $count: 'count' },
          ],
          incompleteData: [
            {
              $match: {
                role: 'alumni',
                $or: [
                  { questionnaireCompleted: false },
                  { 'university.name': { $in: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] } }
                ]
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const activeAlumni = await User.countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      role: 'alumni',
    });

    const activeStudents = await User.countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      role: 'student',
    });

    const activeSchool = await User.countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      role: 'school',
    });

    const onlineUsers = activeAlumni + activeStudents + activeSchool;

    const getCount = (arr: any[]) => (arr && arr.length > 0 ? arr[0].count : 0);
    const getMap = (arr: any[]) =>
      arr.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {
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

    res.json({
      totalAlumni: getCount(stats.totalAlumni),
      totalStudents: getCount(stats.totalStudents),
      completedStudentsCount: getCount(stats.completedStudents),
      incompleteStudentsCount: getCount(stats.incompleteStudents),
      completedQuestionnaire: getCount(stats.completedQuestionnaire),
      completedCount: getCount(stats.completedData),
      incompleteCount: getCount(stats.incompleteData),
      studentYearStats: stats.studentYearStats || [],
      workingAlumni: getCount(stats.workingAlumni),
      studyingAlumni: getCount(stats.studyingAlumni),
      totalMentors: getCount(stats.totalMentors),
      universityTypes: getMap(stats.universityTypes),
      yearStats: stats.yearStats,
      majorStats: stats.majorStats,
      universityStats: stats.universityStats,
      statusStats,
      onlineUsers,
      onlineUsersDetail: {
        alumni: activeAlumni,
        student: activeStudents,
        school: activeSchool,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all mentors (alumni who are isMentor: true)
router.get('/mentors', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const university = req.query.university as string;
    const graduationYear = req.query.graduationYear as string;
    const major = req.query.major as string;

    const filter: any = { role: 'alumni', isMentor: true };

    if (university) {
      filter['university.name'] = university;
    }

    if (graduationYear) {
      filter['profile.graduationYear'] = parseInt(graduationYear);
    }

    if (major) {
      filter['university.major'] = major;
    }

    const mentors = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    // Get filter options specifically for mentors
    const universitiesQuery = User.distinct('university.name', {
      role: 'alumni',
      isMentor: true,
      'university.name': { $exists: true, $nin: [null, ''] },
    });

    const graduationYearsQuery = User.distinct('profile.graduationYear', {
      role: 'alumni',
      isMentor: true,
      'profile.graduationYear': { $exists: true, $ne: null },
    }).sort();

    const majorsQuery = User.distinct('university.major', {
      role: 'alumni',
      isMentor: true,
      'university.major': { $exists: true, $nin: [null, ''] },
    });

    const [universities, graduationYearsData, majors] = await Promise.all([
      universitiesQuery,
      graduationYearsQuery,
      majorsQuery,
    ]);

    const graduationYears = graduationYearsData.reverse();

    res.json({
      mentors,
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

// Get all alumni
router.get('/alumni', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const university = req.query.university as string;
    const graduationYear = req.query.graduationYear as string;
    const major = req.query.major as string;
    const questionnaireStatus = req.query.questionnaireStatus as string;
    const badgeId = req.query.badgeId as string;
    const name = (req.query.name || req.query.search) as string;
    const duplicate = req.query.duplicate as string;

    const filter: any = { role: 'alumni' };

    if (name) {
      filter['profile.fullName'] = { $regex: name, $options: 'i' };
    }

    if (university) {
      filter['university.name'] = university;
    }

    if (graduationYear) {
      filter['profile.graduationYear'] = parseInt(graduationYear);
    }

    if (major) {
      filter['university.major'] = major;
    }

    if (questionnaireStatus) {
      if (questionnaireStatus === 'completed') {
        filter['questionnaireCompleted'] = true;
        filter['university.name'] = { $exists: true, $nin: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] };
      } else if (questionnaireStatus === 'incomplete') {
        filter['$or'] = [
          { questionnaireCompleted: { $ne: true } },
          { 'university.name': { $in: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] } }
        ];
      }
    }

    if (badgeId) {
      filter['badges'] = badgeId;
    }

    if (duplicate) {
      if (duplicate === 'name') {
        const duplicateNames = await User.aggregate([
          { $match: { role: 'alumni', 'profile.fullName': { $exists: true, $ne: '' } } },
          { $group: { _id: { $toLower: '$profile.fullName' }, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } }
        ]);
        const nameList = duplicateNames.map(d => d._id);
        filter['$expr'] = { $in: [ { $toLower: '$profile.fullName' }, nameList ] };
      } else if (duplicate === 'email') {
        const duplicateEmails = await User.aggregate([
          { $match: { role: 'alumni', email: { $exists: true, $ne: '' } } },
          { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } }
        ]);
        const emailList = duplicateEmails.map(d => d._id);
        filter['$expr'] = { $in: [ { $toLower: '$email' }, emailList ] };
      } else if (duplicate === 'all' || duplicate === 'any') {
        const [duplicateNames, duplicateEmails] = await Promise.all([
          User.aggregate([
            { $match: { role: 'alumni', 'profile.fullName': { $exists: true, $ne: '' } } },
            { $group: { _id: { $toLower: '$profile.fullName' }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
          ]),
          User.aggregate([
            { $match: { role: 'alumni', email: { $exists: true, $ne: '' } } },
            { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
          ])
        ]);
        const nameList = duplicateNames.map(d => d._id);
        const emailList = duplicateEmails.map(d => d._id);
        const duplicateConditions = [
          { $expr: { $in: [ { $toLower: '$profile.fullName' }, nameList ] } },
          { $expr: { $in: [ { $toLower: '$email' }, emailList ] } }
        ];

        if (filter['$or']) {
          const existingOr = filter['$or'];
          delete filter['$or'];
          filter['$and'] = [
            { $or: existingOr },
            { $or: duplicateConditions }
          ];
        } else {
          filter['$or'] = duplicateConditions;
        }
      }
    }

    const alumni = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    const total = await User.countDocuments(filter);

    // Flag duplicates for the returned items
    const [dupNames, dupEmails] = await Promise.all([
      User.aggregate([
        { $match: { role: 'alumni', 'profile.fullName': { $exists: true, $ne: '' } } },
        { $group: { _id: { $toLower: '$profile.fullName' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'alumni', email: { $exists: true, $ne: '' } } },
        { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ])
    ]);

    const dupNameSet = new Set(dupNames.map(d => d._id));
    const dupEmailSet = new Set(dupEmails.map(d => d._id));

    const alumniWithDupFlags = alumni.map(a => {
      const u = a.toObject() as any;
      u.isDuplicateName = u.profile?.fullName ? dupNameSet.has(u.profile.fullName.toLowerCase()) : false;
      u.isDuplicateEmail = u.email ? dupEmailSet.has(u.email.toLowerCase()) : false;
      return u;
    });

    // Get filter options
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
      alumni: alumniWithDupFlags,
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

// Get single alumni
router.get('/alumni/:id', async (req: Request, res: Response) => {
  try {
    const alumni = await User.findOne({
      _id: req.params.id,
      role: 'alumni',
    }).select('-password');

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(alumni);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update alumni
router.put('/alumni/:id', async (req: Request, res: Response) => {
  try {
      const { university } = req.body;
      if (university?.name) {
        await ensureUniversityExists(university.name, (req as any).user._id, university.type);
      }
      
      if (university?.major) {
        await ensureMajorExists(university.major, (req as any).user._id);
      }

      const alumni = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'alumni' },
        req.body,
        { new: true, runValidators: true },
      ).select('-password');

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(alumni);

    // Dynamic logging
    await AuditLog.create({
      action: 'UPDATE_ALUMNI',
      actor: {
        userId: (req as any).user._id,
        username: (req as any).user.username,
        role: (req as any).user.role,
      },
      target: {
        type: 'alumni',
        name: alumni.profile?.fullName || alumni.username,
      },
      details: `Mengupdate data alumni: ${alumni.profile?.fullName || alumni.username}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete alumni
router.delete('/alumni/:id', async (req: Request, res: Response) => {
  try {
    const alumni = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'alumni',
    });

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json({ message: 'Alumni deleted successfully' });

    // Dynamic logging
    await AuditLog.create({
      action: 'DELETE_ALUMNI',
      actor: {
        userId: (req as any).user._id,
        username: (req as any).user.username,
        role: (req as any).user.role,
      },
      target: {
        type: 'alumni',
        name: alumni.profile?.fullName || alumni.username,
      },
      details: `Menghapus data alumni: ${alumni.profile?.fullName || alumni.username}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Demote alumni to student
router.patch('/alumni/:id/demote', async (req: Request, res: Response) => {
  try {
    const alumni = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'alumni' },
      { 
        $set: { 
          role: 'student',
          questionnaireCompleted: false,
          isVerifiedBySchool: false,
          'profile.isWorking': false,
          'profile.isStudying': false,
          'university.name': '',
          'university.major': '',
          'university.type': '',
          badges: []
        } 
      },
      { new: true }
    ).select('-password');

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json({ message: 'User demoted to student successfully', user: alumni });

    // Logging
    await AuditLog.create({
      action: 'DEMOTE_ALUMNI',
      actor: {
        userId: (req as any).user._id,
        username: (req as any).user.username,
        role: (req as any).user.role,
      },
      target: {
        type: 'student',
        name: alumni.profile?.fullName || alumni.username,
      },
      details: `Mengubah role alumni ${alumni.profile?.fullName || alumni.username} menjadi student`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove badge from alumni
router.delete(
  '/alumni/:userId/badges/:badgeId',
  async (req: Request, res: Response) => {
    try {
      const { userId, badgeId } = req.params;

      const user = await User.findOneAndUpdate(
        { _id: userId, role: 'alumni' },
        { $pull: { badges: badgeId } },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({ message: 'Alumni not found' });
      }

      res.json({ message: 'Badge removed from alumni successfully', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Generate reports
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const reportType = req.query.type as string;

    switch (reportType) {
      case 'working': {
        const working = await User.find({
          role: 'alumni',
          'profile.isWorking': true,
        }).select('-password');
        return res.json({ data: working, type: 'working' });
      }

      case 'studying': {
        const studying = await User.find({
          role: 'alumni',
          'profile.isStudying': true,
        }).select('-password');
        return res.json({ data: studying, type: 'studying' });
      }

      case 'university-type': {
        const universityTypes = await User.aggregate([
          {
            $match: {
              role: 'alumni',
              'university.type': { $exists: true },
            },
          },
          {
            $group: {
              _id: '$university.type',
              count: { $sum: 1 },
              alumni: { $push: '$$ROOT' },
            },
          },
        ]);
        return res.json({ data: universityTypes, type: 'university-type' });
      }

      case 'major': {
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
              alumni: { $push: '$$ROOT' },
            },
          },
          { $sort: { count: -1 } },
        ]);
        return res.json({ data: majors, type: 'major' });
      }

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students
router.get('/students', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { search, entryYear, graduationYear, status, duplicate } = req.query;

    const query: any = { role: 'student' };
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'profile.fullName': { $regex: search, $options: 'i' } },
        ]
      });
    }

    if (entryYear) {
      andConditions.push({ 'profile.entryYear': parseInt(entryYear as string) });
    }

    if (graduationYear) {
      andConditions.push({ 'profile.graduationYear': parseInt(graduationYear as string) });
    }

    if (status) {
      if (status === 'complete') {
        andConditions.push({ 'profile.fullName': { $exists: true, $nin: [null, ''] } });
        andConditions.push({ 'profile.entryYear': { $exists: true, $ne: null } });
        andConditions.push({ 'profile.graduationYear': { $exists: true, $ne: null } });
      } else if (status === 'incomplete') {
        andConditions.push({
          $or: [
            { 'profile': { $exists: false } },
            { 'profile.fullName': { $exists: false } },
            { 'profile.fullName': { $in: [null, ''] } },
            { 'profile.entryYear': { $exists: false } },
            { 'profile.entryYear': null },
            { 'profile.graduationYear': { $exists: false } },
            { 'profile.graduationYear': null }
          ]
        });
      }
    }

    if (duplicate) {
      if (duplicate === 'name') {
        const duplicateNames = await User.aggregate([
          { $match: { role: 'student', 'profile.fullName': { $exists: true, $ne: '' } } },
          { $group: { _id: { $toLower: '$profile.fullName' }, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } }
        ]);
        const nameList = duplicateNames.map(d => d._id);
        andConditions.push({ $expr: { $in: [ { $toLower: '$profile.fullName' }, nameList ] } });
      } else if (duplicate === 'email') {
        const duplicateEmails = await User.aggregate([
          { $match: { role: 'student', email: { $exists: true, $ne: '' } } },
          { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } }
        ]);
        const emailList = duplicateEmails.map(d => d._id);
        andConditions.push({ $expr: { $in: [ { $toLower: '$email' }, emailList ] } });
      } else if (duplicate === 'all' || duplicate === 'any') {
        const [duplicateNames, duplicateEmails] = await Promise.all([
          User.aggregate([
            { $match: { role: 'student', 'profile.fullName': { $exists: true, $ne: '' } } },
            { $group: { _id: { $toLower: '$profile.fullName' }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
          ]),
          User.aggregate([
            { $match: { role: 'student', email: { $exists: true, $ne: '' } } },
            { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
          ])
        ]);
        const nameList = duplicateNames.map(d => d._id);
        const emailList = duplicateEmails.map(d => d._id);
        andConditions.push({
          $or: [
            { $expr: { $in: [ { $toLower: '$profile.fullName' }, nameList ] } },
            { $expr: { $in: [ { $toLower: '$email' }, emailList ] } }
          ]
        });
      }
    }

    if (andConditions.length > 0) {
      query['$and'] = andConditions;
    }

    const students = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    const total = await User.countDocuments(query);

    // Flag duplicates for the returned items
    const [dupNames, dupEmails] = await Promise.all([
      User.aggregate([
        { $match: { role: 'student', 'profile.fullName': { $exists: true, $ne: '' } } },
        { $group: { _id: { $toLower: '$profile.fullName' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student', email: { $exists: true, $ne: '' } } },
        { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ])
    ]);

    const dupNameSet = new Set(dupNames.map(d => d._id));
    const dupEmailSet = new Set(dupEmails.map(d => d._id));

    const studentsWithDupFlags = students.map(s => {
      const u = s.toObject() as any;
      u.isDuplicateName = u.profile?.fullName ? dupNameSet.has(u.profile.fullName.toLowerCase()) : false;
      u.isDuplicateEmail = u.email ? dupEmailSet.has(u.email.toLowerCase()) : false;
      return u;
    });

    res.json({
      students: studentsWithDupFlags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/students', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, entryYear, graduationYear } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'student',
      profile: {
        fullName: fullName || '',
        entryYear: entryYear ? parseInt(entryYear) : undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      },
    });

    await user.save();

    // Baris 295 yang diperbaiki
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _userPassword, ...userObjWithoutPassword } =
      user.toObject();

    res.status(201).json(userObjWithoutPassword);
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update student
router.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, entryYear, graduationYear } = req.body;

    const update: any = {};
    if (username !== undefined) update.username = username;
    if (email !== undefined) update.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const profileUpdates: any = {};
    if (fullName !== undefined) {
      profileUpdates['profile.fullName'] = fullName;
    }
    if (entryYear !== undefined) {
      profileUpdates['profile.entryYear'] = entryYear ? parseInt(entryYear) : null;
    }
    if (graduationYear !== undefined) {
      profileUpdates['profile.graduationYear'] = graduationYear ? parseInt(graduationYear) : null;
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { $set: { ...update, ...profileUpdates } },
      { new: true, runValidators: true },
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student
router.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'student',
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all admins
router.get('/admins', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'admin' });

    res.json({
      admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create admin
router.post('/admins', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      profile: {
        fullName: fullName || '',
      },
    });

    await user.save();

    // Baris 401 yang diperbaiki
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _userPassword2, ...userObjWithoutPassword } =
      user.toObject();

    res.status(201).json(userObjWithoutPassword);
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update admin
router.put('/admins/:id', async (req: Request, res: Response) => {
  try {
    const { password, ...updateData } = req.body;

    const update: any = { ...updateData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    if (updateData.fullName !== undefined) {
      update.profile = { ...update.profile, fullName: updateData.fullName };
    }

    const admin = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'admin' },
      update,
      { new: true, runValidators: true },
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete admin
router.delete('/admins/:id', async (req: Request, res: Response) => {
  try {
    const admin = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'admin',
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      // Restore the admin if it was the last one
      await admin.save();
      return res.status(400).json({ message: 'Cannot delete the last admin' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// School users management
router.get('/school-users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const schoolUsers = await User.find({ role: 'school' })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'school' });

    res.json({
      schoolUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/school-users', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, schoolRole } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'school',
      schoolRole: schoolRole || 'teacher',
      profile: {
        fullName: fullName || '',
      },
    });

    await user.save();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userObj } = user.toObject();
    res.status(201).json(userObj);
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/school-users/:id', async (req: Request, res: Response) => {
  try {
    const { password, ...updateData } = req.body;
    const update: any = { ...updateData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'school' },
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'School user not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/school-users/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'school' });
    if (!user) {
      return res.status(404).json({ message: 'School user not found' });
    }
    res.json({ message: 'School user deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Audit logs monitoring
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/audit-logs', async (req: Request, res: Response) => {
  try {
    await AuditLog.deleteMany({});
    res.json({ message: 'Audit logs cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/audit-logs/:id', async (req: Request, res: Response) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json({ message: 'Log entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// News routes
// Get all news
router.get('/news', async (req: Request, res: Response) => {
  try {
    const query = News.find();

    if (req.query.isPublished === 'true') {
      query.where('isPublished').equals(true);
    }

    if (req.query.limit) {
      query.limit(parseInt(req.query.limit as string));
    }

    const news = await query
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single news
router.get('/news/:id', async (req: Request, res: Response) => {
  try {
    const news = await News.findById(req.params.id).populate(
      'author',
      'username',
    );

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create news
router.post('/news', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, type, isPublished } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: 'Title and content are required' });
    }

    const news = new News({
      title,
      content,
      author: req.user!._id,
      type: type || 'all',
      isPublished: isPublished || false,
    });

    await news.save();
    await news.populate('author', 'username');
    res.status(201).json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update news
router.put('/news/:id', async (req: Request, res: Response) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'username');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete news
router.delete('/news/:id', async (req: Request, res: Response) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Feedback routes
// Get all feedbacks
router.get('/feedback', async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'username role')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get feedback statistics (MUST be before /feedback/:id to avoid route conflict)
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

    res.json({
      total,
      average,
      ratings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single feedback (MUST be after /feedback/stats to avoid route conflict)
router.get('/feedback/:id', async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate(
      'user',
      'username role',
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Reply to feedback
router.post('/feedback/:id/reply', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          reply: {
            content,
            adminId: req.user!._id,
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    ).populate('user', 'username role');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete feedback
router.delete('/feedback/:id', async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle feedback landing page visibility
router.put('/feedback/:id/toggle-landing', async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('user', 'username role');
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    feedback.showOnLandingPage = !feedback.showOnLandingPage;
    await feedback.save();
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Settings routes
// Update feedback visibility setting (admin only)
router.put(
  '/settings/feedback-visible',
  async (req: Request, res: Response) => {
    try {
      const { visible } = req.body;

      let setting = await Settings.findOne({ key: 'feedbackVisible' });

      if (setting) {
        setting.value = visible;
        await setting.save();
      } else {
        setting = new Settings({ key: 'feedbackVisible', value: visible });
        await setting.save();
      }

      res.json({ visible: setting.value });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Badge Routes

// Get all badges
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create badge
router.post('/badges', async (req: Request, res: Response) => {
  try {
    const { name, description, code, expiredDate } = req.body;

    if (!name || !description || !code || !expiredDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const badge = new Badge({
      name,
      description,
      code,
      expiredDate,
    });

    await badge.save();
    res.status(201).json(badge);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Badge code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete badge
router.delete('/badges/:id', async (req: Request, res: Response) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.json({ message: 'Badge deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update badge
router.put('/badges/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, code, expiredDate } = req.body;
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      { name, description, code, expiredDate },
      { new: true, runValidators: true },
    );
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.json(badge);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Badge code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Manage College Plans
router.get('/college-plans', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const university = req.query.university as string;
    const major = req.query.major as string;
    const name = req.query.name as string;
    const graduationYear = req.query.graduationYear as string;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    const match: any = {};
    if (university) match['targetUniversity'] = { $regex: university, $options: 'i' };
    if (major) match['targetMajor'] = { $regex: major, $options: 'i' };
    if (name) match['user.profile.fullName'] = { $regex: name, $options: 'i' };
    if (graduationYear) match['user.profile.graduationYear'] = parseInt(graduationYear);

    pipeline.push({ $match: match });

    const [plans, totalCount] = await Promise.all([
      CollegePlan.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            targetUniversity: 1,
            targetMajor: 1,
            entryPath: 1,
            readinessStatus: 1,
            rumpun: 1,
            createdAt: 1,
            lockCount: 1,
            'user._id': 1,
            'user.username': 1,
            'user.profile.fullName': 1,
            'user.profile.graduationYear': 1
          }
        }
      ]),
      CollegePlan.aggregate([
        ...pipeline,
        { $count: 'total' }
      ])
    ]);

    // Get filter options based on existing data
    const universitiesQuery = CollegePlan.distinct('targetUniversity');
    const majorsQuery = CollegePlan.distinct('targetMajor');
    // Get distinct graduation years from users who have plans
    const graduationYearsQuery = CollegePlan.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'u'
        }
      },
      { $unwind: '$u' },
      {
        $group: {
          _id: '$u.profile.graduationYear'
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const [universities, majors, gradYearsRaw] = await Promise.all([
      universitiesQuery,
      majorsQuery,
      graduationYearsQuery
    ]);

    const graduationYears = gradYearsRaw.map(g => g._id).filter(y => y != null);

    const total = totalCount[0]?.total || 0;

    res.json({
      plans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        universities: universities.sort(),
        majors: majors.sort(),
        graduationYears
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/college-plans/:id', async (req: Request, res: Response) => {
  try {
    const plan = await CollegePlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send email reminder to students to upgrade status or complete profile
router.post('/students/send-reminder', async (req: Request, res: Response) => {
  try {
    const { studentId, graduationYear, type } = req.body;
    const isUpgrade = type === 'upgrade' || !type;

    let targetStudents: any[] = [];

    if (studentId) {
      // Send to a single student
      const student = await User.findOne({ _id: studentId, role: 'student' });
      if (!student) {
        return res.status(404).json({ message: 'Siswa tidak ditemukan' });
      }
      targetStudents = [student];
    } else {
      const query: any = { role: 'student' };

      if (!isUpgrade) {
        // We only want students whose data is incomplete
        query.$or = [
          { 'profile': { $exists: false } },
          { 'profile.fullName': { $exists: false } },
          { 'profile.fullName': { $in: [null, ''] } },
          { 'profile.entryYear': { $exists: false } },
          { 'profile.entryYear': null },
          { 'profile.graduationYear': { $exists: false } },
          { 'profile.graduationYear': null }
        ];
      }

      if (graduationYear) {
        query['profile.graduationYear'] = parseInt(graduationYear);
      }

      targetStudents = await User.find(query);
    }

    if (targetStudents.length === 0) {
      return res.status(404).json({ message: 'Tidak ada siswa yang memenuhi kriteria pengiriman email.' });
    }

    // IMPORTANT: On Vercel serverless, fire-and-forget does NOT work.
    // The function is killed immediately after res.json() is called.
    // We must await all email sending before responding.
    let successCount = 0;
    let failCount = 0;
    const errors: { email: string; error: string }[] = [];

    for (const student of targetStudents) {
      if (!student.email) {
        failCount++;
        errors.push({
          email: student.username || 'unknown',
          error: 'Siswa tidak memiliki alamat email.',
        });
        continue;
      }
      const name = student.profile?.fullName || student.username;
      const result = isUpgrade
        ? await sendAlumniUpgradeReminder(student.email, name)
        : await sendStudentIncompleteReminder(student.email, name);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        errors.push({
          email: student.email,
          error: result.error || 'Gagal mengirim email.',
        });
      }
    }

    // Log to AuditLog
    try {
      await AuditLog.create({
        action: isUpgrade ? 'SEND_EMAIL_REMINDER' : 'SEND_STUDENT_INCOMPLETE_REMINDER',
        actor: {
          userId: (req as any).user?._id || null,
          username: (req as any).user?.username || 'system',
          role: (req as any).user?.role || 'admin',
        },
        target: {
          type: 'student',
          name: studentId
            ? (targetStudents[0].profile?.fullName || targetStudents[0].username)
            : `Bulk (${targetStudents.length} siswa)`,
        },
        details: isUpgrade
          ? `Mengirim email pengingat upgrade alumni ke ${successCount} siswa (gagal: ${failCount})`
          : `Mengirim email pengingat kelengkapan data ke ${successCount} siswa (gagal: ${failCount})`,
      });
    } catch (err) {
      console.error('Failed to write AuditLog for email reminders:', err);
    }

    res.json({
      message: isUpgrade
        ? `Email pengingat upgrade alumni berhasil dikirim ke ${successCount} siswa${failCount > 0 ? `, gagal: ${failCount}` : ''}.`
        : `Email pengingat kelengkapan data berhasil dikirim ke ${successCount} siswa${failCount > 0 ? `, gagal: ${failCount}` : ''}.`,
      count: targetStudents.length,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send email reminder to alumni to fill/complete questionnaire
router.post('/alumni/send-reminder', async (req: Request, res: Response) => {
  try {
    const { alumniId, graduationYear } = req.body;

    let targetAlumni: any[] = [];

    if (alumniId) {
      // Send to a single alumni
      const alum = await User.findOne({ _id: alumniId, role: 'alumni' });
      if (!alum) {
        return res.status(404).json({ message: 'Alumni tidak ditemukan' });
      }
      targetAlumni = [alum];
    } else {
      const query: any = { role: 'alumni' };
      
      // We only want alumni whose data is incomplete
      query['$or'] = [
        { questionnaireCompleted: { $ne: true } },
        { 'university.name': { $in: [null, '', '-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'] } }
      ];

      if (graduationYear) {
        query['profile.graduationYear'] = parseInt(graduationYear);
      }

      targetAlumni = await User.find(query);
    }

    if (targetAlumni.length === 0) {
      return res.status(404).json({ message: 'Tidak ada alumni yang memenuhi kriteria pengiriman email.' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors: { email: string; error: string }[] = [];

    for (const alum of targetAlumni) {
      if (!alum.email) {
        failCount++;
        errors.push({
          email: alum.username || 'unknown',
          error: 'Alumni tidak memiliki alamat email.',
        });
        continue;
      }
      const name = alum.profile?.fullName || alum.username;
      const result = await sendAlumniIncompleteReminder(alum.email, name);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        errors.push({
          email: alum.email,
          error: result.error || 'Gagal mengirim email.',
        });
      }
    }

    // Log to AuditLog
    try {
      await AuditLog.create({
        action: 'SEND_ALUMNI_EMAIL_REMINDER',
        actor: {
          userId: (req as any).user?._id || null,
          username: (req as any).user?.username || 'system',
          role: (req as any).user?.role || 'admin',
        },
        target: {
          type: 'alumni',
          name: alumniId
            ? (targetAlumni[0].profile?.fullName || targetAlumni[0].username)
            : `Bulk (${targetAlumni.length} alumni)`,
        },
        details: `Mengirim email pengingat kuesioner ke ${successCount} alumni (gagal: ${failCount})`,
      });
    } catch (err) {
      console.error('Failed to write AuditLog for alumni email reminders:', err);
    }

    res.json({
      message: `Email pengingat berhasil dikirim ke ${successCount} alumni${failCount > 0 ? `, gagal: ${failCount}` : ''}.`,
      count: targetAlumni.length,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== UNIVERSITY MANAGEMENT ROUTES ====================

// @desc    Get all universities with pagination, search, filters & usage stats
// @route   GET /api/admin/universities
// @access  Private (Admin)
router.get('/universities', async (req: Request, res: Response) => {
  try {
    // Auto sync any university referenced in alumni or student college plans that isn't in master list yet
    await syncAllReferencedUniversities();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const type = (req.query.type as string) || '';
    const isVerified = (req.query.isVerified as string) || '';
    const alumniFilter = (req.query.alumniFilter as string) || '';

    const conditions: any[] = [];

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (type) {
      if (
        type === 'unassigned' ||
        type === 'belum_terpilih' ||
        type === 'belum_ditentukan'
      ) {
        conditions.push({
          $or: [{ type: '' }, { type: null }, { type: { $exists: false } }],
        });
      } else {
        conditions.push({ type });
      }
    }

    if (isVerified !== '') {
      conditions.push({ isVerified: isVerified === 'true' });
    }

    if (alumniFilter) {
      const u1Names = await User.distinct('university.name', { role: 'alumni' });
      const u2Names = await User.distinct('universityS2.name', { role: 'alumni' });
      const u3Names = await User.distinct('universityS3.name', { role: 'alumni' });

      const allAlumniUnivNames = Array.from(
        new Set(
          [...u1Names, ...u2Names, ...u3Names]
            .filter((n) => typeof n === 'string' && (n as string).trim() !== '')
            .map((n) => (n as string).trim())
        )
      );

      const regexList = allAlumniUnivNames.map(
        (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      );

      if (alumniFilter === 'has_alumni') {
        conditions.push({ name: { $in: regexList } });
      } else if (alumniFilter === 'no_alumni') {
        conditions.push({ name: { $nin: regexList } });
      }
    }

    const filter: any = conditions.length > 0 ? { $and: conditions } : {};

    const total = await University.countDocuments(filter);
    const universities = await University.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Compute stats
    const totalAll = await University.countDocuments({});
    const totalVerified = await University.countDocuments({ isVerified: true });
    const totalUnverified = await University.countDocuments({ isVerified: false });
    const totalPtn = await University.countDocuments({ type: 'negeri' });
    const totalPts = await University.countDocuments({ type: 'swasta' });
    const totalKedinasan = await University.countDocuments({ type: 'kedinasan' });
    const totalLuarNegeri = await University.countDocuments({ type: 'luar negeri' });
    const totalUnassignedType = await University.countDocuments({
      $or: [{ type: '' }, { type: null }, { type: { $exists: false } }],
    });

    // Attach usage count (alumni and college plans) for each university in page
    const enrichedUniversities = await Promise.all(
      universities.map(async (univ) => {
        const univObj = univ.toObject();
        const escName = univ.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escName}$`, 'i');

        const alumniCount = await User.countDocuments({
          role: 'alumni',
          $or: [
            { 'university.name': regex },
            { 'universityS2.name': regex },
            { 'universityS3.name': regex },
          ],
        });

        const studentPlanCount = await CollegePlan.countDocuments({
          targetUniversity: regex,
        });

        return {
          ...univObj,
          alumniCount,
          studentPlanCount,
          totalUsage: alumniCount + studentPlanCount,
        };
      })
    );

    res.json({
      universities: enrichedUniversities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total: totalAll,
        verified: totalVerified,
        unverified: totalUnverified,
        negeri: totalPtn,
        swasta: totalPts,
        kedinasan: totalKedinasan,
        luarNegeri: totalLuarNegeri,
        unassignedType: totalUnassignedType,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Auto categorize unassigned universities based on name keywords
// @route   POST /api/admin/universities/auto-categorize
// @access  Private (Admin)
router.post('/universities/auto-categorize', async (req: Request, res: Response) => {
  try {
    const unassignedList = await University.find({
      $or: [{ type: '' }, { type: { $exists: false } }],
    });

    let updatedCount = 0;
    for (const univ of unassignedList) {
      const inferred = inferUniversityType(univ.name);
      if (inferred) {
        univ.type = inferred;
        await univ.save();
        updatedCount++;
      }
    }

    // Write AuditLog
    try {
      await AuditLog.create({
        action: 'AUTO_CATEGORIZE_UNIVERSITIES',
        actor: {
          userId: (req as any).user?._id,
          username: (req as any).user?.username || 'admin',
          role: (req as any).user?.role || 'admin',
        },
        target: {
          type: 'university',
          name: `Bulk Auto Categorize (${updatedCount} updated)`,
        },
        details: `Meng-kategori otomatis ${updatedCount} perguruan tinggi berdasarkan kata kunci nama.`,
      });
    } catch (err) {
      console.error('AuditLog error:', err);
    }

    res.json({
      message: `Berhasil meng-kategori otomatis ${updatedCount} perguruan tinggi.`,
      updatedCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Add a new university
// @route   POST /api/admin/universities
// @access  Private (Admin)
router.post('/universities', async (req: Request, res: Response) => {
  try {
    const { name, type, location, isVerified } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nama perguruan tinggi wajib diisi.' });
    }

    const trimmedName = name.trim();
    const existing = await University.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ message: 'Perguruan tinggi dengan nama ini sudah ada.' });
    }

    const university = await University.create({
      name: trimmedName,
      type: type || '',
      location: location || '',
      isVerified: isVerified !== undefined ? isVerified : true,
      addedBy: (req as any).user?._id,
    });

    // Write AuditLog
    try {
      await AuditLog.create({
        action: 'CREATE_UNIVERSITY',
        actor: {
          userId: (req as any).user?._id,
          username: (req as any).user?.username || 'admin',
          role: (req as any).user?.role || 'admin',
        },
        target: {
          type: 'university',
          name: university.name,
        },
        details: `Menambahkan perguruan tinggi baru: "${university.name}" (${university.type || 'N/A'})`,
      });
    } catch (err) {
      console.error('AuditLog error:', err);
    }

    res.status(201).json(university);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Update a university (with option to cascade name changes)
// @route   PUT /api/admin/universities/:id
// @access  Private (Admin)
router.put('/universities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, location, isVerified, cascadeUpdate = true } = req.body;

    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({ message: 'Perguruan tinggi tidak ditemukan.' });
    }

    const oldName = university.name;
    const newName = name ? name.trim() : oldName;

    if (newName !== oldName) {
      // Check if new name already exists in another document
      const conflict = await University.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${newName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (conflict) {
        return res.status(400).json({
          message: `Perguruan tinggi "${newName}" sudah terdaftar di database.`,
        });
      }
    }

    university.name = newName;
    if (type !== undefined) university.type = type;
    if (location !== undefined) university.location = location;
    if (isVerified !== undefined) university.isVerified = isVerified;

    await university.save();

    let updatedUsersCount = 0;
    let updatedPlansCount = 0;

    // Cascade name update if name changed and cascadeUpdate is enabled
    if (oldName !== newName && cascadeUpdate) {
      const escOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexOld = new RegExp(`^${escOldName}$`, 'i');

      const u1 = await User.updateMany(
        { 'university.name': regexOld },
        { $set: { 'university.name': newName } }
      );
      const u2 = await User.updateMany(
        { 'universityS2.name': regexOld },
        { $set: { 'universityS2.name': newName } }
      );
      const u3 = await User.updateMany(
        { 'universityS3.name': regexOld },
        { $set: { 'universityS3.name': newName } }
      );
      updatedUsersCount = (u1.modifiedCount || 0) + (u2.modifiedCount || 0) + (u3.modifiedCount || 0);

      const p1 = await CollegePlan.updateMany(
        { targetUniversity: regexOld },
        { $set: { targetUniversity: newName } }
      );
      updatedPlansCount = p1.modifiedCount || 0;
    }

    // Write AuditLog
    try {
      await AuditLog.create({
        action: 'UPDATE_UNIVERSITY',
        actor: {
          userId: (req as any).user?._id,
          username: (req as any).user?.username || 'admin',
          role: (req as any).user?.role || 'admin',
        },
        target: {
          type: 'university',
          name: university.name,
        },
        details: `Mengedit perguruan tinggi: "${oldName}" -> "${newName}". Cascade updated: ${updatedUsersCount} alumni, ${updatedPlansCount} rencana studi.`,
      });
    } catch (err) {
      console.error('AuditLog error:', err);
    }

    res.json({
      university,
      cascadeStats: {
        updatedUsersCount,
        updatedPlansCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Delete a university
// @route   DELETE /api/admin/universities/:id
// @access  Private (Admin)
router.delete('/universities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({ message: 'Perguruan tinggi tidak ditemukan.' });
    }

    const name = university.name;
    await University.findByIdAndDelete(id);

    // Write AuditLog
    try {
      await AuditLog.create({
        action: 'DELETE_UNIVERSITY',
        actor: {
          userId: (req as any).user?._id,
          username: (req as any).user?.username || 'admin',
          role: (req as any).user?.role || 'admin',
        },
        target: {
          type: 'university',
          name: name,
        },
        details: `Menghapus perguruan tinggi: "${name}"`,
      });
    } catch (err) {
      console.error('AuditLog error:', err);
    }

    res.json({ message: `Perguruan tinggi "${name}" berhasil dihapus.` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
