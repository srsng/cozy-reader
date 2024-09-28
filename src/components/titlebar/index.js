import { Window } from "@tauri-apps/api/window";
import {
  restoreStateCurrent,
  saveWindowState,
  StateFlags,
} from '@tauri-apps/plugin-window-state';

function initAppWindow() {
  // console.log("initAppWindow");
  // 恢复窗口状态
  restoreStateCurrent(StateFlags.ALL);

  const appWindow = new Window("main");
  document
    .getElementById("titlebar-minimize")
    ?.addEventListener("click", () => appWindow.minimize());
  document
    .getElementById("titlebar-maximize")
    ?.addEventListener("click", () => appWindow.toggleMaximize());
  document
    .getElementById("titlebar-close")
    ?.addEventListener("click", () => appWindow.close());
  return appWindow;
}

function destroyAppWindow() {
  // 监听窗口关闭事件
  appWindow.listen('close-requested', async (event) => {
    // console.log("destroyAppWindow");
    // 保存窗口状态
    saveWindowState(StateFlags.ALL);
    
    await appWindow.close();
  });
}

export default initAppWindow;
