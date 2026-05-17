import * as z from 'zod';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { ContextKey } from '$lib/context-keys';
import { registerActions } from '$lib/actions/actionRegistry';
import {
    defineAction,
    defineActions,
    type ActionKeybindingContribution,
    type RegisterActionServices
} from '$lib/actions/types';
import type { CommandInvocation, CommandReference, CommandScope } from '$lib/commands/types';
import { ModifierKey } from '$lib/keybindings/types';
import { MenuId } from '$lib/menus';
import { ReaderContextKey } from './contextKeys';
import type { ReaderCommandRuntime } from './runtime';

export const ReaderCommandId = {
    NotebookToggle: 'reader.notebook.toggle',
    PageNext: 'reader.page.next',
    PagePrevious: 'reader.page.previous',
    SearchOpen: 'reader.search.open',
    SectionNext: 'reader.section.next',
    SectionPrevious: 'reader.section.previous',
    SettingsClose: 'reader.settings.close',
    SettingsOpen: 'reader.settings.open',
    SidebarToggle: 'reader.sidebar.toggle'
} as const satisfies Record<string, CommandReference>;

export const READER_COMMAND_SCOPE = 'reader' as const satisfies CommandScope;

export type ReaderCommandId = (typeof ReaderCommandId)[keyof typeof ReaderCommandId];

export type ReaderCommandPayload = {
    bookKey?: string;
};

type ReaderCommandService = {
    canExecuteInvocation(invocation: CommandInvocation): boolean;
    executeInvocation(invocation: CommandInvocation): Promise<boolean>;
};

const readerPayloadSchema = z.object({ bookKey: z.string().optional() }).optional();
const readerCommandArgsSchema = z
    .union([z.tuple([]), z.tuple([readerPayloadSchema])])
    .transform((args): [ReaderCommandPayload?] =>
        args.length === 0 ? [] : [args[0]]
    ) as StandardSchemaV1<unknown, [ReaderCommandPayload?]>;

export function createReaderCommandInvocation(
    commandId: ReaderCommandId,
    payload?: ReaderCommandPayload
): CommandInvocation {
    return payload === undefined
        ? { scope: READER_COMMAND_SCOPE, commandId }
        : { scope: READER_COMMAND_SCOPE, commandId, payload };
}

export function canExecuteReaderCommand(
    commandService: Pick<ReaderCommandService, 'canExecuteInvocation'>,
    commandId: ReaderCommandId,
    payload?: ReaderCommandPayload
): boolean {
    return commandService.canExecuteInvocation(createReaderCommandInvocation(commandId, payload));
}

export function executeReaderCommand(
    commandService: Pick<ReaderCommandService, 'executeInvocation'>,
    commandId: ReaderCommandId,
    payload?: ReaderCommandPayload
): Promise<boolean> {
    return commandService.executeInvocation(createReaderCommandInvocation(commandId, payload));
}

function getReaderBookKey(
    runtime: ReaderCommandRuntime,
    payload?: ReaderCommandPayload
): string | undefined {
    return payload?.bookKey ?? runtime.getActiveBookKey();
}

function canRunReaderCommand(
    runtime: ReaderCommandRuntime,
    payload?: ReaderCommandPayload
): boolean {
    return runtime.hasBook(getReaderBookKey(runtime, payload));
}

const readerBookWhen = ReaderContextKey.BookOpen;
const readerCommandWhen = `${readerBookWhen} && !${ReaderContextKey.SettingsOpen}`;
const readerKeybindingWhen = `${readerCommandWhen} && !${ContextKey.TextInputFocus} && !${ContextKey.CommandPaletteOpen}`;
const readerSettingsCloseWhen = ReaderContextKey.SettingsOpen;
const readerSettingsCloseKeybindingWhen = `${ReaderContextKey.SettingsOpen} && !${ContextKey.CommandPaletteOpen}`;

function readerKeybinding(
    keybinding: Omit<ActionKeybindingContribution, 'when'>
): ActionKeybindingContribution {
    return {
        ...keybinding,
        when: readerKeybindingWhen
    };
}

