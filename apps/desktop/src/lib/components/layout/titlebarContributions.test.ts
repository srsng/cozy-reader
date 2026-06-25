import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/components/common/app-icon.svelte', () => ({ default: {} }));
vi.mock('$lib/components/layout/titlebarIcons', () => ({
    getDefaultTitleBarIconId: () => undefined,
    getTitleBarIcon: () => undefined
}));
vi.mock('./util-btn/app-icon.svelte', () => ({ default: {} }));
vi.mock('./util-btn/app-title.svelte', () => ({ default: {} }));
vi.mock('./util-btn/app-drag.svelte', () => ({ default: {} }));
vi.mock('./util-btn/theme-toggle.svelte', () => ({ default: {} }));
vi.mock('./util-btn/zoom-popover.svelte', () => ({ default: {} }));
vi.mock('./util-btn/main-window-alway-on-top.svelte', () => ({ default: {} }));

import { registerDefaultActions } from '$lib/actions/defaultActions';
import { createAppCommandHarness } from '$lib/testing';

function createServices() {
    const harness = createAppCommandHarness({
        registerCommandExecutor: false
    });

    const defaultActionsDisposable = registerDefaultActions({
        commandService: harness.commandService,
        menuService: harness.menuService,
        keybindingManager: harness.keybindingManager
    });

    return {
        ...harness,
        defaultActionsDisposable
    };
}

describe('titlebar contributions', () => {
    it('exposes always-on-top as a static component contribution', async () => {
        const { menuService, defaultActionsDisposable } = createServices();
        const { getTitleBarContribution } = await import('./titlebarContributions');

        const contribution = getTitleBarContribution('window.toggleAlwaysOnTop', menuService);

        expect(contribution?.kind).toBe('component');
        expect(contribution?.component).toBeDefined();

        defaultActionsDisposable.dispose();
    });

    it('does not duplicate always-on-top in available menu contributions', async () => {
        const { menuService, defaultActionsDisposable } = createServices();
        const { getAvailableTitleBarContributions } = await import('./titlebarContributions');

        const contributions = getAvailableTitleBarContributions(menuService);

        expect(contributions.filter((item) => item.id === 'window.toggleAlwaysOnTop')).toHaveLength(
            1
        );

        defaultActionsDisposable.dispose();
    });
});
