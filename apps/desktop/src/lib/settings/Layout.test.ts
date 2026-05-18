import { describe, expect, it } from 'vitest';
import {
    addTitleBarItem,
    completeTitleBarConfig,
    DefaultTitleBarConfig,
    migrateTitleBarConfig,
    moveTitleBarItem,
    moveTitleBarItemByDirection,
    removeTitleBarItem,
    setTitleBarItemEnabled,
    swapTitleBarItemOrder,
    toggleTitleBarItem,
    updateTitleBarItem
} from './Layout';

describe('titlebar layout config', () => {
    it('migrates legacy button types to contribution ids', () => {
        const config = migrateTitleBarConfig({
            left: [
                { name: 'home', type: 'home', enabled: true, order: 1 },
                { name: 'back', type: 'back', enabled: false, order: 0 }
            ],
            center: [{ name: 'app-title', type: 'app-title', enabled: true, order: 0 }],
            right: [{ name: 'close', type: 'close', enabled: true, order: 0 }]
        });

        expect(config.left.map((item) => item.contributionId)).toEqual([
            'navigate.back',
            'navigate.home'
        ]);
        expect(config.left[0].enabled).toBe(false);
        expect(config.center[0].contributionId).toBe('app.title');
        expect(config.right[0].contributionId).toBe('window.close');
    });

    it('returns immutable updates for move, toggle, add, and remove', () => {
        const original = DefaultTitleBarConfig;
        const moved = moveTitleBarItem(
            original,
            { section: 'left', index: 0 },
            { section: 'right', index: 0 }
        );
        const toggled = toggleTitleBarItem(moved, moved.right[0].id);
        const added = addTitleBarItem(toggled, 'center', 'window.dragRegion', {
            iconId: 'move',
            titleOverride: '拖动窗口'
        });
        const removed = removeTitleBarItem(added, added.right[0].id);

        expect(original.left[0].contributionId).toBe('navigate.home');
        expect(moved.right[0].contributionId).toBe('navigate.home');
        expect(toggled.right[0].enabled).toBe(false);
        expect(added.center.some((item) => item.contributionId === 'window.dragRegion')).toBe(true);
        expect(
            added.center.find((item) => item.contributionId === 'window.dragRegion')?.iconId
        ).toBe('move');
        expect(
            added.center.find((item) => item.contributionId === 'window.dragRegion')?.titleOverride
        ).toBe('拖动窗口');
        expect(removed.right.some((item) => item.id === added.right[0].id)).toBe(false);
    });

    it('completes missing titlebar contributions as disabled items', () => {
        const config = completeTitleBarConfig(
            {
                left: [
                    {
                        id: 'navigate.home',
                        contributionId: 'navigate.home',
                        enabled: true,
                        order: 0
                    }
                ]
            },
            [
                { id: 'navigate.home', category: 'navigation' },
                { id: 'window.close', category: 'window' },
                { id: 'app.title', category: 'application' }
            ]
        );

        expect(config.left.find((item) => item.contributionId === 'navigate.home')?.enabled).toBe(
            true
        );
        expect(config.right.find((item) => item.contributionId === 'window.close')?.enabled).toBe(
            false
        );
        expect(config.center.find((item) => item.contributionId === 'app.title')?.enabled).toBe(
            false
        );
    });

    it('sets titlebar item enabled state without removing it from layout', () => {
        const disabled = setTitleBarItemEnabled(DefaultTitleBarConfig, 'navigate.home', false);
        const enabled = setTitleBarItemEnabled(disabled, 'navigate.home', true);

        expect(disabled.left.find((item) => item.id === 'navigate.home')?.enabled).toBe(false);
        expect(enabled.left.find((item) => item.id === 'navigate.home')?.enabled).toBe(true);
        expect(enabled.left.map((item) => item.contributionId)).toContain('navigate.home');
    });

    it('updates item presentation metadata without changing layout identity', () => {
        const updated = updateTitleBarItem(DefaultTitleBarConfig, 'navigate.home', (item) => ({
            ...item,
            iconId: 'command',
            titleOverride: '自定义主页'
        }));

        const item = updated.left.find((entry) => entry.id === 'navigate.home');
        expect(item?.contributionId).toBe('navigate.home');
        expect(item?.iconId).toBe('command');
        expect(item?.titleOverride).toBe('自定义主页');
    });

    it('removes a titlebar item from all sections', () => {
        const config = addTitleBarItem(DefaultTitleBarConfig, 'center', 'theme.effects.blur');
        const added = config.center.find((item) => item.contributionId === 'theme.effects.blur');

        expect(added).toBeDefined();

        const removed = removeTitleBarItem(config, added!.id);

        expect(
            Object.values(removed)
                .flat()
                .some((item) => item.id === added!.id)
        ).toBe(false);
    });

    it('moves titlebar items across sections without mutating the original config', () => {
        const moved = moveTitleBarItem(
            DefaultTitleBarConfig,
            { section: 'left', index: 0 },
            { section: 'right', index: 1 }
        );

        expect(DefaultTitleBarConfig.left[0].contributionId).toBe('navigate.home');
        expect(moved.right.map((item) => item.contributionId).slice(0, 3)).toEqual([
            'app.themeToggle',
            'navigate.home',
            'window.toggleAlwaysOnTop'
        ]);
    });

    it('swaps titlebar items within a section in both directions', () => {
        const movedRight = swapTitleBarItemOrder(DefaultTitleBarConfig, 'left', 0, 1);
        const movedLeft = swapTitleBarItemOrder(DefaultTitleBarConfig, 'left', 1, -1);

        expect(movedRight.left.map((item) => item.contributionId).slice(0, 2)).toEqual([
            'navigate.settings',
            'navigate.home'
        ]);
        expect(movedLeft.left.map((item) => item.contributionId).slice(0, 2)).toEqual([
            'navigate.settings',
            'navigate.home'
        ]);
    });

    it('moves titlebar items across section boundaries by visual direction', () => {
        const movedRight = moveTitleBarItemByDirection(DefaultTitleBarConfig, 'left', 5, 1);
        const movedLeft = moveTitleBarItemByDirection(DefaultTitleBarConfig, 'center', 0, -1);

        expect(movedRight.center[0].contributionId).toBe('navigate.back');
        expect(movedRight.left.some((item) => item.contributionId === 'navigate.back')).toBe(false);
        expect(movedLeft.left.at(-1)?.contributionId).toBe('app.icon');
        expect(movedLeft.center.some((item) => item.contributionId === 'app.icon')).toBe(false);
    });
});
