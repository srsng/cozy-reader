const CACHE_PREFIX = 'dir-structure-';
const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes

export interface CacheItem<T> {
	data: T;
	timestamp: number;
}

export function getCachedData<T>(key: string): T | null {
	const cacheKey = CACHE_PREFIX + key;
	const cached = localStorage.getItem(cacheKey);

	if (!cached) return null;

	try {
		const item: CacheItem<T> = JSON.parse(cached);
		if (Date.now() - item.timestamp > CACHE_EXPIRY) {
			localStorage.removeItem(cacheKey);
			return null;
		}
		return item.data;
	} catch {
		return null;
	}
}

export function setCachedData<T>(key: string, data: T): void {
	const cacheKey = CACHE_PREFIX + key;
	const item: CacheItem<T> = {
		data,
		timestamp: Date.now()
	};
	localStorage.setItem(cacheKey, JSON.stringify(item));
}
