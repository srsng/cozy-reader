import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export type { Disposable } from './disposable';
export { DisposableStore, toDisposable } from './disposable';

// 用于合并 Tailwind CSS 类名的工具函数
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
