/**
 * 防抖函数
 * 在指定延迟后执行函数，如果在延迟期间再次调用则重新计时
 */

interface DebounceOptions {
    emitLast?: boolean;
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param options 选项
 * @returns 防抖后的函数，包含 flush 和 cancel 方法
 */
export function debounce<T extends (...args: Parameters<T>) => void | Promise<void>>(
    func: T,
    delay: number,
    options: DebounceOptions = { emitLast: true }
): ((...args: Parameters<T>) => void) & { flush: () => void; cancel: () => void } {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = (...args: Parameters<T>): void => {
        lastArgs = args;
        if (timeout) {
            clearTimeout(timeout);
        }

        if (options.emitLast) {
            timeout = setTimeout(() => {
                if (lastArgs) {
                    func(...(lastArgs as Parameters<T>));
                    lastArgs = null;
                }
                timeout = null;
            }, delay);
        } else {
            timeout = setTimeout(() => {
                func(...args);
                timeout = null;
            }, delay);
        }
    };

    /**
     * 立即执行最后一次待执行的防抖函数调用
     */
    debounced.flush = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            if (lastArgs) {
                func(...(lastArgs as Parameters<T>));
                lastArgs = null;
            }
        }
    };

    /**
     * 取消待执行的防抖函数调用
     */
    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            lastArgs = null;
        }
    };

    return debounced;
}

