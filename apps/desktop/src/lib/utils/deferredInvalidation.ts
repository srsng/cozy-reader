export type DeferredInvalidation = {
    schedule: () => void;
    dispose: () => void;
};

export function createDeferredInvalidation(callback: () => void): DeferredInvalidation {
    let disposed = false;
    let queued = false;

    const schedule = () => {
        if (disposed || queued) return;
        queued = true;

        queueMicrotask(() => {
            queued = false;
            if (!disposed) {
                callback();
            }
        });
    };

    const dispose = () => {
        disposed = true;
    };

    return {
        schedule,
        dispose
    };
}
