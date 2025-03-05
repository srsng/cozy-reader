#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod setup;

// use tauri::api::shell;
// use tauri::{CustomMenuItem, Manager, Menu, Submenu};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![])
        .setup(setup::setup_app)
        .run(ctx)
        .expect("error while running tauri application");
}
