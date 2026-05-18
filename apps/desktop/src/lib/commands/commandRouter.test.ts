import { describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
import { ContextKeyService } from '$lib/context-keys';
import { DEFAULT_APP_STATE } from '$lib/state/app-state';
import { LogLevel } from '$lib/types';
import type { UserSettings } from '$lib/settings';
import type { CommandContext } from './types';
import { CommandRouter } from './commandRouter';
import { CommandService } from './commandService';

function createSettings(): UserSettings {
    return {
        base: {
            langCode: 'zh-cn',
            logLevel: LogLevel.info,
            zoom: 1,
            alwaysOnTop: false,
            uiOpacity: 0.88,
            bodyTransparent: 1,
            layoutControlsOutline: true
        },
        layout: {
            titlebar: true,
            header: true,
            footer: true,
            layoutConfigs: {
                titlebar: { left: [], center: [], right: [] },
                footbar: { left: [], center: [], right: [] },
                sidebar: { left: [], center: [], right: [] }
            }
        },
        theme: {
            mode: 'system',
            type: 'standard',
            data: {
                standard: { name: 'black' },
                four_colors: { hue: 36 },
                pony: { name: 'sg' }
            },
            effects: 'none'
        },
        reader: {
            fontFamily: '',
            viewerWidth: 60,
            fontSize: 20,
            lineHeight: 180,
            firstLineIndent: false,
            zoomLongPic: false,
            scrollBarVisable: false
        },
        background: {} as UserSettings['background'],
        keybindings: { rules: [] }
    };
}

function createCommandService() {
    const context: CommandContext = {
        appState: writable(DEFAULT_APP_STATE),
        contextKeys: new ContextKeyService(),
        navigation: {
            back: vi.fn(),
            backgroundSettings: vi.fn(),
            canGoBack: vi.fn(() => true),
            home: vi.fn(),
            settings: vi.fn()
        },
        theme: { setEffect: vi.fn() },
        userSettings: writable(createSettings()),
        window: {
            close: vi.fn(),
            maximize: vi.fn(),
            minimize: vi.fn(),
            refresh: vi.fn(),
            requestUserAttention: vi.fn(),
            restoreState: vi.fn(),
            saveState: vi.fn(),
            setAlwaysOnTop: vi.fn(),
            toggleDevtools: vi.fn(),
            toggleFullscreen: vi.fn()
        }
    };

    return new CommandService(context);
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
