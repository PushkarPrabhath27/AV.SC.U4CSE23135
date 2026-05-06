import express from 'express';
import cors from 'cors';
import { config } from './config';
import { Log } from './middleware/logger';
import { getNotifications, getPriorityNotifications } from './handler/notificationHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/notifications', getNotifications);
app.get('/api/notifications/priority', getPriorityNotifications);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(config.port, async () => {
    await Log('backend', 'info', 'config', `server started on port ${config.port}`);
});
