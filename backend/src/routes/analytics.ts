import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import PageVisit from '../models/PageVisit';

const router = express.Router();

router.use(authenticate);

// Log a page visit
router.post('/log', async (req: Request, res: Response) => {
    try {
        const { path, menuName } = req.body;
        // @ts-ignore
        const user = req.user!;

        if (user.role === 'admin') {
            return res.status(200).json({ message: 'Admin activity ignored' });
        }

        const visit = new PageVisit({
            userId: user._id,
            role: user.role,
            path: path,
            menuName: menuName || 'Unknown', // Default if missing
        });

        await visit.save();
        res.status(201).json(visit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get website stats (Admin only)
router.get('/stats', authorize('admin'), async (req: Request, res: Response) => {
    try {
        // 1. Visits over time (last 7 days)
        const period = (req.query.period as string) || 'week'; // 'today', 'week', 'month', 'year'
        let startDate = new Date();
        let groupFormat = '%Y-%m-%d';

        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                groupFormat = '%H:00'; // Hourly Grouping
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupFormat = '%Y-%m'; // Monthly Grouping
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const visitsByDate = await PageVisit.aggregate([
            { $match: { timestamp: { $gte: startDate }, role: { $ne: 'admin' } } },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: '$timestamp', timezone: '+07:00' } }, // Adjust timezone if needed (e.g. WIB)
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 2. Most visited pages/menus (filtered by period)
        const popularPages = await PageVisit.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate },
                    role: { $ne: 'admin' },
                    path: { $nin: ['/student', '/alumni'] } // Exclude dashboard home pages
                }
            },
            {
                $group: {
                    _id: '$path',
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    menuNames: { $addToSet: '$menuName' } // Collect all menu names for this path
                },
            },
            {
                $addFields: {
                    // Find a menu name that is NOT 'Unknown'
                    resolvedMenuName: {
                        $reduce: {
                            input: '$menuNames',
                            initialValue: '',
                            in: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$$this', 'Unknown'] }, { $ne: ['$$this', null] }] },
                                    then: '$$this',
                                    else: '$$value'
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    path: '$_id',
                    menuName: '$resolvedMenuName', // Use the resolved name (or empty string if all were Unknown)
                    count: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // 3. User Activity Breakdown (visits by role, filtered by period)
        const visitsByRole = await PageVisit.aggregate([
            { $match: { timestamp: { $gte: startDate }, role: { $ne: 'admin' } } },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                },
            },
        ]);

        // 4. Online Users (Active in last 5 mins - leveraging PageVisits for recent activity too)
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        // We need to query this carefully. PageVisit doesn't join with User automatically for the distinct query.
        // But since we store role in PageVisit, we can filter by role here too.
        const activeUsersCount = await PageVisit.distinct('userId', {
            timestamp: { $gte: fiveMinsAgo },
            role: { $ne: 'admin' }
        });

        res.json({
            visitsByDate,
            popularPages,
            visitsByRole,
            activeUsers: activeUsersCount.length
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
