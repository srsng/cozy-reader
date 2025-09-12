export enum LogLevel {
	trace = 1,
	debug = 2,
	info = 3,
	warn = 4,
	error = 5
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
