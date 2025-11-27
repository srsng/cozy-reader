use regex::Regex;
use rusqlite::Connection;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tempfile::NamedTempFile;
use urlencoding::encode;

use crate::generate_enums::{extract_enums_from_sql, EnumInfo};

/// 扫描 SQL 文件
pub(crate) fn scan_sql_files(
    migrations_dir: &Path,
) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
    let mut files = Vec::new();
    let entries = fs::read_dir(migrations_dir)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "sql" {
                    files.push(path);
                }
            }
        }
    }

    files.sort();
    Ok(files)
}

/// 获取所有数据库名称（从文件系统扫描）
pub(crate) fn discover_databases(
    database_dir: &Path,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let src_dir = database_dir.join("src");
    let mut databases = Vec::new();

    if !src_dir.exists() {
        return Ok(databases);
    }

    let entries = fs::read_dir(&src_dir)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let dir_name = path.file_name().unwrap().to_string_lossy();
        if dir_name == "bin" || dir_name.starts_with('.') {
            continue;
        }

        // 检查是否包含 migrations 目录
        let migrations_dir = path.join("migrations");
        if migrations_dir.exists() && migrations_dir.is_dir() {
            // 检查 migrations 目录中是否有 SQL 文件
            if !scan_sql_files(&migrations_dir)?.is_empty() {
                databases.push(dir_name.to_string());
            }
        }
    }

    Ok(databases)
}

/// 转换为小驼峰命名
fn to_camel_case(s: &str) -> String {
    let parts: Vec<&str> = s.split('_').collect();
    if parts.is_empty() {
        return String::new();
    }

    let mut result = String::new();
    for (i, part) in parts.iter().enumerate() {
        if part.is_empty() {
            continue;
        }
        if i == 0 {
            // 首字母小写
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.push_str(&first.to_lowercase().to_string());
                result.push_str(chars.as_str());
            }
        } else {
            // 后续部分首字母大写
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.push_str(&first.to_uppercase().to_string());
                result.push_str(chars.as_str());
            }
        }
    }
    result
}

/// 移除实体后缀并转换为单数形式
fn normalize_entity_name(s: &str) -> String {
    let name = s.strip_suffix(".rs").unwrap_or(s);
    let name = name.strip_suffix("Entity").unwrap_or(name);

    // 简单的单数转换（可以扩展）
    let name = if name.ends_with('s') && name.len() > 1 {
        &name[..name.len() - 1]
    } else {
        name
    };

    to_camel_case(name)
}

/// 从文件名提取实体名
fn extract_entity_name_from_file(file_name: &str) -> String {
    let base_name = file_name.strip_suffix(".rs").unwrap_or(file_name);
    normalize_entity_name(base_name)
}

/// 生成实体
pub fn generate_entities() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== 生成 Rust 实体（Database-First，多数据库支持）===");

    // 设置路径（从 build.rs 调用时，manifest_dir 是调用项目的目录）
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    // 如果是从 tauri build.rs 调用，manifest_dir 是 crates/cozy-reader-tauri
    // 如果是从 database build.rs 调用，manifest_dir 是 crates/cozy-database
    // 如果是从 codegen 直接调用，manifest_dir 是 crates/cozy-database-codegen
    let project_root = if manifest_dir.ends_with("cozy-reader-tauri") {
        manifest_dir.parent().unwrap().parent().unwrap()
    } else if manifest_dir.ends_with("cozy-database") {
        manifest_dir.parent().unwrap()
    } else {
        manifest_dir.parent().unwrap().parent().unwrap()
    };
    let database_dir = project_root.join("crates/cozy-database");

    // 扫描所有数据库
    let databases = discover_databases(&database_dir)?;

    if databases.is_empty() {
        eprintln!("错误: 未找到任何数据库模块");
        return Err("未找到任何数据库模块".into());
    }

    println!("发现 {} 个数据库: {:?}", databases.len(), databases);

    // 为每个数据库生成实体
    for db_name in &databases {
        println!("\n=== 处理数据库: {} ===", db_name);
        generate_entities_for_db(db_name, &database_dir, project_root)?;
    }

    println!("\n=== 所有数据库实体生成完成 ===");
    Ok(())
}

