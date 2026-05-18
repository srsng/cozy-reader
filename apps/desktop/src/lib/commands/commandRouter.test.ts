import { describe, expect, it, vi } from 'vitest';
import { createTestCommandContext } from '$lib/testing';
import { CommandRouter } from './commandRouter';
import { CommandService } from './commandService';

function createCommandService() {
    return new CommandService(createTestCommandContext().context);
}

describe('CommandRouter', () => {
    it('dispatches the same command id to different scopes', async () => {
        const router = new CommandRouter();
        const appService = createCommandService();
        const readerService = createCommandService();
        const appRun = vi.fn();
        const readerRun = vi.fn();

        appService.register({ id: 'shared.command', run: appRun });
        readerService.register({ id: 'shared.command', run: readerRun });
        router.registerScope('app', appService);
        router.registerScope('reader', readerService);

        expect(await router.executeInvocation({ commandId: 'shared.command' })).toBe(true);
        expect(
            await router.executeInvocation({ scope: 'reader', commandId: 'shared.command' })
        ).toBe(true);
        expect(appRun).toHaveBeenCalledOnce();
        expect(readerRun).toHaveBeenCalledOnce();
    });

    it('disables scoped invocations after their scope is disposed', async () => {
        const router = new CommandRouter();
        const readerService = createCommandService();
        readerService.register({ id: 'reader.page.next', run: vi.fn() });

        const disposable = router.registerScope('reader', readerService);
        expect(
            router.canExecuteInvocation({ scope: 'reader', commandId: 'reader.page.next' })
        ).toBe(true);

        disposable.dispose();

        expect(
            router.canExecuteInvocation({ scope: 'reader', commandId: 'reader.page.next' })
        ).toBe(false);
        expect(
            await router.executeInvocation({ scope: 'reader', commandId: 'reader.page.next' })
        ).toBe(false);
    });

    it('throws when registering duplicate scopes in development', () => {
        const router = new CommandRouter();
        router.registerScope('reader', createCommandService());

        expect(() => router.registerScope('reader', createCommandService())).toThrow(
            'Overwriting command scope: reader'
        );
    });
});
