import { Window } from "@tauri-apps/api/window";

function initAppWindow() {
  // console.log("initAppWindow");

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

export default initAppWindow;
