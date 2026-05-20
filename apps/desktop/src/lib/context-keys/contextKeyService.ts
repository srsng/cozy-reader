import { InjectionToken } from '$lib/utils/context';
import type {
    ContextKeyExpression,
    ContextKeyInspection,
    ContextKeyProjection,
    ContextKeySnapshot,
    ContextKeyValue
} from './types';
import { evaluateContextKeyExpression, inspectContextKeyExpression } from './contextKeyExpression';
import { toDisposable, type Disposable } from '$lib/utils/disposable';

export const CONTEXT_KEY_SERVICE = new InjectionToken<ContextKeyService>('ContextKeyService');

type Listener = (snapshot: ContextKeySnapshot) => void;

type ProjectionRegistration = {
    projection: ContextKeyProjection;
    dispose?: () => void;
};

export class ContextKeyService {
    private readonly values = new Map<string, ContextKeyValue>();
    private readonly listeners = new Set<Listener>();
    private readonly projections = new Map<string, ProjectionRegistration>();

    constructor(initialValues: ContextKeySnapshot = {}) {
        Object.entries(initialValues).forEach(([key, value]) => {
            this.values.set(key, value);
        });
    }

    set(key: string, value: ContextKeyValue): void {
        const projectionOwner = this.findProjectionOwnerForKey(key);
        if (projectionOwner) {
            throw new Error(
                `Cannot set projected context key "${key}" manually; owned by projection "${projectionOwner}"`
            );
        }

        if (this.values.get(key) === value) return;
        this.values.set(key, value);
        this.emitChange();
    }

    get(key: string): ContextKeyValue {
        return this.getSnapshot()[key];
    }

    getSnapshot(): ContextKeySnapshot {
        const snapshot = Object.fromEntries(this.values.entries());
        const owners = new Map(Object.keys(snapshot).map((key) => [key, 'manual']));

        for (const [projectionId, registration] of this.projections) {
            const projectionSnapshot = registration.projection.getSnapshot();

            for (const [key, value] of Object.entries(projectionSnapshot)) {
                const owner = owners.get(key);
                if (owner) {
                    throw new Error(
                        `Duplicate context key "${key}" from ${owner} and projection "${projectionId}"`
                    );
                }

                owners.set(key, `projection "${projectionId}"`);
                snapshot[key] = value;
            }
        }

        return snapshot;
    }

    match(expression: ContextKeyExpression): boolean {
        if (!expression || expression.trim() === '') return true;
        return evaluateContextKeyExpression(expression, this.getSnapshot());
    }

    inspect(expression: ContextKeyExpression): ContextKeyInspection {
        return inspectContextKeyExpression(expression, this.getSnapshot());
    }

    onDidChange(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    registerProjection(projection: ContextKeyProjection): Disposable {
        if (this.projections.has(projection.id)) {
            throw new Error(`Overwriting context key projection: ${projection.id}`);
        }

        const registration: ProjectionRegistration = { projection };
        this.projections.set(projection.id, registration);

        try {
            this.assertNoDuplicateKeys();
            registration.dispose = this.toDisposeFunction(
                projection.subscribe?.(() => this.emitChange())
            );
            this.emitChange();
        } catch (error) {
            registration.dispose?.();
            this.projections.delete(projection.id);
            throw error;
        }

        return toDisposable(() => {
            const registration = this.projections.get(projection.id);
            if (registration?.projection !== projection) return;

            registration.dispose?.();
            this.projections.delete(projection.id);
            this.emitChange();
        });
    }

    private emitChange(): void {
        const snapshot = this.getSnapshot();
        this.listeners.forEach((listener) => listener(snapshot));
    }

    private assertNoDuplicateKeys(): void {
        this.getSnapshot();
    }

    private findProjectionOwnerForKey(key: string): string | undefined {
        for (const [projectionId, registration] of this.projections) {
            if (Object.prototype.hasOwnProperty.call(registration.projection.getSnapshot(), key)) {
                return projectionId;
            }
        }

        return undefined;
    }

    private toDisposeFunction(
        disposable: ReturnType<NonNullable<ContextKeyProjection['subscribe']>> | undefined
    ): (() => void) | undefined {
        if (!disposable) return undefined;
        if (typeof disposable === 'function') return disposable;
        return () => disposable.dispose();
    }
}
