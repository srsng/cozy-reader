import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 用于合并 Tailwind CSS 类名的工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}