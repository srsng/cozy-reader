pub mod database;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();

    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools)
        // .plugin(tauri_plugin_log::Builder::new().build());
    }

    // #[cfg(desktop)]
    // {
    //     builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
    //         let _ = app
    //             .get_webview_window("main")
    //             .expect("no main window")
    //             .set_focus();
    //     }));
    // }

    builder
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin({
            let mut sql_builder = tauri_plugin_sql::Builder::default();
            for db in cozy_database::DATABASES {
                sql_builder = sql_builder
                    .add_migrations(&format!("sqlite:{}", db.filename), (db.migrations)());
            }
            sql_builder.build()
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            utils::fs::read_file_to_string,
            utils::fs::fs_exists,
            database::commands::get_database_configs,
            // Book CRUD
            database::books::commands::create_book,
            database::books::commands::get_book,
            database::books::commands::list_books,
            database::books::commands::update_book,
            database::books::commands::delete_book,
            database::books::commands::soft_delete_book,
            database::books::commands::hard_delete_book,
            database::books::commands::restore_book,
            // Comment CRUD
            database::books::commands::create_comment,
            database::books::commands::get_comment,
            database::books::commands::list_comments,
            database::books::commands::update_comment,
            database::books::commands::delete_comment,
            database::books::commands::soft_delete_comment,
            database::books::commands::hard_delete_comment,
            database::books::commands::restore_comment,
            // ReadingSession CRUD
            database::books::commands::create_reading_session,
            database::books::commands::get_reading_session,
            database::books::commands::list_reading_sessions,
            database::books::commands::update_reading_session,
            database::books::commands::delete_reading_session,
            database::books::commands::soft_delete_reading_session,
            database::books::commands::hard_delete_reading_session,
            database::books::commands::restore_reading_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
