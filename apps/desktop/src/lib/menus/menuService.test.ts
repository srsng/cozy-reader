import { describe, expect, it, vi } from 'vitest';
import { ContextKey } from '$lib/context-keys';
import { createTestCommandContext } from '$lib/testing';
import { CommandService } from '$lib/commands/commandService';
import { MenuId, type MenuContribution } from './types';
import { MenuService } from './menuService';

function createCommandService() {
    const { context } = createTestCommandContext();
    const commandService = new CommandService(context);
    commandService.register({ id: 'zoom.in', run: vi.fn() });

    return { commandService, context };
}

function contribution(menu: MenuId, title: string): MenuContribution {
    return {
        id: 'zoom.in',
        menu,
        title,
        category: 'zoom',
        invocation: { commandId: 'zoom.in' }
    };
}

function keepOpenContribution(menu: MenuId, title: string): MenuContribution {
    return {
        ...contribution(menu, title),
        keepOpen: true
    };
}

function toggledContribution(menu: MenuId, title: string): MenuContribution {
    return {
        ...contribution(menu, title),
        toggled: {
            when: ContextKey.WindowAlwaysOnTop,
            title: '取消置顶',
            description: '关闭窗口始终置顶'
        }
    };
}

describe('MenuService', () => {
    it('allows the same contribution id in different menus', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);

        menuService.register(contribution(MenuId.CommandPalette, 'Palette Zoom In'));
        menuService.register(contribution(MenuId.TitleBar, 'Titlebar Zoom In'));

        expect(menuService.getItems(MenuId.CommandPalette)[0].title).toBe('Palette Zoom In');
        expect(menuService.getItems(MenuId.TitleBar)[0].title).toBe('Titlebar Zoom In');
    });

    it('gets contributions by menu and id without crossing menu boundaries', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);

        menuService.register(contribution(MenuId.CommandPalette, 'Palette Zoom In'));
        menuService.register(contribution(MenuId.TitleBar, 'Titlebar Zoom In'));

        expect(menuService.getItem(MenuId.CommandPalette, 'zoom.in')?.title).toBe(
            'Palette Zoom In'
        );
        expect(menuService.getItem(MenuId.TitleBar, 'zoom.in')?.title).toBe('Titlebar Zoom In');
        expect(menuService.getItem(MenuId.Settings, 'zoom.in')).toBeUndefined();
    });

    it('preserves command palette keep-open metadata', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);

        menuService.register(keepOpenContribution(MenuId.CommandPalette, 'Palette Zoom In'));

        expect(menuService.getItem(MenuId.CommandPalette, 'zoom.in')?.keepOpen).toBe(true);
    });

    it('throws when duplicate ids are registered within the same menu in development', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);

        menuService.register(contribution(MenuId.CommandPalette, 'First'));

        expect(() => menuService.register(contribution(MenuId.CommandPalette, 'Second'))).toThrow(
            'Overwriting menu contribution: commandPalette:zoom.in'
        );
    });

    it('disposes menu contributions and emits change events', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const listener = vi.fn();
        menuService.onDidChange(listener);

        const disposable = menuService.register(
            contribution(MenuId.CommandPalette, 'Palette Zoom In')
        );

        expect(menuService.getItems(MenuId.CommandPalette)).toHaveLength(1);
        expect(listener).toHaveBeenCalledTimes(1);

        disposable.dispose();

        expect(menuService.getItems(MenuId.CommandPalette)).toHaveLength(0);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('keeps the original contribution after a rejected duplicate registration', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        menuService.register(contribution(MenuId.CommandPalette, 'First'));

        expect(() => menuService.register(contribution(MenuId.CommandPalette, 'Second'))).toThrow();

        expect(menuService.getItems(MenuId.CommandPalette)).toHaveLength(1);
        expect(menuService.getItems(MenuId.CommandPalette)[0].title).toBe('First');
    });

    it('rolls back registerAll when one contribution registration fails', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        menuService.register(contribution(MenuId.CommandPalette, 'Existing'));

        expect(() =>
            menuService.registerAll([
                {
                    ...contribution(MenuId.CommandPalette, 'Temporary'),
                    id: 'temporary'
                },
                contribution(MenuId.CommandPalette, 'Duplicate')
            ])
        ).toThrow('Overwriting menu contribution: commandPalette:zoom.in');

        expect(menuService.getItem(MenuId.CommandPalette, 'temporary')).toBeUndefined();
        expect(menuService.getItem(MenuId.CommandPalette, 'zoom.in')?.title).toBe('Existing');
    });

    it('resolves toggled state and display metadata from context keys', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const item = toggledContribution(MenuId.TitleBar, '置顶');

        expect(menuService.isToggled(item)).toBe(false);
        expect(menuService.getDisplayTitle(item)).toBe('置顶');
        expect(menuService.getDisplayDescription(item)).toBeUndefined();

        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, true);

        expect(menuService.isToggled(item)).toBe(true);
        expect(menuService.getDisplayTitle(item)).toBe('取消置顶');
        expect(menuService.getDisplayDescription(item)).toBe('关闭窗口始终置顶');
    });

    it('emits change events when context keys change', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const listener = vi.fn();
        menuService.onDidChange(listener);

        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, true);

        expect(listener).toHaveBeenCalledOnce();
    });

    it('disposes contributions, listeners, and context key subscriptions', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const listener = vi.fn();

        menuService.register(contribution(MenuId.CommandPalette, 'Palette Zoom In'));
        menuService.onDidChange(listener);

        menuService.dispose();
        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, true);

        expect(menuService.getItems(MenuId.CommandPalette)).toHaveLength(0);
        expect(listener).not.toHaveBeenCalled();
    });

    it('evaluates toggled state with parenthesized expressions', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const item: MenuContribution = {
            ...contribution(MenuId.TitleBar, '置顶'),
            toggled: {
                when: `(${ContextKey.WindowAlwaysOnTop} || ${ContextKey.WindowFullscreen}) && themeEffects in ["mica", "blur"]`
            }
        };

        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, true);
        context.contextKeys.set(ContextKey.ThemeEffects, 'mica');

        expect(menuService.isToggled(item)).toBe(true);

        context.contextKeys.set(ContextKey.ThemeEffects, 'none');

        expect(menuService.isToggled(item)).toBe(false);
    });

    it('inspects menu contribution visibility, enablement, and toggled state', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const item: MenuContribution = {
            ...contribution(MenuId.CommandPalette, 'Palette Zoom In'),
            when: 'route == "/settings"',
            enablement: '!textInputFocus',
            toggled: {
                when: ContextKey.WindowAlwaysOnTop
            }
        };

        context.contextKeys.set(ContextKey.Route, '/settings');
        context.contextKeys.set(ContextKey.TextInputFocus, false);
        context.contextKeys.set(ContextKey.WindowAlwaysOnTop, true);

        const inspection = menuService.inspect(item);

        expect(inspection.visible).toBe(true);
        expect(inspection.enabled).toBe(true);
        expect(inspection.toggled).toBe(true);
        expect(inspection.commandExists).toBe(true);
        expect(inspection.visibility.referencedKeys).toEqual(['route']);
        expect(inspection.enablement.referencedKeys).toEqual(['textInputFocus']);
        expect(inspection.toggledInspection?.referencedKeys).toEqual([
            ContextKey.WindowAlwaysOnTop
        ]);
    });

    it('inspects missing command contributions', () => {
        const { commandService, context } = createCommandService();
        const menuService = new MenuService(commandService, context.contextKeys);
        const item: MenuContribution = {
            id: 'missing',
            menu: MenuId.CommandPalette,
            title: 'Missing',
            category: 'application',
            invocation: { commandId: 'window.close' }
        };

        expect(menuService.inspect(item).commandExists).toBe(false);
        expect(menuService.inspect(item).enabled).toBe(false);
    });
});
