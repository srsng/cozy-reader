/**
 * 性能监控工具
 */

/**
 * 性能监控器
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, { count: number; totalTime: number; minTime: number; maxTime: number }> = new Map();

    private constructor() { }

    /**
     * 获取单例实例
     */
    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * 记录操作执行时间
     */
    record(operation: string, duration: number): void {
        const existing = this.metrics.get(operation) || {
            count: 0,
            totalTime: 0,
            minTime: Infinity,
            maxTime: 0,
        };

        existing.count++;
        existing.totalTime += duration;
        existing.minTime = Math.min(existing.minTime, duration);
        existing.maxTime = Math.max(existing.maxTime, duration);

        this.metrics.set(operation, existing);
    }

    /**
     * 获取操作的平均执行时间
     */
    getAverageTime(operation: string): number {
        const metric = this.metrics.get(operation);
        if (!metric || metric.count === 0) {
            return 0;
        }
        return metric.totalTime / metric.count;
    }

    /**
     * 获取所有指标
     */
    getMetrics(): Map<string, { count: number; totalTime: number; minTime: number; maxTime: number; avgTime: number }> {
        const result = new Map();
        for (const [operation, metric] of this.metrics) {
            result.set(operation, {
                ...metric,
                avgTime: metric.count > 0 ? metric.totalTime / metric.count : 0,
            });
        }
        return result;
    }

    /**
     * 重置所有指标
     */
    reset(): void {
        this.metrics.clear();
    }
}

/**
 * 带监控的执行函数
 */
export async function executeWithMonitoring<T>(
    operation: string,
    fn: () => Promise<T>,
    monitor?: PerformanceMonitor
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        const duration = performance.now() - start;
        monitor?.record(operation, duration);
        return result;
    } catch (error) {
        const duration = performance.now() - start;
        monitor?.record(operation, duration);
        throw error;
    }
}

