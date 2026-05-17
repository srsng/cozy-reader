import { describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
import * as z from 'zod';
import { ContextKeyService } from '$lib/context-keys';
import { DEFAULT_APP_STATE } from '$lib/state/app-state';
import { LogLevel } from '$lib/types';
import type { UserSettings } from '$lib/settings';
import { asDynamicCommandId, type CommandContext } from './types';
import { CommandService } from './commandService';
import { CommandSchemaError } from './schema';

const testAddCommand = asDynamicCommandId('test.add');
const testBooleanCommand = asDynamicCommandId('test.boolean');
const testResultCommand = asDynamicCommandId('test.result');

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

function createService() {
    const context: CommandContext = {
        appState: writable(DEFAULT_APP_STATE),
        contextKeys: new ContextKeyService(),
        navigation: { settings: vi.fn() },
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

describe('CommandService', () => {
    it('disposes registered commands', async () => {
        const service = createService();
        const run = vi.fn();
        const disposable = service.register({ id: 'zoom.in', run });

        expect(await service.execute('zoom.in')).toBe(true);

        disposable.dispose();

        expect(service.findCommand('zoom.in')).toBeUndefined();
        expect(await service.execute('zoom.in')).toBe(false);
    });

    it('throws when registering duplicate commands in development', () => {
        const service = createService();
        const firstRun = vi.fn();
        const secondRun = vi.fn();
        service.register({ id: 'zoom.in', run: firstRun });

        expect(() => service.register({ id: 'zoom.in', run: secondRun })).toThrow(
            'Overwriting command: zoom.in'
        );
    });

    it('rolls back registerAll when one command registration fails', () => {
        const service = createService();
        const existingRun = vi.fn();
        service.register({ id: 'zoom.in', run: existingRun });

        expect(() =>
            service.registerAll([
                { id: 'zoom.out', run: vi.fn() },
                { id: 'zoom.in', run: vi.fn() }
            ])
        ).toThrow('Overwriting command: zoom.in');

        expect(service.findCommand('zoom.out')).toBeUndefined();
        expect(service.findCommand('zoom.in')?.run).toBe(existingRun);
    });

    it('returns command results and passes multiple arguments through executeCommand', async () => {
        const service = createService();
        const testSumCommand = asDynamicCommandId('test.sum');
        const run = vi.fn((_context: CommandContext, ...args: unknown[]) => {
            return Number(args[0]) + Number(args[1]);
        });
        service.register({ id: testSumCommand, run });

        await expect(service.executeCommand<number>(testSumCommand, 2, 3)).resolves.toBe(5);
        expect(run).toHaveBeenCalledWith(expect.anything(), 2, 3);
    });

    it('validates and parses command arguments before canRun and run', async () => {
        const service = createService();
        const run = vi.fn((_context: CommandContext, left: number, right: number) => {
            return left + right;
        });
        service.register({
            id: testAddCommand,
            argsSchema: z.tuple([z.coerce.number(), z.coerce.number()]),
            run
        });

        expect(service.canExecute(testAddCommand, '2', '3')).toBe(true);
        await expect(service.executeCommand<number>(testAddCommand, '2', '3')).resolves.toBe(5);
        expect(run).toHaveBeenCalledWith(expect.anything(), 2, 3);
        expect(service.canExecute(testAddCommand, 'not-a-number', '3')).toBe(false);
    });

    it('does not execute commands with invalid arguments', async () => {
        const service = createService();
        const run = vi.fn();
        service.register({
            id: testBooleanCommand,
            argsSchema: z.tuple([z.boolean()]),
            run
        });

        expect(service.canExecute(testBooleanCommand, 'true')).toBe(false);
        expect(await service.execute(testBooleanCommand, 'true')).toBe(false);
        expect(run).not.toHaveBeenCalled();
    });

    it('throws when command result validation fails', async () => {
        const service = createService();
        service.register({
            id: testResultCommand,
            argsSchema: z.tuple([]),
            resultSchema: z.string(),
            run: () => 1
        });

        await expect(service.executeCommand(testResultCommand)).rejects.toBeInstanceOf(
            CommandSchemaError
        );
    });

    it('keeps execute as a boolean wrapper around command execution', async () => {
        const service = createService();
        const run = vi.fn(() => 'ignored-result');
        service.register({ id: 'zoom.in', run });

        expect(await service.execute('zoom.in')).toBe(true);
        expect(run).toHaveBeenCalledOnce();
    });

    it('does not execute missing or disabled commands through executeCommand', async () => {
        const service = createService();
        const run = vi.fn();
        service.register({
            id: 'window.toggleDevtools',
            enablement: 'window.devtoolsAvailable',
            run
        });

        expect(await service.executeCommand('zoom.in')).toBeUndefined();
        expect(await service.executeCommand('window.toggleDevtools')).toBeUndefined();
        expect(run).not.toHaveBeenCalled();
    });

    it('requires dynamic command ids to be explicitly branded for direct execution APIs', async () => {
        const service = createService();

        // @ts-expect-error direct APIs reject unbranded dynamic command strings
        service.execute('plugin.unbranded');
        // @ts-expect-error known command arguments are checked before runtime schema validation
        service.execute('window.setAlwaysOnTop', 'true');
        // @ts-expect-error known command arguments are checked for canExecute too
        service.canExecute('theme.effects.set', { effect: 'blur' });

        const pluginCommand = asDynamicCommandId('plugin.branded');
        service.register({
            id: pluginCommand,
            argsSchema: z.tuple([z.string()]),
            run: vi.fn()
        });

        expect(service.canExecute(pluginCommand, 'payload')).toBe(true);
        expect(await service.execute(pluginCommand, 'payload')).toBe(true);
    });
});
