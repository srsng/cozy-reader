/**
 * 数据库时间工具函数
 * 用于处理数据库中的时间戳和日期字符串之间的转换
 */

/**
 * 格式化阅读时间
 * @param minutes 阅读时间（分钟）
 * @returns 格式化后的时间字符串
 */
export function formatReadingTime(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} 分钟`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
        return remainingMinutes > 0
            ? `${hours} 小时 ${remainingMinutes} 分钟`
            : `${hours} 小时`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return remainingHours > 0 ? `${days} 天 ${remainingHours} 小时` : `${days} 天`;
}

/**
 * 将 Unix 时间戳（秒）转换为 ISO 8601 字符串
 * @param timestamp Unix 时间戳（秒）
 * @returns ISO 8601 日期字符串
 */
export function timestampToISOString(timestamp: number | null | undefined): string | null {
    if (timestamp === null || timestamp === undefined) {
        return null;
    }
    return new Date(timestamp * 1000).toISOString();
}

/**
 * 将 ISO 8601 字符串转换为 Unix 时间戳（秒）
 * @param isoString ISO 8601 日期字符串
 * @returns Unix 时间戳（秒）
 */
export function isoStringToTimestamp(isoString: string | null | undefined): number | null {
    if (!isoString) {
        return null;
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return null;
    }
    return Math.floor(date.getTime() / 1000);
}

/**
 * 获取当前 Unix 时间戳（秒）
 * @returns Unix 时间戳（秒）
 */
export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * 数据库时间字段转换工具
 * 用于在查询结果中将时间戳转换为日期字符串，或在插入/更新时将日期字符串转换为时间戳
 */
export class TimeFieldConverter {
    /**
     * 转换查询结果中的时间字段（时间戳 -> ISO 字符串）
     * @param data 查询结果对象
     * @param timeFields 时间字段名称数组
     * @returns 转换后的对象
     */
    static convertFromDatabase<T extends Record<string, any>>(
        data: T,
        timeFields: string[] = ['created_at', 'updated_at', 'added_at', 'last_read_at', 'start_time', 'end_time']
    ): T {
        const converted = { ...data } as any;
        for (const field of timeFields) {
            if (field in converted && typeof converted[field] === 'number') {
                converted[field] = timestampToISOString(converted[field]);
            }
        }
        return converted as T;
    }

    /**
     * 转换插入/更新数据中的时间字段（ISO 字符串 -> 时间戳）
     * @param data 要插入/更新的数据对象
     * @param timeFields 时间字段名称数组
     * @returns 转换后的对象
     */
    static convertToDatabase<T extends Record<string, any>>(
        data: T,
        timeFields: string[] = ['created_at', 'updated_at', 'added_at', 'last_read_at', 'start_time', 'end_time']
    ): T {
        const converted = { ...data } as any;
        for (const field of timeFields) {
            if (field in converted && typeof converted[field] === 'string') {
                const timestamp = isoStringToTimestamp(converted[field]);
                if (timestamp !== null) {
                    converted[field] = timestamp;
                }
            }
        }
        return converted as T;
    }
}

