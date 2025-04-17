import fs from 'fs';
import path from 'path';
import { Request } from 'express';

// Define log levels for different types of auth events
export enum AuthLogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface AuthLogEntry {
  timestamp: string;
  level: AuthLogLevel;
  event: string;
  details: {
    ip?: string;
    userId?: string;
    path?: string;
    [key: string]: any;
  };
}

export const logAuthEvent = (
  level: AuthLogLevel,
  event: string,
  req?: Request,
  details?: object
) => {
  const logEntry: AuthLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    details: {
      ip: req?.ip,
      path: req?.path,
      ...details
    }
  };

  const logPath = path.join(process.env.LOG_PATH || 'logs', 'auth.log');
  const logMessage = `${JSON.stringify(logEntry)}\n`;

  fs.appendFile(logPath, logMessage, (err) => {
    if (err) console.error('Failed to write auth log:', err);
  });
}; 