import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    accessToken: process.env.ACCESS_TOKEN || '',
    logsUrl: process.env.LOGS_URL || 'http://20.207.122.201/evaluation-service/logs',
    notificationsUrl: process.env.NOTIFICATIONS_URL || 'http://20.207.122.201/evaluation-service/notifications',
};
