<script lang="ts" module>
    import { onMount } from 'svelte';
    import { applyFourColorsHue, initializeTheme } from '$lib/theme/themeUtils';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
    import { type Effects, type Theme as WindowTheme } from '@tauri-apps/api/window';
    import { mode, ModeWatcher } from 'mode-watcher';
    import { toEffects, type AppThemeEffects } from '$lib/settings/Theme';
    import { APP_STATE } from '$lib/stores/appState';
</script>

<script lang="ts">
    const userSettings = inject(USER_SETTINGS);
    const appState = inject(APP_STATE);
    const w = getCurrentWebviewWindow();

    async function setEffects(effects: Effects) {
        return w.setEffects(effects);
    }

    function canUseEffect(effect: AppThemeEffects): boolean {
        switch (effect) {
            case 'none':
                return true;
            case 'blur':
                return $appState.theme.effectAvailability.blur;
            case 'mica':
                return $appState.theme.effectAvailability.mica;
            case 'acrylic':
                return $appState.theme.effectAvailability.acrylic;
        }
    }

    // 同步 web的主题mode 与 window的主题
    $effect(() => {
        // 使用 mode.current 变化触发
        mode.current;
        w.theme().then((theme) => {
            if (mode.current !== theme) {
                w.setTheme(mode.current as WindowTheme);
            }
        });
    });

    // todo: 统一响应主题变化
    $effect(() => {
        applyFourColorsHue($userSettings.theme.data.four_colors.hue);
    });

    onMount(() => {
        // 初始化 app web主题
        initializeTheme($userSettings.theme.type, $userSettings.theme.data);

        // 初始化窗口 theme
        w.setTheme(mode.current as WindowTheme).catch((e) => console.error(e));

        // 初始化窗口 effects
        if (!canUseEffect($userSettings.theme.effects)) {
            setEffects({ effects: [] }).catch((error) => {
                console.error('Failed to clear unavailable window effects:', error);
            });
            return;
        }

        setEffects({ effects: toEffects[$userSettings.theme.effects] }).catch((error) => {
            console.error('Failed to initialize window effects:', error);
        });
    });
</script>

<ModeWatcher
    defaultMode={$userSettings.theme.mode}
    defaultTheme={$userSettings.theme.type}
    disableTransitions={false}
/>
