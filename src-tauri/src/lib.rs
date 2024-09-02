#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

use serde::de;
use serde_json::json;
use tauri::{Manager, Wry};
use tauri_plugin_store::{with_store, StoreCollection};

pub mod handler {
    pub mod file;
    pub mod funcs;
}
pub mod theme {
    pub mod theme;
}

// use tauri::api::shell;
// use tauri::{CustomMenuItem, Manager, Menu, Submenu};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
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
        // .setup(|_app| {
        //     #[cfg(debug_assertions)]
        //     {
        //         let main_window = _app.get_window("main").unwrap();
        //         main_window.open_devtools();
        //     }
        //     Ok(())
        // })
        .setup(|app| {
            let stores = app.app_handle().state::<StoreCollection<Wry>>();
            let path = PathBuf::from("store.bin");

            let _ = with_store(app.app_handle().clone(), stores, path, |store| {
                if !store.has("app-theme") {
                    let default_theme = theme::theme::default_theme();
                    store.insert("app-theme".to_string(), default_theme)?;
                    store.save()?;
                } else {
                    // 通过序列化检查主题的值是否有效，如果无效则重置为默认值。
                    if let Err(_e) = serde_json::to_string(store.get("app-theme").unwrap()) {
                        let default_theme = theme::theme::default_theme();
                        store.insert("app-theme".to_string(), default_theme)?;
                        store.save()?;
                    }
                }
                // store.insert("some-key".to_string(), json!({ "value": 5 }))?;

                // 从 Store 中获取一个值。
                // let value = store.get("some-key").expect("Failed to get value from store");
                // println!("{}", value); // {"value":5}
                Ok(())
            });

            Ok(())
        })
        .run(ctx)
        .expect("error while running tauri application");
    // tauri::Builder::default()
    //     .plugin(tauri_plugin_store::Builder::new().build())
    //     .plugin(tauri_plugin_shell::init())
    //     .invoke_handler(tauri::generate_handler![send_epub2, exit_app])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
