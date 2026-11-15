const COLORS = {
  reset: '\x1b[0m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  success: '\x1b[32m',
  critical: '\x1b[35m',
};

const timeStamp =(): string =>new Date().toISOString();

const messageFormat =(level: keyof typeof COLORS,
                     message: string,
                     meta?: unknown
              ): string => {
    const color = COLORS[level] || COLORS.reset;
    const metaText = meta ? ` ${JSON.stringify(meta)}` : '';

    return `${color}[${timeStamp()}] [${level.toUpperCase()}] ${message}${metaText}${COLORS.reset}`;
};

// Tests would otherwise be flooded with log lines.
const silent = process.env.NODE_ENV === 'test';

/** JSON.stringify(error) is "{}", so turn errors into plain loggable data. */
export const errorInfo = (error: unknown): { message: string; stack?: string } =>
    error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };

const write = (level: keyof typeof COLORS, message: string, meta?: unknown): void => {
    if (!silent) console.log(messageFormat(level, message, meta));
};

const logger = {
    info(message: string, meta?: unknown): void {
        write('info', message, meta);
    },
    warn(message: string, meta?: unknown): void{
        write('warn', message, meta);
    },
    error(message: string, meta?: unknown): void{
        write('error', message, meta);
    },

    success(message: string, meta?: unknown): void{
        write('success', message, meta);
    },

    critical(message: string, meta?: unknown):void{
        write('critical', message, meta);
    },

}

export default logger;