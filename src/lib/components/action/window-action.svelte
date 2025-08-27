<script lang="ts" module>
	import { Window } from '@tauri-apps/api/window';
	import { SHORTCUT_SERVICE } from '$lib/shortcuts/shortcutService';
	import { inject } from '$lib/utils/context';
	import { mergeUnlisten } from '$lib/utils/mergeUnlisten';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { onMount } from 'svelte';
	import { APP_STATE } from '$lib/stores/appState';
	import { emit } from '@tauri-apps/api/event';
	import { SHORTCUT_EVENT } from '$lib/shortcuts/shortcutService';
	import {
		restoreStateCurrent,
		saveWindowState,
		StateFlags
	} from '@tauri-apps/plugin-window-state';

	// 恢复窗口状态
	function restoreAppWindowState() {
		restoreStateCurrent(StateFlags.ALL);
	}

	// 保存窗口状态
	function saveAppWindowState() {
		saveWindowState(StateFlags.ALL);
	}

	// 刷新页面
	function refreshWindow() {
		saveAppWindowState();
		window.location.reload(); // note: 不是appwindow
	}

	export type mainWindowOperator =
		| 'minimize'
		| 'maximize'
		| 'close'
		| 'toggle-always-on-top'
		| 'fullscreen'
		| 'refresh-page'
		| 'save-window-state'
		| 'restore-window-state';

	const mainWOp2Event: Record<mainWindowOperator, string> = {
		minimize: 'main-window-minimize',
		maximize: 'main-window-maximize',
		close: 'main-window-close',
		'toggle-always-on-top': 'main-window-toggle-always-on-top',
		fullscreen: 'main-window-fullscreen',
		'refresh-page': 'main-window-refresh-page',
		'save-window-state': 'main-window-save-window-state',
		'restore-window-state': 'main-window-restore-window-state'
	};

	export function emitMainWindowEvent(event: mainWindowOperator) {
		emit(SHORTCUT_EVENT, mainWOp2Event[event]);
	}
</script>

<script lang="ts">
	const userSettings = inject(USER_SETTINGS);
	const shortcutService = inject(SHORTCUT_SERVICE);

	// todo: 应该是main window 还是current window？
	// import { getCurrentWindow } from '@tauri-apps/api/window';
	const appWindow = new Window('main');

	// 设置置顶
	function setAOT(aot: boolean) {
		appWindow.setAlwaysOnTop(aot);
	}

	const appState = inject(APP_STATE);
	// 切换全屏
	export function fullscreenWindow() {
		if (document.fullscreenElement) {
			$appState.fullscreen = false;
			document.exitFullscreen();
		} else {
			$appState.fullscreen = true;
			document.documentElement.requestFullscreen();
		}
	}

	// 初始化窗口
	function initAppWindow() {
		restoreAppWindowState();
		destroyAppWindowListener();
		setAOT($userSettings.base.alwaysOnTop);
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
				saveAppWindowState();
				appWindow.toggleMaximize();
			}),
			shortcutService.on(mainWOp2Event.close, () => {
				appWindow.close();
			}),
			// main 始终至于顶层
			shortcutService.on(mainWOp2Event['toggle-always-on-top'], () => {
				$userSettings.base.alwaysOnTop = !$userSettings.base.alwaysOnTop;
				setAOT($userSettings.base.alwaysOnTop);
			}),
			// main 全屏
			shortcutService.on(mainWOp2Event.fullscreen, () => {
				saveAppWindowState();
				fullscreenWindow();
			}),
			// main 刷新页面
			shortcutService.on(mainWOp2Event['refresh-page'], () => {
				refreshWindow();
			}),
			// main 保存窗口状态
			shortcutService.on(mainWOp2Event['save-window-state'], () => {
				saveAppWindowState();
			}),
			// main 恢复窗口状态
			shortcutService.on(mainWOp2Event['restore-window-state'], () => {
				restoreAppWindowState();
			})
		)
	);

	onMount(() => {
		initAppWindow();
	});
</script>
