import axios from 'axios';
import { config } from '../config';
import { Log } from '../middleware/logger';

export interface Notification {
    ID: string;
    Type: 'Placement' | 'Result' | 'Event';
    Message: string;
    Timestamp: string;
}

export interface ScoredNotification extends Notification {
    priorityScore: number;
}

const TYPE_WEIGHTS: Record<string, number> = {
    Placement: 3,
    Result: 2,
    Event: 1,
};

function buildHeaders() {
    return { Authorization: `Bearer ${config.accessToken}` };
}

export async function fetchAllNotifications(
    page = 1,
    limit = 10,
    type?: string
): Promise<{ notifications: Notification[] }> {
    try {
        const params: Record<string, string | number> = { page, limit };
        if (type) params.notification_type = type;

        const res = await axios.get(config.notificationsUrl, {
            headers: buildHeaders(),
            params,
        });

        await Log('backend', 'info', 'handler', `fetched ${res.data.notifications?.length ?? 0} notifications page=${page}`);
        return res.data;
    } catch (err: any) {
        const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        await Log('backend', 'error', 'handler', `notification fetch failed: ${msg}`);
        process.stderr.write(`notification fetch failed: ${msg}\n`);
        throw err;
    }
}

export async function fetchPriorityNotifications(topN: number): Promise<ScoredNotification[]> {
    try {
        const res = await axios.get(config.notificationsUrl, {
            headers: buildHeaders(),
            params: { limit: 10 }
        });

        const notifications: Notification[] = res.data.notifications ?? [];

        const scored: ScoredNotification[] = notifications.map((n) => ({
            ...n,
            priorityScore:
                (TYPE_WEIGHTS[n.Type] ?? 0) * 1_000_000_000_000 +
                new Date(n.Timestamp).getTime(),
        }));

        scored.sort((a, b) => b.priorityScore - a.priorityScore);

        const result = scored.slice(0, topN);

        await Log('backend', 'info', 'utils', `priority inbox computed topN=${topN} returned=${result.length}`);
        return result;
    } catch (err: any) {
        const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        await Log('backend', 'error', 'utils', `priority inbox failed: ${msg}`);
        process.stderr.write(`priority inbox fetch failed: ${msg}\n`);
        throw err;
    }
}
