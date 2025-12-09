/**
 * 生成唯一 ID
 * @returns 唯一的字符串 ID
 */
export const uniqueId = (): string => Math.random().toString(36).substring(2, 9);
