import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Mock telemetry storage (in production, this would be a real database)
const telemetryEvents: any[] = [];

// Submit telemetry event
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, payload, timestamp, sessionId } = req.body;
    const userId = (req as any).user?.userId;
    const familyId = (req as any).user?.familyId;
    
    if (!userId || !familyId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Event name is required',
      });
    }

    // Create telemetry event
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      payload: payload || {},
      timestamp: timestamp || new Date().toISOString(),
      sessionId: sessionId || `session-${Date.now()}`,
      userId,
      familyId,
      receivedAt: new Date().toISOString(),
    };

    // Store event (in production, this would be saved to database)
    telemetryEvents.push(event);

    // Log event for debugging
    console.log('📊 Telemetry event received:', {
      id: event.id,
      name: event.name,
      userId: event.userId,
      familyId: event.familyId,
      timestamp: event.timestamp,
    });

    res.json({
      success: true,
      eventId: event.id,
      message: 'Telemetry event recorded',
    });
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get telemetry events for user's family (admin only)
router.get('/', authMiddleware, (req, res) => {
  try {
    const familyId = (req as any).user?.familyId;
    const role = (req as any).user?.role;
    
    if (!familyId) {
      return res.status(401).json({
        error: 'Family ID not found in token',
      });
    }

    // Only family members can view telemetry
    if (role !== 'family') {
      return res.status(403).json({
        error: 'Access denied. Family role required.',
      });
    }

    // Filter events by family ID
    const familyEvents = telemetryEvents.filter(event => event.familyId === familyId);
    
    res.json({
      success: true,
      events: familyEvents,
      count: familyEvents.length,
    });
  } catch (error) {
    console.error('Get telemetry error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get telemetry statistics
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const familyId = (req as any).user?.familyId;
    const role = (req as any).user?.role;
    
    if (!familyId) {
      return res.status(401).json({
        error: 'Family ID not found in token',
      });
    }

    // Only family members can view statistics
    if (role !== 'family') {
      return res.status(403).json({
        error: 'Access denied. Family role required.',
      });
    }

    // Filter events by family ID
    const familyEvents = telemetryEvents.filter(event => event.familyId === familyId);
    
    // Calculate statistics
    const stats = {
      totalEvents: familyEvents.length,
      eventsByType: familyEvents.reduce((acc, event) => {
        acc[event.name] = (acc[event.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastEvent: familyEvents.length > 0 ? familyEvents[familyEvents.length - 1].timestamp : null,
      firstEvent: familyEvents.length > 0 ? familyEvents[0].timestamp : null,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get telemetry stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export { router as telemetryRoutes };