/// 为单个数据库生成实体
fn generate_entities_for_db(
    db_name: &str,
    database_dir: &Path,
    project_root: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let migrations_dir = database_dir.join(format!("src/{}/migrations", db_name));
    let entities_dir = database_dir.join(format!("src/{}/entities", db_name));

    println!("创建临时数据库并执行迁移...");

    // 查找所有 SQL 迁移文件（按文件名排序）
    let sql_files = scan_sql_files(&migrations_dir)?;

    if sql_files.is_empty() {
        eprintln!("警告: 数据库 {} 没有找到 SQL 迁移文件", db_name);
        return Ok(());
    }

    // 合并所有 SQL 文件
    let mut sql = String::new();
    for sql_file in &sql_files {
        let content = fs::read_to_string(sql_file)?;
        sql.push_str(&content);
        sql.push('\n');
    }

    // 提取枚举信息（用于后续应用到实体字段）
    let enums = extract_enums_from_sql(&sql);

    // 移除注释行
    let cleaned_sql: String = sql
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.starts_with("--") && !trimmed.is_empty()
        })
        .collect::<Vec<_>>()
        .join("\n");

    // 创建临时文件在项目目录下（避免 Windows 临时目录路径问题）
    let temp_dir = project_root.join("target");
    fs::create_dir_all(&temp_dir)?;
    let temp_db = NamedTempFile::new_in(&temp_dir)?;
    let temp_db_path = temp_db.path();

    // 创建数据库连接并执行 SQL
    let conn = Connection::open(temp_db_path)?;
    conn.execute_batch(&cleaned_sql)?;
    println!("SQL 迁移执行成功");

    println!("使用 sea-orm-cli 生成实体...");

    // 使用临时目录生成实体
    let temp_output_dir = temp_dir.join("entity_temp");
    fs::create_dir_all(&temp_output_dir)?;

    // 尝试 URL 编码路径
    let db_path = temp_db_path.canonicalize()?;
    let db_path_str = db_path.to_string_lossy();

    // URL 编码路径，然后使用 sqlite: 协议
    let normalized_path = db_path_str.replace('\\', "/");
    let encoded_path = encode(&normalized_path);
    let db_url = format!("sqlite:{}", encoded_path);

    let output = Command::new("sea-orm-cli")
        .current_dir(project_root)
        .args([
            "generate",
            "entity",
            "--database-url",
            &db_url,
            "--output-dir",
            temp_output_dir
                .strip_prefix(project_root)
                .unwrap_or(&temp_output_dir)
                .to_str()
                .unwrap(),
            "--lib",
        ])
        .output()?;

    if !output.status.success() {
        eprintln!("错误: sea-orm-cli 生成失败");
        eprintln!("stdout: {}", String::from_utf8_lossy(&output.stdout));
        eprintln!("stderr: {}", String::from_utf8_lossy(&output.stderr));
        return Err("sea-orm-cli 生成失败".into());
    }

    println!("处理生成的实体文件...");

    // 扫描生成的实体文件
    let mut entity_mappings = Vec::new();
    let entries = fs::read_dir(&temp_output_dir)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                if file_name.ends_with(".rs")
                    && file_name != "mod.rs"
                    && file_name != "lib.rs"
                    && file_name != "prelude.rs"
                {
                    // 提取实体名并转换为小驼峰：books.rs -> book.ts
                    let entity_name = extract_entity_name_from_file(file_name);
                    let ts_name = format!("{}.ts", entity_name);
                    entity_mappings.push((file_name.to_string(), ts_name));
                }
            }
        }
    }

    for (entity_file, ts_file) in &entity_mappings {
        let temp_file = temp_output_dir.join(entity_file);
        if !temp_file.exists() {
            continue;
        }

        let content = fs::read_to_string(&temp_file)?;
        let processed = process_entity_file(&content, ts_file, db_name, &enums)?;

        // 写入到最终位置
        fs::create_dir_all(&entities_dir)?;
        let final_file = entities_dir.join(entity_file);
        fs::write(&final_file, processed)?;
        println!("处理完成: {:?}", final_file);
    }

    // 更新 mod.rs
    update_mod_rs(&entities_dir)?;

    // // 显式删除 lib.rs 和 prelude.rs（如果存在）
    // let lib_file = entities_dir.join("lib.rs");
    // let prelude_file = entities_dir.join("prelude.rs");
    // if lib_file.exists() {
    //     fs::remove_file(&lib_file)?;
    //     println!("已删除多余文件: {:?}", lib_file);
    // }
    // if prelude_file.exists() {
    //     fs::remove_file(&prelude_file)?;
    //     println!("已删除多余文件: {:?}", prelude_file);
    // }

    // ts-rs 会自动生成 TypeScript 类型文件，不需要手动处理

    println!("数据库 {} 的实体生成成功", db_name);
    Ok(())
}

