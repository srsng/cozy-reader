export type Disposable = {
    dispose(): void;
};

export function toDisposable(dispose: () => void): Disposable {
    return { dispose };
}

export class DisposableStore implements Disposable {
    private readonly disposables = new Set<Disposable>();
    private disposed = false;

    add<T extends Disposable>(disposable: T): T {
        if (this.disposed) {
            disposable.dispose();
            return disposable;
        }

        this.disposables.add(disposable);
        return disposable;
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;

        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables.clear();
    }
}
