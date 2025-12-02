use cozy_database_codegen::{generate_all_db_modules, setup_rerun_if_changed};
use std::env;
use std::path::PathBuf;

fn main() {
    // 获取项目根目录
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let project_root = manifest_dir.parent().unwrap().parent().unwrap();

    setup_rerun_if_changed(project_root);

    // 生成 db 模块（包括 mod.rs）
    if let Err(e) = generate_all_db_modules(project_root) {
        eprintln!("错误: 生成 db 模块失败: {}", e);
        std::process::exit(1);
    }
}
