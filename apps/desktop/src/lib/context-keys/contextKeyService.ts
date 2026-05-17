import { InjectionToken } from '$lib/utils/context';
import type {
    ContextKeyExpression,
    ContextKeyInspection,
    ContextKeySnapshot,
    ContextKeyValue
} from './types';
import { evaluateContextKeyExpression, inspectContextKeyExpression } from './contextKeyExpression';

export const CONTEXT_KEY_SERVICE = new InjectionToken<ContextKeyService>('ContextKeyService');

type Listener = (snapshot: ContextKeySnapshot) => void;

export class ContextKeyService {
    private readonly values = new Map<string, ContextKeyValue>();
    private readonly listeners = new Set<Listener>();

    constructor(initialValues: ContextKeySnapshot = {}) {
        Object.entries(initialValues).forEach(([key, value]) => {
            this.values.set(key, value);
        });
    }

    set(key: string, value: ContextKeyValue): void {
        if (this.values.get(key) === value) return;
        this.values.set(key, value);
        this.emitChange();
    }

    get(key: string): ContextKeyValue {
        return this.values.get(key);
    }

    getSnapshot(): ContextKeySnapshot {
        return Object.fromEntries(this.values.entries());
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

    private emitChange(): void {
        const snapshot = this.getSnapshot();
        this.listeners.forEach((listener) => listener(snapshot));
    }
}
