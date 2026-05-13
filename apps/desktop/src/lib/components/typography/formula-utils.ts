const ALIGN_ENVIRONMENT_PATTERN =
    /^\\begin\{(align\*?|aligned\*?|flalign\*?)\}([\s\S]*?)\\end\{\1\}$/;

function removeTopLevelAlignmentMarkers(value: string): string {
    let result = '';
    let environmentDepth = 0;

    for (let index = 0; index < value.length; index += 1) {
        const remaining = value.slice(index);

        if (remaining.startsWith('\\begin{')) {
            environmentDepth += 1;
            const match = remaining.match(/^\\begin\{[^}]+\}/);
            const raw = match?.[0] ?? '\\begin{';

            result += raw;
            index += raw.length - 1;
            continue;
        }

        if (remaining.startsWith('\\end{')) {
            environmentDepth = Math.max(0, environmentDepth - 1);
            const match = remaining.match(/^\\end\{[^}]+\}/);
            const raw = match?.[0] ?? '\\end{';

            result += raw;
            index += raw.length - 1;
            continue;
        }

        const character = value[index];

        if (character === '&' && index > 0 && value[index - 1] !== '\\' && environmentDepth === 0) {
            continue;
        }

        result += character;
    }

    return result;
}

export function normalizeRatexLatex(value: string): string {
    const trimmed = value.trim();
    const alignEnvironmentMatch = trimmed.match(ALIGN_ENVIRONMENT_PATTERN);

    if (!alignEnvironmentMatch) {
        return trimmed;
    }

    const body = alignEnvironmentMatch[2].trim();

    return `\\begin{gather*}\n${removeTopLevelAlignmentMarkers(body)}\n\\end{gather*}`;
}
