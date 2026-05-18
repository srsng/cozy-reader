import { describe, expect, it, vi } from 'vitest';
import { ContextKey } from '$lib/context-keys';
import { MenuId } from '$lib/menus';
import { registerDefaultActions } from '$lib/actions';
import { createAppCommandHarness, createTestCommandContext, getStoreValue } from '$lib/testing';
import { CommandService } from './commandService';
import { registerDefaultCommands } from './defaultCommands';

function createContext() {
    return createTestCommandContext();
}

function createActionHarness() {
    const harness = createAppCommandHarness({ registerCommandExecutor: false });
    registerDefaultActions({
        commandService: harness.commandService,
        menuService: harness.menuService,
        keybindingManager: harness.keybindingManager
    });
    return harness;
}

describe('default commands', () => {
    it('executes zoom commands through the command service', async () => {
        const { commandService, userSettings } = createActionHarness();

        await commandService.execute('zoom.in');

        expect(getStoreValue(userSettings).base.zoom).toBe(1.0625);
    });

    it('disposes default command registrations', async () => {
        const { context } = createContext();
        const commandService = new CommandService(context);
        const disposable = registerDefaultCommands(commandService);

        expect(await commandService.execute('window.restoreState')).toBe(true);

        disposable.dispose();

        expect(await commandService.execute('window.restoreState')).toBe(false);
    });

    it('sets theme effects through the command service', async () => {
        const { commandService, context, userSettings } = createActionHarness();

        await commandService.execute('theme.effects.set', 'blur');

        expect(getStoreValue(userSettings).theme.effects).toBe('blur');
        expect(context.theme.setEffect).toHaveBeenCalledWith('blur');
    });

    it('does not update theme effect settings when the platform command fails', async () => {
        const { commandService, context, userSettings } = createActionHarness();
        context.contextKeys.set(ContextKey.ThemeEffects, 'none');
        vi.mocked(context.theme.setEffect).mockRejectedValue(new Error('platform failed'));

        await expect(commandService.execute('theme.effects.set', 'blur')).rejects.toThrow(
            'platform failed'
        );

        expect(getStoreValue(userSettings).theme.effects).toBe('none');
        expect(context.contextKeys.get(ContextKey.ThemeEffects)).toBe('none');
    });

    it('rejects parameterized commands without valid payloads', async () => {
        const { commandService } = createActionHarness();
        registerDefaultCommands(commandService);

        expect(commandService.canExecuteInvocation({ commandId: 'theme.effects.set' })).toBe(false);
        expect(await commandService.executeInvocation({ commandId: 'theme.effects.set' })).toBe(
            false
        );
        expect(
            commandService.canExecuteInvocation({
                commandId: 'theme.effects.set',
                payload: 'invalid-effect'
            })
        ).toBe(false);
        expect(
            await commandService.executeInvocation({
                commandId: 'theme.effects.set',
                payload: 'invalid-effect'
            })
        ).toBe(false);
        expect(commandService.canExecuteInvocation({ commandId: 'window.setAlwaysOnTop' })).toBe(
            false
        );
        expect(await commandService.executeInvocation({ commandId: 'window.setAlwaysOnTop' })).toBe(
            false
        );
        expect(
            commandService.canExecuteInvocation({
                commandId: 'window.setAlwaysOnTop',
                payload: 'true'
            })
        ).toBe(false);
        expect(
            await commandService.executeInvocation({
                commandId: 'window.setAlwaysOnTop',
                payload: 'true'
            })
        ).toBe(false);
    });

    it('exposes concrete palette contributions for parameterized commands', async () => {
        const { commandService, context, menuService, userSettings } = createActionHarness();

        const paletteContributions = menuService.getVisibleItems(MenuId.CommandPalette);
        const directThemeCommand = paletteContributions.find(
            (contribution) => contribution.id === 'theme.effects.set'
        );
        const blurThemeContribution = paletteContributions.find(
            (contribution) => contribution.id === 'theme.effects.blur'
        );

        expect(directThemeCommand).toBeUndefined();
        expect(blurThemeContribution).toBeDefined();
        expect(menuService.canExecute(blurThemeContribution!)).toBe(true);
        expect(await menuService.execute(blurThemeContribution!)).toBe(true);
        expect(getStoreValue(userSettings).theme.effects).toBe('blur');
        expect(context.theme.setEffect).toHaveBeenCalledWith('blur');
    });

    it('toggles always-on-top through the command service', async () => {
        const { commandService, context, userSettings } = createActionHarness();

        await commandService.execute('window.toggleAlwaysOnTop');

        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(true);
        expect(context.window.setAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('does not update always-on-top settings when the window command fails', async () => {
        const { context, userSettings } = createContext();
        const commandService = new CommandService(context);
        registerDefaultCommands(commandService);
        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, false);
        vi.mocked(context.window.setAlwaysOnTop).mockRejectedValue(new Error('platform failed'));

        await expect(commandService.execute('window.setAlwaysOnTop', true)).rejects.toThrow(
            'platform failed'
        );

        expect(getStoreValue(userSettings).base.alwaysOnTop).toBe(false);
        expect(context.contextKeys.get(ContextKey.WindowAlwaysOnTop)).toBe(false);
    });

    it('keeps command palette toggle executable while the palette is open', () => {
        const { commandService, context } = createActionHarness();

        context.contextKeys.set(ContextKey.CommandPaletteOpen, true);

        expect(commandService.canExecute('app.showCommands')).toBe(true);
        expect(commandService.canExecute('app.closeCommands')).toBe(true);
    });

    it('requires the DevTools runtime capability for the DevTools command', async () => {
        const { commandService, context, menuService } = createActionHarness();

        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, false);
        expect(commandService.canExecute('window.toggleDevtools')).toBe(false);
        expect(await commandService.execute('window.toggleDevtools')).toBe(false);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((contribution) => contribution.id === 'window.toggleDevtools')
        ).toBe(false);

        context.contextKeys.set(ContextKey.WindowDevtoolsAvailable, true);
        expect(commandService.canExecute('window.toggleDevtools')).toBe(true);
        expect(
            menuService
                .getVisibleItems(MenuId.CommandPalette)
                .some((contribution) => contribution.id === 'window.toggleDevtools')
        ).toBe(true);
    });
});
