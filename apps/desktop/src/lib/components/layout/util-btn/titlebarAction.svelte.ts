import { MenuId, type MenuContribution, type MenuService } from '$lib/menus';
import { createDeferredInvalidation } from '$lib/utils/deferredInvalidation';

export function createTitleBarAction(menuService: MenuService, id: string, fallbackTitle: string) {
    let menuChangeVersion = $state(0);
    const invalidate = createDeferredInvalidation(() => {
        menuChangeVersion += 1;
    });

    $effect(() => {
        const disposable = menuService.onDidChange(() => {
            invalidate.schedule();
        });

        return () => {
            disposable.dispose();
            invalidate.dispose();
        };
    });

    const contribution = $derived.by((): MenuContribution | undefined => {
        menuChangeVersion;
        return menuService.getItem(MenuId.TitleBar, id);
    });

    const title = $derived.by(() => {
        menuChangeVersion;
        if (!contribution) return fallbackTitle;
        return menuService.getDisplayTitle(contribution);
    });

    const disabled = $derived.by(() => {
        menuChangeVersion;
        return !contribution || !menuService.canExecute(contribution);
    });

    const toggled = $derived.by(() => {
        menuChangeVersion;
        return Boolean(contribution && menuService.isToggled(contribution));
    });

    async function execute(): Promise<boolean> {
        if (!contribution || !menuService.canExecute(contribution)) return false;

        try {
            return await menuService.execute(contribution);
        } catch (error) {
            console.error(`Failed to execute titlebar contribution ${id}:`, error);
            return false;
        }
    }

    return {
        get title() {
            return title;
        },
        get disabled() {
            return disabled;
        },
        get toggled() {
            return toggled;
        },
        execute
    };
}
