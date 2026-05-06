import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const LOGS_URL = process.env.LOGS_URL || 'http://20.207.122.201/evaluation-service/logs';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'auth' | 'config' | 'middleware' | 'utils' | 'handler' | 'db';

export async function Log(
    stack: LogStack,
    level: LogLevel,
    pkg: LogPackage,
    message: string
): Promise<void> {
    if (!ACCESS_TOKEN) {
        return;
    }
    try {
        await axios.post(
            LOGS_URL,
            { stack, level, package: pkg, message },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (err: any) {
        process.stderr.write(`log dispatch failed: ${err.message}\n`);
    }
}
