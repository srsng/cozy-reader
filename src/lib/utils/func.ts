export function isSameObjs(obj1, obj2) {
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

export function arrayToString(arr) {
  if (!Array.isArray(arr)) {
      return String(arr);
  }
  return '[' + arr.map(arrayToString).join(', ') + ']';
}

export function falttenDeepArray(arr: (any|any[])[]): any[] {
    return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(falttenDeepArray(val)) : acc.concat(val), []);
}