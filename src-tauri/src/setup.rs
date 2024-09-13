use std::{error::Error, path::PathBuf};
use tauri::App;

use serde_json::json;
use tauri::{Manager, Wry};
use tauri_plugin_store::{with_store, StoreCollection};

use crate::theme::theme::default_theme;

pub fn setup_app(app: &mut App) -> Result<(), Box<dyn Error>> {
    // setup_theme_store(app)?;
    Ok(())
}

pub fn setup_theme_store(app: &mut App) -> Result<(), Box<dyn Error>> {
    let stores = app.app_handle().state::<StoreCollection<Wry>>();
    let path = PathBuf::from("theme_store.bin");

    let _ = with_store(app.app_handle().clone(), stores, path, |store| {
        #[cfg(debug_assertions)]
        {
            println!("store: {:?}", store);

            if !store.has("app-theme") {
                println!("1");
            } else {
                if *store.get("app-theme").unwrap() == json!({}) {
                    println!("2");
                }
                if serde_json::to_string(store.get("app-theme").unwrap()).is_err() {
                    println!("3");
                }
            }
        }

        // 需要重置为默认值的情况：不存在该键. 值为空{}或者该键的值无法序列化
        if !store.has("app-theme")
            || *store.get("app-theme").unwrap() == json!({})
            || serde_json::to_string(store.get("app-theme").unwrap()).is_err()
        {
            #[cfg(debug_assertions)]
            println!("重置主题文件");

            let default_theme = default_theme();
            store.insert("app-theme".to_string(), default_theme)?;
            store.save()?;
        }
        Ok(())
    });

    Ok(())
}
