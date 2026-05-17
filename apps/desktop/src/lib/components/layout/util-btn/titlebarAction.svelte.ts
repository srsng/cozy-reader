import { MenuId, type MenuContribution, type MenuService } from '$lib/menus';

export function createTitleBarAction(
    menuService: MenuService,
    id: string,
    fallbackTitle: string
) {
    let version = $state(0);

    $effect(() => {
        const disposable = menuService.onDidChange(() => {
            version += 1;
        });

        return () => disposable.dispose();
    });

    const contribution = $derived.by((): MenuContribution | undefined => {
        version;
        return menuService.getItem(MenuId.TitleBar, id);
    });

    const title = $derived.by(() => {
        if (!contribution) return fallbackTitle;
        return menuService.getDisplayTitle(contribution);
    });

    const disabled = $derived.by(() => !contribution || !menuService.canExecute(contribution));

    const toggled = $derived.by(() => Boolean(contribution && menuService.isToggled(contribution)));

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
