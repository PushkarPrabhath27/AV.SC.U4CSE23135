import axios from 'axios';
import { config } from '../config';

export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'auth' | 'config' | 'middleware' | 'utils' | 'handler' | 'db';

export async function Log(
    stack: LogStack,
    level: LogLevel,
    pkg: LogPackage,
    message: string
): Promise<void> {
    if (!config.accessToken) return;
    try {
        const truncatedMessage = message.length > 48 ? message.substring(0, 48) : message;
        await axios.post(
            config.logsUrl,
            { stack, level, package: pkg, message: truncatedMessage },
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (err: any) {
        const details = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        process.stderr.write(`log dispatch failed: ${details}\n`);
    }
}
