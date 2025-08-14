<script lang="ts" module>
	import { emit } from '@tauri-apps/api/event';
	import { SHORTCUT_EVENT } from '$lib/shortcuts/shortcutService';
	import {
		restoreStateCurrent,
		saveWindowState,
		StateFlags
	} from '@tauri-apps/plugin-window-state';

	// 恢复窗口状态
	export function restoreAppWindowState() {
		restoreStateCurrent(StateFlags.ALL);
	}

	// 保存窗口状态
	export function saveAppWindowState() {
		saveWindowState(StateFlags.ALL);
	}

	// 刷新页面
	export function refreshWindow() {
		saveAppWindowState();
		window.location.reload(); // note: 不是appwindow
	}

	export type mainWindowOperator = 'minimize' | 'maximize' | 'close' | 'toggle-always-on-top';

	const mainWOp2Event: Record<mainWindowOperator, string> = {
		minimize: 'main-window-minimize',
		maximize: 'main-window-maximize',
		close: 'main-window-close',
		'toggle-always-on-top': 'main-window-toggle-always-on-top'
	};

	export function emitMainWindowEvent(event: mainWindowOperator) {
		emit(SHORTCUT_EVENT, mainWOp2Event[event]);
	}
</script>

<script lang="ts">
	import { Window } from '@tauri-apps/api/window';
	import { SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';
	import { inject } from '$lib/utils/context';
	import { mergeUnlisten } from '$lib/utils/mergeUnlisten';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { onMount } from 'svelte';

	const userSettings = inject(USER_SETTINGS);
	const shortcutService = inject(SHORTCUT_SERVICE);

	// todo: 应该是main window 还是current window？
	// import { getCurrentWindow } from '@tauri-apps/api/window';
	const appWindow = new Window('main');

	function setAOT(aot: boolean) {
		appWindow.setAlwaysOnTop(aot);
	}

	// 初始化窗口
	function initAppWindow() {
		restoreAppWindowState();
		destroyAppWindowListener();
	}

	// 监听窗口关闭事件，在关闭时保持窗口状态
	function destroyAppWindowListener() {
		appWindow.listen('close-requested', async (_event: any) => {
			saveAppWindowState();
			await appWindow.close();
		});
	}

	// 注册监听基本窗口事件
	$effect(() =>
		mergeUnlisten(
			// main 最大化、最小化、关闭
			shortcutService.on(mainWOp2Event.minimize, () => {
				appWindow.minimize();
			}),
			shortcutService.on(mainWOp2Event.maximize, () => {
				appWindow.toggleMaximize();
			}),
			shortcutService.on(mainWOp2Event.close, () => {
				appWindow.close();
			}),
			// main 始终至于顶层
			shortcutService.on(mainWOp2Event['toggle-always-on-top'], () => {
				$userSettings.base.alwaysOnTop = !$userSettings.base.alwaysOnTop;
				setAOT($userSettings.base.alwaysOnTop);
			})
		)
	);

	onMount(() => {
		initAppWindow();
		setAOT($userSettings.base.alwaysOnTop);
	});
</script>