export function createReaderActions(runtime: ReaderCommandRuntime) {
    return defineActions([
        defineAction({
            id: ReaderCommandId.PagePrevious,
            title: '阅读器：上一页',
            description: '翻到当前书籍的上一页',
            category: 'reader',
            keywords: ['reader', 'page', 'previous', '上一页', '翻页'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) return runtime.previousPage(bookKey);
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerCommandWhen, order: 500 }],
            keybindings: [
                readerKeybinding({
                    id: 'reader.page-previous-arrow',
                    combination: { key: 'Left', modifiers: [] },
                    source: 'feature'
                }),
                readerKeybinding({
                    id: 'reader.page-previous-h',
                    combination: { key: 'h', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.PageNext,
            title: '阅读器：下一页',
            description: '翻到当前书籍的下一页',
            category: 'reader',
            keywords: ['reader', 'page', 'next', '下一页', '翻页'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) return runtime.nextPage(bookKey);
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerCommandWhen, order: 501 }],
            keybindings: [
                readerKeybinding({
                    id: 'reader.page-next-arrow',
                    combination: { key: 'Right', modifiers: [] },
                    source: 'feature'
                }),
                readerKeybinding({
                    id: 'reader.page-next-l',
                    combination: { key: 'l', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.SectionPrevious,
            title: '阅读器：上一章节',
            description: '跳转到当前书籍的上一章节',
            category: 'reader',
            keywords: ['reader', 'section', 'previous', '上一章', '章节'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) return runtime.previousSection(bookKey);
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerCommandWhen, order: 502 }],
            keybindings: [
                readerKeybinding({
                    id: 'reader.section-previous-arrow',
                    combination: { key: 'Up', modifiers: [] },
                    source: 'feature'
                }),
                readerKeybinding({
                    id: 'reader.section-previous-k',
                    combination: { key: 'k', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.SectionNext,
            title: '阅读器：下一章节',
            description: '跳转到当前书籍的下一章节',
            category: 'reader',
            keywords: ['reader', 'section', 'next', '下一章', '章节'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) return runtime.nextSection(bookKey);
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerCommandWhen, order: 503 }],
            keybindings: [
                readerKeybinding({
                    id: 'reader.section-next-arrow',
                    combination: { key: 'Down', modifiers: [] },
                    source: 'feature'
                }),
                readerKeybinding({
                    id: 'reader.section-next-j',
                    combination: { key: 'j', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.SidebarToggle,
            title: '阅读器：切换侧栏',
            description: '显示或隐藏阅读器侧栏',
            category: 'reader',
            keywords: ['reader', 'sidebar', 'toc', '侧栏', '目录'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) runtime.toggleSidebar(bookKey);
                }
            },
            menus: [
                {
                    menu: MenuId.CommandPalette,
                    when: readerCommandWhen,
                    order: 504,
                    toggled: {
                        when: ReaderContextKey.SidebarVisible,
                        title: '阅读器：隐藏侧栏'
                    }
                }
            ],
            keybindings: [
                readerKeybinding({
                    combination: { key: 'b', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.NotebookToggle,
            title: '阅读器：切换笔记本',
            description: '显示或隐藏阅读器笔记本',
            category: 'reader',
            keywords: ['reader', 'notebook', 'notes', '笔记本', '笔记'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) runtime.toggleNotebook(bookKey);
                }
            },
            menus: [
                {
                    menu: MenuId.CommandPalette,
                    when: readerCommandWhen,
                    order: 505,
                    toggled: {
                        when: ReaderContextKey.NotebookVisible,
                        title: '阅读器：隐藏笔记本'
                    }
                }
            ],
            keybindings: [
                readerKeybinding({
                    combination: { key: 'n', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.SearchOpen,
            title: '阅读器：打开搜索',
            description: '打开当前书籍的搜索侧栏',
            category: 'reader',
            keywords: ['reader', 'search', 'find', '搜索', '查找'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) runtime.openSearch(bookKey);
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerCommandWhen, order: 506 }],
            keybindings: [
                readerKeybinding({
                    id: 'reader.search-f',
                    combination: { key: 'f', modifiers: [] },
                    source: 'feature'
                }),
                readerKeybinding({
                    id: 'reader.search-ctrl-f',
                    combination: { key: 'f', modifiers: [ModifierKey.Ctrl] },
                    source: 'feature'
                }),
                readerKeybinding({
                    id: 'reader.search-meta-f',
                    combination: { key: 'f', modifiers: [ModifierKey.Meta] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.SettingsOpen,
            title: '阅读器：打开设置',
            description: '打开当前书籍的阅读器设置',
            category: 'reader',
            keywords: ['reader', 'settings', 'preferences', '阅读器设置'],
            command: {
                enablement: readerCommandWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) =>
                    canRunReaderCommand(runtime, payload),
                run: (_context, payload?: ReaderCommandPayload) => {
                    const bookKey = getReaderBookKey(runtime, payload);
                    if (bookKey) runtime.openSettings(bookKey);
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerCommandWhen, order: 507 }],
            keybindings: [
                readerKeybinding({
                    combination: { key: 's', modifiers: [] },
                    source: 'feature'
                })
            ]
        }),
        defineAction({
            id: ReaderCommandId.SettingsClose,
            title: '阅读器：关闭设置',
            description: '关闭当前书籍的阅读器设置',
            category: 'reader',
            keywords: ['reader', 'settings', 'close', '关闭阅读器设置'],
            command: {
                enablement: readerSettingsCloseWhen,
                argsSchema: readerCommandArgsSchema,
                canRun: (_context, payload?: ReaderCommandPayload) => {
                    return runtime.hasSettingsOpen(getReaderBookKey(runtime, payload));
                },
                run: (_context, payload?: ReaderCommandPayload) => {
                    runtime.closeSettings(getReaderBookKey(runtime, payload));
                }
            },
            menus: [{ menu: MenuId.CommandPalette, when: readerSettingsCloseWhen, order: 508 }],
            keybindings: [
                {
                    combination: { key: 'Esc', modifiers: [] },
                    when: readerSettingsCloseKeybindingWhen,
                    allowInTextInput: true,
                    allowWhenDialogOpen: true,
                    source: 'feature'
                }
            ]
        })
    ]);
}

export function registerReaderActions(
    services: RegisterActionServices,
    runtime: ReaderCommandRuntime
) {
    return registerActions(createReaderActions(runtime), services);
}
