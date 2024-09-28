import {
  restoreStateCurrent,
  saveWindowState,
  StateFlags,
} from '@tauri-apps/plugin-window-state';

export function initAppWindow() {
  // console.log("initAppWindow");
  // 恢复窗口状态
  restoreStateCurrent(StateFlags.ALL);
  destroyAppWindowListener();
  return appWindow;
}

// 保存窗口状态
export function saveAppWindowState() {
  saveWindowState(StateFlags.ALL);
}

// 监听窗口关闭事件
function destroyAppWindowListener() {
  appWindow.listen('close-requested', async (event) => {
    // console.log("destroyAppWindow");
    saveAppWindowState();
    await appWindow.close();
  });
}

export default {initAppWindow, saveAppWindowState};
