<script lang="ts" module>
    import { onMount } from 'svelte';
    import { applyFourColorsHue, initializeTheme } from '$lib/theme/themeUtils';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
    import { type Effects, type Theme as WindowTheme } from '@tauri-apps/api/window';
    import { mode, ModeWatcher } from 'mode-watcher';
    import { toEffects } from '$lib/settings/Theme';
</script>

<script lang="ts">
    const userSettings = inject(USER_SETTINGS);
    const w = getCurrentWebviewWindow();

    async function setEffects(effects: Effects) {
        return w.setEffects(effects);
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
        if ($userSettings.theme.effects !== 'none') {
            setEffects({ effects: toEffects[$userSettings.theme.effects] });
        }
    });
</script>

<ModeWatcher
    defaultMode={$userSettings.theme.mode}
    defaultTheme={$userSettings.theme.type}
    disableTransitions={false}
/>
