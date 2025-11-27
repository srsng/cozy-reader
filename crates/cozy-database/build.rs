fn main() {
    // 输出所有 rerun-if-changed 检查（必须在 main 函数中直接调用）
    if let Err(e) = cozy_database_codegen::output_rerun_if_changed() {
        eprintln!("错误: 输出 rerun-if-changed 检查失败: {}", e);
        std::process::exit(1);
    }

    // 调用 codegen 工具生成枚举、实体和类型
    // 1. 先生成枚举（无依赖的基础类型）
    if let Err(e) = cozy_database_codegen::generate_enums() {
        eprintln!("错误: 生成枚举失败: {}", e);
        std::process::exit(1);
    }

    // 2. 再生成实体（可能引用枚举类型）
    if let Err(e) = cozy_database_codegen::generate_entities() {
        eprintln!("错误: 生成实体失败: {}", e);
        std::process::exit(1);
    }

    if let Err(e) = cozy_database_codegen::export_types() {
        eprintln!("错误: 导出类型失败: {}", e);
        std::process::exit(1);
    }
}
