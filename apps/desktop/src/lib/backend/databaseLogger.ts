import type { DatabaseLogger } from '@cozy-reader/database';

const prefix = '[cozy-reader/database]';

export const databaseLogger: DatabaseLogger = {
    warn(message: string, ...args: unknown[]): void {
        console.warn(prefix, message, ...args);
    },
    error(message: string, ...args: unknown[]): void {
        console.error(prefix, message, ...args);
    }
};
