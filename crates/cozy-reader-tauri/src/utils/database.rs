use cozy_database::{DatabaseConfig, DATABASES};
use tauri::{plugin::TauriPlugin, Runtime};

pub fn build_database_sql_plugin<R: Runtime>(
) -> TauriPlugin<R, Option<tauri_plugin_sql::PluginConfig>> {
    // init
    let mut sql_builder = tauri_plugin_sql::Builder::default();

    // 注册所有数据库
    for db in cozy_database::DATABASES {
        sql_builder =
            sql_builder.add_migrations(&format!("sqlite:{}", db.filename), (db.migrations)());
    }
    sql_builder.build()
}

/// 获取所有数据库配置
#[tauri::command]
pub fn get_database_configs() -> Vec<DatabaseConfig> {
    DATABASES.iter().map(DatabaseConfig::from).collect()
}
