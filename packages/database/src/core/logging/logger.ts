/**
 * 数据库日志模块
 */

export interface DatabaseLogger {
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

const noopLogger: DatabaseLogger = {
    warn: () => {},
    error: () => {}
};

let currentLogger: DatabaseLogger = noopLogger;

/**
 * 设置当前数据库日志器
 */
export function setDatabaseLogger(logger?: DatabaseLogger): void {
    currentLogger = logger ?? noopLogger;
}

/**
 * 获取当前数据库日志器
 */
export function getDatabaseLogger(): DatabaseLogger {
    return currentLogger;
}

function emitLogger(level: keyof DatabaseLogger, message: string, args: unknown[]): void {
    try {
        currentLogger[level](message, ...args);
    } catch {
        // 日志器失败不应影响主流程
    }
}

/**
 * 记录警告日志
 */
export function logDatabaseWarn(message: string, ...args: unknown[]): void {
    emitLogger('warn', message, args);
}

/**
 * 记录错误日志
 */
export function logDatabaseError(message: string, ...args: unknown[]): void {
    emitLogger('error', message, args);
}
