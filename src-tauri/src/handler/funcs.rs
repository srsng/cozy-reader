#[tauri::command(rename_all = "snake_case")]
pub fn exit_app() -> tauri::Result<()> {
    // save data

    std::process::exit(0);
}
