export const isDevelopment = import.meta.env.DEV;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
    level: LogLevel;
    prefix: string;
    timestamp: string;
    message: string;
    payload?: Record<string, unknown>;
}

export interface LoggerWriter {
    (entry: LogEntry): void;
}

export interface LoggerOptions {
    minLogRank?: LogLevel;
    writer?: LoggerWriter;
}

export type PayloadSerializer = (payload: unknown) => Record<string, unknown> | undefined;

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const DEFAULT_MINIMUM_RANK: LogLevel = isDevelopment ? "debug" : "warn";


const CONSOLE_WRITER: LoggerWriter = (logEntry: LogEntry) => {
    const header = `[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.prefix}]`;
    const method = console[logEntry.level]; // LogLevel names match console method names

    if (!method) {
        console.error(`Logger: No console method found for log level "${logEntry.level}". Falling back to console.log.`);
        console.log(header, logEntry.message, logEntry.payload);
        return;
    }

    if (logEntry.payload !== undefined) {
        method(header, logEntry.message, logEntry.payload);
    } else {
        method(header, logEntry.message);
    }
};

const DEFAULT_PAYLOAD_SERIALIZER: PayloadSerializer = (raw) => {
    if (raw === undefined || raw === null) {
        return undefined;
    }

    if (raw instanceof Error) {
        return { error: raw.message, stack: raw.stack, name: raw.name };
    }

    if (typeof raw === "object" && !Array.isArray(raw)) {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
            result[key] = value instanceof Error
                ? { message: value.message, stack: value.stack, name: value.name }
                : value;
        }

        return result;
    }

    return { value: raw };
}

const loggersCache = new Map<string, Logger>();

export class Logger {
    /** Prefix string prepended before each messsage */
    private readonly prefix: string;
    /** Writer instance, responsible for outputting log entries */
    private readonly writer: LoggerWriter;
    /** Minimum log rank for this logger */
    private readonly minLogRank: LogLevel;

    private constructor(prefix: string, options: LoggerOptions = {}) {
        this.prefix = prefix;
        this.writer = options.writer ?? CONSOLE_WRITER;
        this.minLogRank = options.minLogRank ?? DEFAULT_MINIMUM_RANK;
    }

    debug(message: string, payload?: unknown, serializer?: PayloadSerializer): void {
        this.write("debug", message, payload, serializer);
    }

    info(message: string, payload?: unknown, serializer?: PayloadSerializer): void {
        this.write("info", message, payload, serializer);
    }

    warn(message: string, payload?: unknown, serializer?: PayloadSerializer): void {
        this.write("warn", message, payload, serializer);
    }

    error(message: string, payload?: unknown, serializer?: PayloadSerializer): void {
        this.write("error", message, payload, serializer);
    }

    child(childPrefix: string): Logger {
        return Logger.getOrCreateLogger(`${this.prefix}:${childPrefix}`, {
            minLogRank: this.minLogRank,
            writer: this.writer,
        });
    }

    public static getOrCreateLogger(prefix: string, options: LoggerOptions = {}): Logger {
        const cached = loggersCache.get(prefix);

        if (cached) {
            return cached;
        }

        const logger = new Logger(prefix, options);
        loggersCache.set(prefix, logger);

        return logger;
    }

    /** Determines if a log entry at the specified level should be written */
    private shouldLogAtLevel(level: LogLevel): boolean {
        return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[this.minLogRank];
    }

    /** Main log writer procedure */
    private write(level: LogLevel, message: string, payload?: unknown, serializer: PayloadSerializer = DEFAULT_PAYLOAD_SERIALIZER): void {
        if (!this.shouldLogAtLevel(level)) {
            return;
        }

        this.writer({
            level,
            prefix: this.prefix,
            timestamp: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            message,
            payload: serializer(payload),
        });
    }
}