fn process_entity_file(
    content: &str,
    ts_file: &str,
    db_name: &str,
    enums: &[EnumInfo],
) -> Result<String, Box<dyn std::error::Error>> {
    let mut result = String::new();

    // 添加文件头注释
    result.push_str("//! 此文件由 cozy-database-codegen 自动生成，请勿手动修改\n");
    result.push_str(
        "//! This file is auto-generated by cozy-database-codegen, do not edit manually\n\n",
    );

    // 添加新的导入
    result.push_str("use sea_orm::entity::prelude::*;\n");
    result.push_str("use serde::{Deserialize, Serialize};\n");
    result.push_str("use ts_rs::TS;\n\n");

    // 移除原有的导入和文档注释行，保留其他内容（包括字段间的空行）
    let mut found_first_non_import = false;
    for line in content.lines() {
        let trimmed = line.trim();
        if !found_first_non_import {
            if trimmed.starts_with("use ") || trimmed.starts_with("//!") {
                continue; // 跳过原有的导入和文档注释
            }
            // 不要跳过空行，因为可能包含字段间的空行
            found_first_non_import = true;
        }
        // 跳过重复的导入行
        if trimmed == "use sea_orm::entity::prelude::*;" {
            continue;
        }
        result.push_str(line);
        result.push('\n');
    }

    // 查找并替换 Model 结构体的 derive
    let derive_pattern = Regex::new(r"#\[derive\(([^)]+)\)\]")?;
    let mut processed = derive_pattern
        .replace_all(&result, |caps: &regex::Captures| {
            let derives = caps.get(1).unwrap().as_str();
            if derives.contains("DeriveEntityModel") {
                // 检查是否已经有 Serialize, Deserialize, TS
                let has_serde = derives.contains("Serialize") || derives.contains("Deserialize");
                let has_ts = derives.contains("TS");

                let mut new_derives = derives.to_string();
                if !has_serde {
                    new_derives = format!("{}, Serialize, Deserialize", new_derives);
                }
                if !has_ts {
                    new_derives = format!("{}, TS", new_derives);
                }

                format!("#[derive({})]", new_derives)
            } else {
                caps[0].to_string()
            }
        })
        .to_string();

    // 查找 table_name 属性，添加 ts 属性
    // 更新导出路径到 entities/ 目录，文件名使用小驼峰
    // ts-rs 的 export_to 路径是相对于 Cargo.toml 所在目录的（crates/cozy-database/）
    // 所以从 crates/cozy-database/ 到 packages/database/src/types/generated/... 应该是 ../../packages/...
    let table_pattern = Regex::new(r#"#\[sea_orm\(table_name\s*=\s*"(\w+)"\)\]"#)?;
    let ts_export_path = format!(
        "../../packages/database/src/types/generated/{}/entities/{}",
        db_name, ts_file
    );

    // 提取表名（用于枚举匹配）
    let table_name = table_pattern
        .captures(&processed)
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().to_string());

    processed = table_pattern
        .replace(&processed, |caps: &regex::Captures| {
            format!(
                "#[sea_orm(table_name = \"{}\")]\n#[ts(export, export_to = \"{}\")]",
                caps.get(1).unwrap().as_str(),
                ts_export_path
            )
        })
        .to_string();

    // 先修复主键字段类型：将 Option<i32> 改为 i32
    processed = processed.replace("pub id: Option<i32>,", "pub id: i32,");

    // 为字段添加 ts 类型注解（先添加，后续会更新枚举字段的注解）
    processed = add_ts_annotations(&processed)?;

    // 应用枚举类型到字段（如果有匹配的枚举）
    // 这会在 add_ts_annotations 之后执行，以便更新已添加的 TypeScript 类型注解
    if let Some(table) = &table_name {
        processed = apply_enum_types(&processed, table, db_name, enums)?;
    }

    // 修复主键的 ts 类型注解（从 "number | null" 改为 "number"）
    // 匹配 #[ts(type = "number | null")] 后跟 #[sea_orm(primary_key)]
    let primary_key_ts_pattern = Regex::new(
        r#"#\[ts\(type\s*=\s*"number\s*\|\s*null"\)\]\s*\n\s*#\[sea_orm\(primary_key\)\]"#,
    )?;
    processed = primary_key_ts_pattern
        .replace_all(
            &processed,
            "#[sea_orm(primary_key)]\n    #[ts(type = \"number\")]",
        )
        .to_string();
    // 匹配 #[sea_orm(primary_key)] 后跟 #[ts(type = "number | null")]
    let primary_key_ts_pattern2 = Regex::new(
        r#"#\[sea_orm\(primary_key\)\]\s*\n\s*#\[ts\(type\s*=\s*"number\s*\|\s*null"\)\]"#,
    )?;
    processed = primary_key_ts_pattern2
        .replace_all(
            &processed,
            "#[sea_orm(primary_key)]\n    #[ts(type = \"number\")]",
        )
        .to_string();

    // 在字段之间添加空行
    processed = add_field_newlines(&processed)?;

    Ok(processed)
}

