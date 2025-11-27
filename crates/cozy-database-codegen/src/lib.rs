pub mod export_types;
pub mod generate_entities;
pub mod generate_enums;

pub use export_types::export_types;
pub use generate_entities::generate_entities;
pub use generate_enums::generate_enums;

/// 输出所有 rerun-if-changed 检查
/// 必须在 build.rs 的 main 函数中调用，确保 Cargo 能正确捕获这些指令
pub fn output_rerun_if_changed() -> Result<(), Box<dyn std::error::Error>> {
    use std::env;
    use std::path::PathBuf;

    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let project_root = if manifest_dir.ends_with("cozy-reader-tauri") {
        manifest_dir.parent().unwrap().parent().unwrap()
    } else if manifest_dir.ends_with("cozy-database") {
        manifest_dir.parent().unwrap()
    } else {
        manifest_dir.parent().unwrap().parent().unwrap()
    };
    let database_dir = project_root.join("crates/cozy-database");

    // 检查 config.rs（数据库配置变更）
    let config_file = database_dir.join("src/config.rs");
    println!("cargo:rerun-if-changed={}", config_file.display());

    // 检查 error.rs（错误类型定义）
    let error_file = database_dir.join("src/error.rs");
    println!("cargo:rerun-if-changed={}", error_file.display());

    // 扫描所有数据库
    let databases = generate_entities::discover_databases(&database_dir)?;

    for db_name in &databases {
        // 检查 migrations 目录和 SQL 文件
        let migrations_dir = database_dir.join(format!("src/{}/migrations", db_name));
        println!("cargo:rerun-if-changed={}", migrations_dir.display());

        // 扫描 SQL 文件
        let sql_files = generate_entities::scan_sql_files(&migrations_dir)?;
        for sql_file in &sql_files {
            println!("cargo:rerun-if-changed={}", sql_file.display());
        }

        // 检查 services 目录（手动编写的代码）
        println!(
            "cargo:rerun-if-changed={}",
            database_dir
                .join(format!("src/{}/services", db_name))
                .display()
        );

        // ❌ 不检查 entities/ 和 enums/ 目录（生成的文件，会导致循环构建）
    }

    Ok(())
}
