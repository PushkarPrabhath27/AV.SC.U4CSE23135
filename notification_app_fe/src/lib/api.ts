import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface Notification {
    ID: string;
    Type: NotificationType;
    Message: string;
    Timestamp: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
}

export async function fetchNotifications(
    page: number,
    limit: number,
    type?: string
): Promise<NotificationsResponse> {
    const params: Record<string, string | number> = { page, limit };
    if (type && type !== 'All') params.type = type;
    const res = await axios.get(`${API_BASE}/api/notifications`, { params });
    return res.data;
}

export async function fetchPriorityNotifications(limit: number): Promise<NotificationsResponse> {
    const res = await axios.get(`${API_BASE}/api/notifications/priority`, {
        params: { limit },
    });
    return res.data;
}
