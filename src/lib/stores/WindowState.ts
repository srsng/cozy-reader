// when using `"withGlobalTauri": true`, you may use
// const { restoreStateCurrent, StateFlags } = window.__TAURI__.windowState;

import { Window } from '@tauri-apps/api/window';
import { restoreStateCurrent, saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state';

const appWindow = new Window('main');

export function initAppWindow() {
	// console.log("initAppWindow");
	// 恢复窗口状态
	restoreStateCurrent(StateFlags.ALL);
	destroyAppWindowListener();
}

// 保存窗口状态
export function saveAppWindowState() {
	// console.log("save window state.");
	saveWindowState(StateFlags.ALL);
}

// 监听窗口关闭事件
function destroyAppWindowListener() {
	appWindow.listen('close-requested', async (_event: any) => {
		// console.log("destroyAppWindow");
		saveAppWindowState();
		await appWindow.close();
	});
}
export default { initAppWindow, saveAppWindowState };
