import type { AnyCommandDefinition, CommandInvocation } from '$lib/commands/types';
import type { ContextKeyService } from '$lib/context-keys';
import { InjectionToken } from '$lib/utils/context';
import { DisposableStore, toDisposable, type Disposable } from '$lib/utils/disposable';
import type { MenuContribution, MenuContributionInspection, MenuId } from './types';

export const MENU_SERVICE = new InjectionToken<MenuService>('MenuService');

export type MenuCommandRouter = {
    findCommand(invocation: CommandInvocation): AnyCommandDefinition | undefined;
    canExecuteInvocation(invocation: CommandInvocation): boolean;
    executeInvocation(invocation: CommandInvocation): Promise<boolean>;
};

type Listener = () => void;

export class MenuService {
    private readonly contributionsByMenu = new Map<MenuId, Map<string, MenuContribution>>();
    private readonly listeners = new Set<Listener>();
    private readonly disposeContextKeyListener: () => void;

    constructor(
        private readonly commandRouter: MenuCommandRouter,
        private readonly contextKeys: ContextKeyService
    ) {
        this.disposeContextKeyListener = this.contextKeys.onDidChange(() => this.emitChange());
    }

    register(contribution: MenuContribution): Disposable {
        const contributions = this.getOrCreateMenuContributions(contribution.menu);
        if (contributions.has(contribution.id)) {
            handleDuplicateRegistration(
                `Overwriting menu contribution: ${contribution.menu}:${contribution.id}`
            );
        }
        contributions.set(contribution.id, contribution);
        this.emitChange();

        return toDisposable(() => {
            if (contributions.get(contribution.id) === contribution) {
                contributions.delete(contribution.id);
                this.emitChange();
            }
        });
    }

    registerAll(contributions: readonly MenuContribution[]): Disposable {
        const disposables = new DisposableStore();

        try {
            contributions.forEach((contribution) => disposables.add(this.register(contribution)));
            return disposables;
        } catch (error) {
            disposables.dispose();
            throw error;
        }
    }

    getItems(menu: MenuId): MenuContribution[] {
        return Array.from(this.contributionsByMenu.get(menu)?.values() ?? []).sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title)
        );
    }

    getItem(menu: MenuId, id: string): MenuContribution | undefined {
        return this.contributionsByMenu.get(menu)?.get(id);
    }

    getVisibleItems(menu: MenuId): MenuContribution[] {
        return this.getItems(menu).filter((contribution) => this.isVisible(contribution));
    }

    inspect(contribution: MenuContribution): MenuContributionInspection {
        const visibility = this.contextKeys.inspect(contribution.when);
        const enablement = this.contextKeys.inspect(contribution.enablement);
        const toggledInspection = contribution.toggled
            ? this.contextKeys.inspect(contribution.toggled.when)
            : undefined;
        const commandExists = Boolean(this.commandRouter.findCommand(contribution.invocation));

        return {
            contribution,
            visible: visibility.matches,
            enabled:
                enablement.matches &&
                this.commandRouter.canExecuteInvocation(contribution.invocation),
            toggled: Boolean(toggledInspection?.matches),
            commandExists,
            visibility,
            enablement,
            toggledInspection
        };
    }

    inspectMenu(menu: MenuId): MenuContributionInspection[] {
        return this.getItems(menu).map((contribution) => this.inspect(contribution));
    }

    getDisplayTitle(contribution: MenuContribution): string {
        if (this.isToggled(contribution) && contribution.toggled?.title) {
            return contribution.toggled.title;
        }

        return contribution.title;
    }

    getDisplayDescription(contribution: MenuContribution): string | undefined {
        if (this.isToggled(contribution) && contribution.toggled?.description) {
            return contribution.toggled.description;
        }

        return contribution.description;
    }

    isVisible(contribution: MenuContribution): boolean {
        return this.contextKeys.match(contribution.when);
    }

    isToggled(contribution: MenuContribution): boolean {
        return this.contextKeys.match(contribution.toggled?.when);
    }

    canExecute(contribution: MenuContribution): boolean {
        if (!this.contextKeys.match(contribution.enablement)) return false;
        return this.commandRouter.canExecuteInvocation(contribution.invocation);
    }

    async execute(contribution: MenuContribution): Promise<boolean> {
        if (!this.canExecute(contribution)) return false;
        return this.commandRouter.executeInvocation(contribution.invocation);
    }

    onDidChange(listener: Listener): Disposable {
        this.listeners.add(listener);
        return toDisposable(() => this.listeners.delete(listener));
    }

    dispose(): void {
        this.disposeContextKeyListener();
        this.contributionsByMenu.clear();
        this.listeners.clear();
    }

    private getOrCreateMenuContributions(menu: MenuId): Map<string, MenuContribution> {
        const existingContributions = this.contributionsByMenu.get(menu);
        if (existingContributions) return existingContributions;

        const contributions = new Map<string, MenuContribution>();
        this.contributionsByMenu.set(menu, contributions);
        return contributions;
    }

    private emitChange(): void {
        this.listeners.forEach((listener) => listener());
    }
}

function handleDuplicateRegistration(message: string): void {
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
        throw new Error(message);
    }

    console.warn(message);
}