/// 应用枚举类型到实体字段
fn apply_enum_types(
    content: &str,
    table_name: &str,
    db_name: &str,
    enums: &[EnumInfo],
) -> Result<String, Box<dyn std::error::Error>> {
    let mut result = content.to_string();
    let mut enum_imports = Vec::new();

    // 查找匹配的枚举（根据表名和字段名）
    for enum_info in enums {
        if enum_info.table == table_name {
            // 匹配字段：pub field_name: String, 或 pub field_name: Option<String>,
            // 字段可能在属性之后，需要匹配字段名和类型
            let enum_type = &enum_info.name;
            let field_name = &enum_info.column;

            let mut field_found = false;

            // 处理 Option<String> 的情况（需要匹配可能的属性）
            let optional_pattern = Regex::new(&format!(
                r"(#\[.*?\]\s*\n\s*)*pub\s+{}\s*:\s*Option<String>",
                regex::escape(field_name)
            ))?;
            if optional_pattern.is_match(&result) {
                field_found = true;
                // 替换字段类型，保留属性
                result = optional_pattern
                    .replace_all(&result, |caps: &regex::Captures| {
                        let attrs = caps.get(1).map(|m| m.as_str()).unwrap_or("");
                        format!("{}pub {}: Option<{}>", attrs, field_name, enum_type)
                    })
                    .to_string();
            } else {
                // 处理 String 的情况（需要匹配可能的属性）
                let required_pattern = Regex::new(&format!(
                    r"(#\[.*?\]\s*\n\s*)*pub\s+{}\s*:\s*String",
                    regex::escape(field_name)
                ))?;
                if required_pattern.is_match(&result) {
                    field_found = true;
                    result = required_pattern
                        .replace_all(&result, |caps: &regex::Captures| {
                            let attrs = caps.get(1).map(|m| m.as_str()).unwrap_or("");
                            format!("{}pub {}: {}", attrs, field_name, enum_type)
                        })
                        .to_string();
                }
            }

            // 如果找到了匹配的字段，更新 TypeScript 类型注解
            if field_found {
                // 更新 TypeScript 类型注解
                // 查找 #[ts(type = "string")] 或 #[ts(type = "string | null")]
                let ts_string_pattern = Regex::new(&format!(
                    r#"#\[ts\(type\s*=\s*"string"\)\]\s*\n\s*pub\s+{}"#,
                    regex::escape(field_name)
                ))?;
                result = ts_string_pattern
                    .replace_all(
                        &result,
                        &format!("#[ts(type = \"{}\")]\n    pub {}", enum_type, field_name),
                    )
                    .to_string();

                let ts_string_null_pattern = Regex::new(&format!(
                    r#"#\[ts\(type\s*=\s*"string\s*\|\s*null"\)\]\s*\n\s*pub\s+{}"#,
                    regex::escape(field_name)
                ))?;
                result = ts_string_null_pattern
                    .replace_all(
                        &result,
                        &format!(
                            "#[ts(type = \"{} | null\")]\n    pub {}",
                            enum_type, field_name
                        ),
                    )
                    .to_string();

                // 添加枚举导入（完整格式：use crate::...）
                let import_path = format!("use crate::{}::enums::{};", db_name, enum_type);
                if !enum_imports.contains(&import_path) {
                    enum_imports.push(import_path);
                }
            }
        }
    }

    // 添加枚举导入（在 use ts_rs::TS; 之后）
    if !enum_imports.is_empty() {
        // 构建导入字符串，每个导入一行
        let imports_str: String = enum_imports
            .iter()
            .map(|imp| format!("{}\n", imp))
            .collect();

        // 尝试匹配 use ts_rs::TS;\n（后面可能有空行）
        let use_pattern = Regex::new(r"(use ts_rs::TS;\n)(\n*)")?;
        if let Some(caps) = use_pattern.captures(&result) {
            let after_ts = caps.get(2).map(|m| m.as_str()).unwrap_or("");
            result = use_pattern
                .replace(
                    &result,
                    &format!("use ts_rs::TS;\n{}{}", imports_str, after_ts),
                )
                .to_string();
        } else {
            // 如果找不到 use ts_rs::TS;，在 use serde 之后添加
            let serde_pattern = Regex::new(r"(use serde::\{Deserialize, Serialize\};\n)(\n*)")?;
            if let Some(caps) = serde_pattern.captures(&result) {
                let after_serde = caps.get(2).map(|m| m.as_str()).unwrap_or("");
                result = serde_pattern
                    .replace(
                        &result,
                        &format!(
                            "use serde::{{Deserialize, Serialize}};\n{}{}",
                            imports_str, after_serde
                        ),
                    )
                    .to_string();
            } else {
                // 如果都找不到，在第一个 use 语句之后添加
                let first_use_pattern = Regex::new(r"(use [^;]+;\n)(\n*)")?;
                if let Some(caps) = first_use_pattern.captures(&result) {
                    let first_use = caps.get(1).unwrap().as_str();
                    let after_first = caps.get(2).map(|m| m.as_str()).unwrap_or("");
                    result = first_use_pattern
                        .replace(
                            &result,
                            &format!("{}{}{}", first_use, imports_str, after_first),
                        )
                        .to_string();
                }
            }
        }
    }

    Ok(result)
}

