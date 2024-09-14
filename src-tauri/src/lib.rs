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
        // .plugin(tauri_plugin_store::Builder::new().build())
        // .plugin(tauri_plugin_updater::Builder::new().build())
        // .plugin(tauri_plugin_fs::init())
        // .plugin(tauri_plugin_dialog::init())
        // .plugin(tauri_plugin_clipboard_manager::init())
        // .plugin(tauri_plugin_os::init())
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // .plugin(tauri_plugin_shell::init())
        // .plugin(tauri_plugin_notification::init())
        // .plugin(tauri_plugin_process::init())
        // .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![])
        // .menu(
        //     tauri::Menu::os_default("Tauri Vue Template").add_submenu(Submenu::new(
        //         "Help",
        //         Menu::with_items([CustomMenuItem::new(
        //             "Online Documentation",
        //             "Online Documentation",
        //         )
        //         .into()]),
        //     )),
        // )
        // .on_menu_event(|event| {
        //     let event_name = event.menu_item_id();
        //     match event_name {
        //         "Online Documentation" => {
        //             let url = "https://github.com/Uninen/tauri-vue-template".to_string();
        //             shell::open(&event.window().shell_scope(), url, None).unwrap();
        //         }
        //         _ => {}
        //     }
        // })
        .setup(setup::setup_app)
        .run(ctx)
        .expect("error while running tauri application");
}
