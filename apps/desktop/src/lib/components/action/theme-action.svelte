<script lang="ts" module>
	import { onMount } from 'svelte';
	import { applyFourColorsHue, initializeTheme } from '$lib/theme/themeUtils';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';
	import { inject } from '$lib/utils/context';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { Effect, type Effects, type Theme as WindowTheme } from '@tauri-apps/api/window';
	import { mergeUnlisten } from '$lib/utils/mergeUnlisten';
	import { mode, ModeWatcher } from 'mode-watcher';
	import { toEffects } from '$lib/settings/Theme';
</script>

<script lang="ts">
	const userSettings = inject(USER_SETTINGS);
	const shortcutService = inject(SHORTCUT_SERVICE);
	const w = getCurrentWebviewWindow();

	async function setEffects(effects: Effects) {
		return w.setEffects(effects);
	}

	async function clearEffects() {
		return w.clearEffects();
	}

	$effect(() =>
		mergeUnlisten(
			// **Windows 11 Only**
			shortcutService.on('theme-effects-mica', async () => {
				await clearEffects();
				$userSettings.theme.effects = 'mica';
				setEffects({ effects: [Effect.Mica] });
			}),
			// **Windows 10/11**
			shortcutService.on('theme-effects-acrylic', async () => {
				await clearEffects();
				$userSettings.theme.effects = 'acrylic';
				setEffects({ effects: [Effect.Acrylic] });
			}),
			// **Windows 7/10/11(22H1) Only**
			shortcutService.on('theme-effects-blur', async () => {
				await clearEffects();
				$userSettings.theme.effects = 'blur';
				setEffects({ effects: [Effect.Blur] });
			}),
			shortcutService.on('theme-effects-none', () => {
				$userSettings.theme.effects = 'none';
				clearEffects();
			})
		)
	);

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

<ModeWatcher defaultMode={$userSettings.theme.mode} defaultTheme={$userSettings.theme.type} />