fn add_field_newlines(content: &str) -> Result<String, Box<dyn std::error::Error>> {
    let mut result = String::new();
    let lines: Vec<&str> = content.lines().collect();
    let mut i = 0;
    let mut in_struct = false;
    let mut brace_depth = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();
        let mut should_add_newline = false;

        // 检测 struct Model 开始
        if trimmed.starts_with("pub struct Model") {
            in_struct = true;
            brace_depth = 0;
        }

        if in_struct {
            // 计算大括号深度
            for ch in line.chars() {
                if ch == '{' {
                    brace_depth += 1;
                } else if ch == '}' {
                    brace_depth -= 1;
                    if brace_depth == 0 {
                        in_struct = false;
                    }
                }
            }

            // 如果当前行是字段定义结束（以 , 结尾），且还在结构体内
            if trimmed.ends_with(',') && brace_depth > 0 && i + 1 < lines.len() {
                let next_line = lines[i + 1].trim();
                // 如果下一行是属性（#[...]），说明是下一个字段的开始
                if next_line.starts_with("#[") {
                    // 检查当前行和下一行之间是否已经有空行
                    let mut has_empty_line = false;
                    let mut j = i + 1;
                    while j < lines.len() && j < i + 3 {
                        if lines[j].trim().is_empty() {
                            has_empty_line = true;
                            break;
                        }
                        // 如果遇到下一个字段的 pub，说明已经到下一个字段了
                        if lines[j].trim().starts_with("pub ") {
                            break;
                        }
                        j += 1;
                    }
                    // 如果没有空行，添加一个
                    if !has_empty_line {
                        should_add_newline = true;
                    }
                }
            }
        }

        result.push_str(line);
        result.push('\n');

        if should_add_newline {
            result.push('\n');
        }

        i += 1;
    }

    Ok(result)
}

