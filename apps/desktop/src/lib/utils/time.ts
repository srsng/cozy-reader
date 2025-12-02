/**
 * 时间工具函数
 */

/**
 * 时间戳转 ISO 字符串
 */
export function timestampToISOString(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString();
}

/**
 * ISO 字符串转时间戳
 */
export function isoStringToTimestamp(isoString: string): number {
    return Math.floor(new Date(isoString).getTime() / 1000);
}

/**
 * 获取当前时间戳（秒）
 */
export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * 格式化阅读时间（分钟）
 * 
 * 返回包含 day、hour、min 字段的对象
 */
export function formatReadingTime(minutes: number): { day: number; hour: number; min: number } {
    const totalMinutes = Math.round(minutes);
    const days = Math.floor(totalMinutes / 1440); // 1440 分钟 = 1 天
    const remainingAfterDays = totalMinutes % 1440;
    const hours = Math.floor(remainingAfterDays / 60);
    const mins = remainingAfterDays % 60;

    return {
        day: days,
        hour: hours,
        min: mins
    };
}

/**
 * 时间字段转换器
 * 用于在数据库时间戳和 JavaScript Date 对象之间转换
 */
export class TimeFieldConverter {
    /**
     * 将数据库时间戳转换为 Date 对象
     */
    static toDate(timestamp: number | null | undefined): Date | null {
        if (timestamp === null || timestamp === undefined) {
            return null;
        }
        return new Date(timestamp * 1000);
    }

    /**
     * 将 Date 对象转换为数据库时间戳
     */
    static toTimestamp(date: Date | null | undefined): number | null {
        if (date === null || date === undefined) {
            return null;
        }
        return Math.floor(date.getTime() / 1000);
    }

    /**
     * 将数据库时间戳数组转换为 Date 对象数组
     */
    static toDateArray(timestamps: (number | null | undefined)[]): (Date | null)[] {
        return timestamps.map(ts => this.toDate(ts));
    }

    /**
     * 将 Date 对象数组转换为数据库时间戳数组
     */
    static toTimestampArray(dates: (Date | null | undefined)[]): (number | null)[] {
        return dates.map(date => this.toTimestamp(date));
    }
}

