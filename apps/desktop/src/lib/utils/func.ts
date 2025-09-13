export function isSameObjs(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
	if (Object.keys(obj1).length !== Object.keys(obj2).length) {
		return false;
	}
	for (const key in obj1) {
		if (obj1[key] !== obj2[key]) {
			return false;
		}
	}
	return true;
}

export function arrayToString(arr: any): string {
	if (!Array.isArray(arr)) {
		return String(arr);
	}
	return '[' + arr.map(arrayToString).join(', ') + ']';
}

export function falttenDeepArray(arr: (any | any[])[]): any[] {
	return arr.reduce(
		(acc, val) => (Array.isArray(val) ? acc.concat(falttenDeepArray(val)) : acc.concat(val)),
		[]
	);
}

// 颜色工具函数
export function hexToRgba(hex: string, alpha: number = 1): string {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return `rgba(0, 0, 0, ${alpha})`;

	const r = parseInt(result[1], 16);
	const g = parseInt(result[2], 16);
	const b = parseInt(result[3], 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
