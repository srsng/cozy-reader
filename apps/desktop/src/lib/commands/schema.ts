import type { StandardSchemaV1 } from '@standard-schema/spec';

export class CommandSchemaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CommandSchemaError';
    }
}

export type SchemaValidationResult<Output> =
    | {
          ok: true;
          value: Output;
      }
    | {
          ok: false;
          error: CommandSchemaError;
      };

export function validateStandardSchemaSync<Output>(
    schema: StandardSchemaV1<unknown, Output>,
    value: unknown,
    label: string
): SchemaValidationResult<Output> {
    const result = schema['~standard'].validate(value);

    if (isPromiseLike(result)) {
        throw new CommandSchemaError(
            `${label} schema returned a Promise; command schemas must be synchronous`
        );
    }

    if (result.issues) {
        return {
            ok: false,
            error: new CommandSchemaError(
                `${label} validation failed: ${formatSchemaIssues(result.issues)}`
            )
        };
    }

    return {
        ok: true,
        value: result.value
    };
}

export function formatSchemaIssues(issues: ReadonlyArray<StandardSchemaV1.Issue>): string {
    return issues.map(formatSchemaIssue).join('; ');
}

function formatSchemaIssue(issue: StandardSchemaV1.Issue): string {
    const path = formatIssuePath(issue.path);
    if (!path) return issue.message;
    return `${path}: ${issue.message}`;
}

function formatIssuePath(
    path: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment> | undefined
): string {
    if (!path?.length) return '';

    return path
        .map((segment) => {
            const key = typeof segment === 'object' && segment !== null ? segment.key : segment;
            return typeof key === 'number' ? `[${key}]` : String(key);
        })
        .join('.');
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
    return Boolean(
        value &&
            (typeof value === 'object' || typeof value === 'function') &&
            'then' in value &&
            typeof (value as { then: unknown }).then === 'function'
    );
}
