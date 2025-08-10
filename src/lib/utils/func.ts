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
