const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;
const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function isWindowsAbsolutePath(path: string): boolean {
    return WINDOWS_ABSOLUTE_PATH_PATTERN.test(path);
}

function isUrlLikeSource(src: string): boolean {
    return !isWindowsAbsolutePath(src) && (URL_SCHEME_PATTERN.test(src) || src.startsWith('//'));
}

function isAbsoluteLocalPath(path: string): boolean {
    return isWindowsAbsolutePath(path) || path.startsWith('/') || path.startsWith('\\');
}

function getPreferredSeparator(...paths: string[]): '/' | '\\' {
    return paths.some((path) => isWindowsAbsolutePath(path) || path.includes('\\')) ? '\\' : '/';
}

function normalizeSeparators(path: string, separator: '/' | '\\'): string {
    if (separator === '\\' && path.startsWith('\\\\')) {
        return `\\\\${path.slice(2).replace(/[\\/]+/g, '\\')}`;
    }

    return path.replace(/[\\/]+/g, separator);
}

function splitPathPrefix(path: string, separator: '/' | '\\') {
    if (separator === '\\') {
        const driveMatch = path.match(/^([a-zA-Z]:)(?:\\|$)/);

        if (driveMatch) {
            const prefix = `${driveMatch[1]}\\`;
            return { prefix, rest: path.slice(prefix.length) };
        }

        if (path.startsWith('\\\\')) {
            const parts = path.slice(2).split('\\');
            const [server, share, ...restParts] = parts;

            if (server && share) {
                return {
                    prefix: `\\\\${server}\\${share}\\`,
                    rest: restParts.join('\\')
                };
            }

            return { prefix: '\\\\', rest: parts.join('\\') };
        }
    }

    if (path.startsWith(separator)) {
        return { prefix: separator, rest: path.slice(1) };
    }

    return { prefix: '', rest: path };
}

function normalizeLocalPath(path: string, separator = getPreferredSeparator(path)): string {
    const normalizedPath = normalizeSeparators(path, separator);
    const { prefix, rest } = splitPathPrefix(normalizedPath, separator);
    const segments: string[] = [];

    for (const segment of rest.split(separator)) {
        if (!segment || segment === '.') {
            continue;
        }

        if (segment === '..') {
            if (segments.length > 0 && segments[segments.length - 1] !== '..') {
                segments.pop();
            } else if (!prefix) {
                segments.push(segment);
            }
            continue;
        }

        segments.push(segment);
    }

    const joined = segments.join(separator);

    if (prefix) {
        return joined ? `${prefix}${joined}` : prefix;
    }

    return joined || '.';
}

function getDirectoryPath(path: string, separator: '/' | '\\'): string {
    const normalizedPath = normalizeLocalPath(path, separator);
    const withoutTrailingSeparator =
        normalizedPath.length > 1 && normalizedPath.endsWith(separator)
            ? normalizedPath.slice(0, -1)
            : normalizedPath;
    const separatorIndex = withoutTrailingSeparator.lastIndexOf(separator);

    if (separatorIndex < 0) {
        return '';
    }

    if (separatorIndex === 0) {
        return separator;
    }

    return withoutTrailingSeparator.slice(0, separatorIndex);
}

export function shouldUseTauriAssetProtocol(src: string): boolean {
    const trimmedSrc = src.trim();

    return Boolean(trimmedSrc) && !isUrlLikeSource(trimmedSrc);
}

export function resolveMarkdownImageSource(href: string, mdSrcPath: string): string {
    const src = href.trim();

    if (!shouldUseTauriAssetProtocol(src)) {
        return src;
    }

    if (isAbsoluteLocalPath(src)) {
        return normalizeLocalPath(src);
    }

    if (!mdSrcPath.trim()) {
        return normalizeLocalPath(src);
    }

    const separator = getPreferredSeparator(mdSrcPath, src);
    const markdownDirectoryPath = getDirectoryPath(mdSrcPath.trim(), separator);
    const joinedPath = markdownDirectoryPath
        ? `${markdownDirectoryPath}${separator}${src}`
        : src;

    return normalizeLocalPath(joinedPath, separator);
}
