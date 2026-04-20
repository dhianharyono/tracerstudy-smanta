import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, authorize } from '../middleware/auth';
import User from '../models/User';
import News from '../models/News';
import Feedback from '../models/Feedback';
import Settings from '../models/Settings';
import Badge from '../models/Badge';
import CollegePlan from '../models/CollegePlan';

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
            { $match: { role: 'student', questionnaireCompleted: true } },
            { $count: 'count' },
          ],
          incompleteStudents: [
            { $match: { role: 'student', questionnaireCompleted: false } },
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

    const onlineUsers = await User.countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      role: { $in: ['student', 'alumni'] },
    });

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

    const alumni = await User.find(filter)

      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

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
    const alumni = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'alumni' },
      req.body,
      { new: true, runValidators: true },
    ).select('-password');

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(alumni);
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
      case 'working':
        const working = await User.find({
          role: 'alumni',
          'profile.isWorking': true,
        }).select('-password');
        return res.json({ data: working, type: 'working' });

      case 'studying':
        const studying = await User.find({
          role: 'alumni',
          'profile.isStudying': true,
        }).select('-password');
        return res.json({ data: studying, type: 'studying' });

      case 'university-type':
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

      case 'major':
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
    const { search, entryYear, graduationYear } = req.query;

    const query: any = { role: 'student' };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.fullName': { $regex: search, $options: 'i' } },
      ];
    }

    if (entryYear) {
      query['profile.entryYear'] = parseInt(entryYear as string);
    }

    if (graduationYear) {
      query['profile.graduationYear'] = parseInt(graduationYear as string);
    }

    const students = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      students,
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
      role: 'student',
      profile: {
        fullName: fullName || '',
      },
    });

    await user.save();

    // Baris 295 yang diperbaiki
    const { password: userPassword, ...userObjWithoutPassword } =
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
    const { password, ...updateData } = req.body;

    const update: any = { ...updateData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const profileUpdates: any = {};
    if (updateData.fullName !== undefined) {
      profileUpdates['profile.fullName'] = updateData.fullName;
    }
    if (updateData.entryYear !== undefined) {
      profileUpdates['profile.entryYear'] = updateData.entryYear;
    }
    if (updateData.graduationYear !== undefined) {
      profileUpdates['profile.graduationYear'] = updateData.graduationYear;
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
    const { password: userPassword, ...userObjWithoutPassword } =
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
    const { password: pw, ...userObj } = user.toObject();
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

export default router;
