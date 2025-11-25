use crate::database::DATABASES;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConfigResponse {
    pub name: String,
    pub filename: String,
    pub wal: bool,
}

#[tauri::command]
pub fn get_database_configs() -> Vec<DatabaseConfigResponse> {
    DATABASES
        .iter()
        .map(|db| DatabaseConfigResponse {
            name: db.name.to_string(),
            filename: db.filename.to_string(),
            wal: db.wal,
        })
        .collect()
}