fn add_ts_annotations(content: &str) -> Result<String, Box<dyn std::error::Error>> {
    let mut result = String::new();
    let mut in_model = false;
    let mut brace_depth = 0;

    for line in content.lines() {
        let trimmed = line.trim();

        // 检测 Model 结构体开始
        if trimmed.starts_with("pub struct Model") {
            in_model = true;
            brace_depth = 0;
            result.push_str(line);
            result.push('\n');
            continue;
        }

        if in_model {
            // 计算大括号深度
            for ch in line.chars() {
                if ch == '{' {
                    brace_depth += 1;
                } else if ch == '}' {
                    brace_depth -= 1;
                    if brace_depth == 0 {
                        in_model = false;
                    }
                }
            }

            // 如果是字段定义行（pub 开头，包含冒号，且还没有 ts 注解）
            if trimmed.starts_with("pub ") && trimmed.contains(':') && !trimmed.contains("#[ts") {
                // 检查上一行是否已经有 ts 注解
                let last_line = result.lines().last().unwrap_or("");
                if !last_line.trim().starts_with("#[ts") {
                    let ts_type = infer_ts_type(trimmed);
                    result.push_str(&format!("    #[ts(type = \"{}\")]\n", ts_type));
                }
            }
        }

        result.push_str(line);
        result.push('\n');
    }

    Ok(result)
}

fn infer_ts_type(field_line: &str) -> String {
    let ts_type = {
        #[allow(clippy::if_same_then_else)]
        if field_line.contains("i32") || field_line.contains("i64") {
            "number"
        } else if field_line.contains("f64") || field_line.contains("Decimal") {
            "number"
        } else if field_line.contains("bool") {
            "boolean"
        } else if field_line.contains("String") {
            "string"
        } else {
            "unknown"
        }
        .to_string()
    };
    if field_line.contains("Option<") {
        ts_type + " | null"
    } else {
        ts_type
    }
}

fn update_mod_rs(entities_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let mod_file = entities_dir.join("mod.rs");
    let mut content = String::new();

    content.push_str("//! 此文件由 cozy-database-codegen 自动生成，请勿手动修改\n");
    content.push_str(
        "//! This file is auto-generated by cozy-database-codegen, do not edit manually\n\n",
    );
    content.push_str("//! 数据库实体（从数据库 Schema 自动生成）\n\n");

    // 扫描 entities 目录，自动发现所有实体文件
    let mut modules = Vec::new();
    let entries = fs::read_dir(entities_dir)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                if file_name.ends_with(".rs")
                    && file_name != "mod.rs"
                    && file_name != "lib.rs"
                    && file_name != "prelude.rs"
                {
                    let module_name = file_name.strip_suffix(".rs").unwrap_or(file_name);
                    // 生成实体名称：books -> Book, reading_sessions -> ReadingSession
                    let entity_name: String = module_name
                        .split('_')
                        .map(|s| {
                            let mut chars = s.chars();
                            match chars.next() {
                                None => String::new(),
                                Some(first) => {
                                    first.to_uppercase().collect::<String>() + chars.as_str()
                                }
                            }
                        })
                        .collect();
                    modules.push((module_name.to_string(), entity_name));
                }
            }
        }
    }

    modules.sort();

    for (module, entity_name) in &modules {
        content.push_str(&format!("pub mod {};\n", module));
        content.push_str(&format!(
            "pub use {}::Entity as {}Entity;\n",
            module, entity_name
        ));
    }

    fs::write(&mod_file, content)?;
    Ok(())
}
