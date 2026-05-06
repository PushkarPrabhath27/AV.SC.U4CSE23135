import { Request, Response } from 'express';
import { fetchAllNotifications, fetchPriorityNotifications } from '../utils/priorityInbox';
import { Log } from '../middleware/logger';

export async function getNotifications(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string | undefined;

    try {
        const data = await fetchAllNotifications(page, limit, type);
        res.json(data);
    } catch (err: any) {
        await Log('backend', 'error', 'handler', `GET /api/notifications unhandled: ${err.message}`);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
}

export async function getPriorityNotifications(req: Request, res: Response) {
    const topN = parseInt(req.query.limit as string) || 10;

    try {
        const data = await fetchPriorityNotifications(topN);
        res.json({ notifications: data });
    } catch (err: any) {
        await Log('backend', 'error', 'handler', `GET /api/notifications/priority unhandled: ${err.message}`);
        res.status(500).json({ error: 'Failed to compute priority inbox' });
    }
}
