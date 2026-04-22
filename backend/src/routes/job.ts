import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import Job from '../models/Job';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

// @route   GET /api/jobs
// @desc    Get all approved and active jobs
// @access  Protected
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { category, type, search } = req.query;
      const query: any = {
        status: 'approved',
        expiryDate: { $gte: new Date() },
      };

      if (category) {
        query.category = category;
      }
      if (type) {
        query.type = type;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const jobs = await Job.find(query)
        .populate('postedBy', 'profile.fullName profile.graduationYear')
        .sort({ createdAt: -1 });

      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   GET /api/jobs/my
// @desc    Get jobs posted by the logged-in alumni
// @access  Alumni
router.get(
  '/my',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const jobs = await Job.find({ postedBy: req.user!._id })
        .sort({ createdAt: -1 });
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   GET /api/jobs/admin
// @desc    Get all jobs for admin moderation
// @access  Admin
router.get(
  '/admin',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status) {
        query.status = status;
      }

      const jobs = await Job.find(query)
        .populate('postedBy', 'username profile.fullName')
        .sort({ createdAt: -1 });
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   POST /api/jobs
// @desc    Create a new job opportunity
// @access  Alumni
router.post(
  '/',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        title,
        company,
        location,
        category,
        type,
        description,
        requirements,
        applicationLink,
        expiryDate,
      } = req.body;

      const newJob = new Job({
        title,
        company,
        location,
        category,
        type,
        description,
        requirements,
        applicationLink,
        expiryDate,
        postedBy: req.user!._id,
        status: 'pending',
      });

      const job = await newJob.save();
      res.status(201).json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   PUT /api/jobs/:id
// @desc    Update/Revise a job
// @access  Owner (Alumni)
router.put(
  '/:id',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      let job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (job.postedBy.toString() !== req.user!._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // If updating, status resets to pending for re-approval
      const updates = {
        ...req.body,
        status: 'pending',
        rejectionReason: undefined, // Clear rejection reason on revision
      };

      job = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true },
      );

      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   PATCH /api/jobs/:id/status
// @desc    Approve or reject a job
// @access  Admin
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const { status, rejectionReason } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      if (status === 'rejected' && !rejectionReason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }

      const job = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: { status, rejectionReason } },
        { new: true },
      );

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   PATCH /api/jobs/:id/close
// @desc    Manually close a job
// @access  Owner (Alumni)
router.patch(
  '/:id/close',
  authenticate,
  authorize('alumni'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (job.postedBy.toString() !== req.user!._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      job.status = 'closed';
      await job.save();

      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Owner or Admin
router.delete(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Check if user is admin or owner
      if (
        req.user?.role !== 'admin' &&
        job.postedBy.toString() !== req.user!._id.toString()
      ) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await Job.findByIdAndDelete(req.params.id);
      res.json({ message: 'Job removed' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

export default router;
