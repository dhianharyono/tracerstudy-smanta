import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';

// Definition for AuthenticatedRequest
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
        badges: any[];
    };
}

const router = express.Router();

router.use(authenticate);

// GET / - Get Events
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user!;
        let query = {};

        // If student, only show active events
        if (user.role === 'student') {
            query = { isActive: true };
        }

        const events = await Event.find(query).populate('badgeId').sort({ date: 1 });

        // Enhance events with registration status for the current user if student
        if (user.role === 'student') {
            const registrations = await EventRegistration.find({ userId: user._id });
            const registeredEventIds = registrations.map(r => r.eventId.toString());

            const eventsWithStatus = events.map(event => ({
                ...event.toObject(),
                isRegistered: registeredEventIds.includes(event._id.toString())
            }));
            return res.json(eventsWithStatus);
        }

        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST / - Create Event (Admin Only)
router.post('/', authorize('admin'), async (req: Request, res: Response) => {
    try {
        const { name, description, date, badgeId } = req.body;

        const event = new Event({
            name,
            description,
            date,
            badgeId: badgeId || null
        });

        await event.save();
        res.status(201).json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /:id - Update Event (Admin Only)
router.put('/:id', authorize('admin'), async (req: Request, res: Response) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /:id - Delete Event (Admin Only)
router.delete('/:id', authorize('admin'), async (req: Request, res: Response) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST /:id/register - Register to Event (Student Only)
router.post('/:id/register', authorize('student'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const eventId = req.params.id;
        const userId = req.user!._id;
        const { expectation, studyPlan } = req.body;

        // Check if event exists and is active
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (!event.isActive) return res.status(400).json({ message: 'Event is not active' });

        // Check already registered
        const existingReg = await EventRegistration.findOne({ eventId, userId });
        if (existingReg) return res.status(400).json({ message: 'Already registered' });

        const registration = new EventRegistration({
            eventId,
            userId,
            expectation,
            studyPlan
        });

        await registration.save();
        res.status(201).json(registration);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET /:id/registrations - Get registrations (Admin or Alumni with Badge)
router.get('/:id/registrations', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const eventId = req.params.id;
        const user = req.user!;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        let hasAccess = false;
        if (user.role === 'admin') {
            hasAccess = true;
        } else if (user.role === 'alumni') {
            // Check badge
            if (event.badgeId && user.badges.includes(event.badgeId.toString())) {
                hasAccess = true;
            } else {
                // Fetch user again to be sure about badges if they are not populated in req.user
                // (Assuming req.user might be a light object). 
                // However, middleware typically attaches user. Let's assume badges are IDs string array in req.user from token or db lookup.
                // For now, if badge restriction is strict, we might need to populate badges or check User model.
                // Let's rely on req.user having badges array of IDs.
            }
        }

        if (!hasAccess) {
            // For alumni without badge, we might want to return 403.
            if (user.role === 'alumni') return res.status(403).json({ message: 'Access denied. Missing required badge.' });
            // Students shouldn't see this at all usually, but strict check:
            return res.status(403).json({ message: 'Access denied' });
        }

        const registrations = await EventRegistration.find({ eventId })
            .populate('userId', 'profile.fullName university.name university.major') // adapt fields as needed
            .sort({ createdAt: -1 });

        res.json(registrations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /registrations/:id - Delete Registration (Admin Only)
router.delete('/registrations/:id', authorize('admin'), async (req: Request, res: Response) => {
    try {
        const registration = await EventRegistration.findByIdAndDelete(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        res.json({ message: 'Registration deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
