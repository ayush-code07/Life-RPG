import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatLog(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(formatLog('info', msg, meta));
  },
  warn: (msg: string, meta?: any) => {
    console.warn(formatLog('warn', msg, meta));
  },
  error: (msg: string, meta?: any) => {
    console.error(formatLog('error', msg, meta));
  },
  debug: (msg: string, meta?: any) => {
    if (env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', msg, meta));
    }
  },
};
