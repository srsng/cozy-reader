import * as z from 'zod';
import type { CommandSpec } from './types';
import { defineCommands, defineKnownCommand } from './types';
import { CommandService } from './commandService';
import { setAlwaysOnTop } from './commandHelpers';
import type { Disposable } from '$lib/utils/disposable';

declare module '$lib/commands/types' {
    interface CommandRegistry {
        'window.setAlwaysOnTop': CommandSpec<[boolean], void>;
        'window.saveState': CommandSpec<[], void>;
        'window.restoreState': CommandSpec<[], void>;
        'window.requestUserAttention': CommandSpec<[], void>;
    }
}

const noArgsSchema = z.tuple([]);

export const defaultCommands = defineCommands([
    defineKnownCommand({
        id: 'window.setAlwaysOnTop',
        argsSchema: z.tuple([z.boolean()]),
        run: async (context, value) => {
            await setAlwaysOnTop(context, value);
        }
    }),
    defineKnownCommand({
        id: 'window.saveState',
        argsSchema: noArgsSchema,
        run: (context) => context.window.saveState()
    }),
    defineKnownCommand({
        id: 'window.restoreState',
        argsSchema: noArgsSchema,
        run: (context) => context.window.restoreState()
    }),
    defineKnownCommand({
        id: 'window.requestUserAttention',
        argsSchema: noArgsSchema,
        run: (context) => context.window.requestUserAttention()
    })
]);

export function registerDefaultCommands(commandService: CommandService): Disposable {
    return commandService.registerAll(defaultCommands);
}
