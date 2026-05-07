# cozy-database-codegen

构建时代码生成器，作为 `cozy-database` 的 build dependency 使用。

`cozy-database/build.rs` 调用本 crate 的两个函数，根据`packages/database/drizzle/{db}/migrations/`生成对应rs，以便`cozy-reader-tauri`通过tauri_plugin_sql注册所有数据库与对应迁移sql:

- `setup_rerun_if_changed(project_root)` — 注册 Cargo 文件监听
- `generate_all_db_modules(project_root)` — 扫描 `packages/database/drizzle/{db}/migrations/` 下的 `.sql` 文件，生成 `src/db/{db}.rs`（含 `include_str!` 的迁移函数 + `DatabaseDefinition` 常量）和 `src/db/mod.rs`（含 `DATABASES` 常量）
