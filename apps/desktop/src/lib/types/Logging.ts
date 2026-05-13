export enum LogLevel {
    trace = 10,
    debug = 20,
    info = 30,
    warn = 40,
    error = 50
}

export const logLevels = [
    LogLevel.trace,
    LogLevel.debug,
    LogLevel.info,
    LogLevel.warn,
    LogLevel.error
];
export const str2LogLevelsMap = {
    trace: LogLevel.trace,
    debug: LogLevel.debug,
    info: LogLevel.info,
    warn: LogLevel.warn,
    error: LogLevel.error
};

export const logLevels2StrMap = {
    [LogLevel.trace]: 'trace',
    [LogLevel.debug]: 'debug',
    [LogLevel.info]: 'info',
    [LogLevel.warn]: 'warn',
    [LogLevel.error]: 'error'
};
