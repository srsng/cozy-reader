use serde_json::Value;
use std::fs::read_to_string;

pub fn default_theme() -> Value {
    let file_content = read_to_string("src/theme/default.json").expect("无法读取默认主题文件");
    serde_json::from_str(&file_content).expect("默认主题数据无效")
}

// fn read_theme_file() -> Result<Value, Box<dyn std::error::Error>> {
//     // 获取应用用户数据目录
//     let app_data_dir: PathBuf = get_dir();

//     // 构建 theme.json 文件路径
//     let theme_file_path = app_data_dir.join("theme.json");

//     // 读取文件内容
//     if !theme_file_path.exists() {
//         // 文件不存在，使用默认主题并创建文件
//         let default_json = default_theme();
//         write(&theme_file_path, serde_json::to_string(&default_json)?)?;
//         return Ok(default_json);
//     }

//     // 读取文件内容
//     let file_content = read_to_string(theme_file_path)?;

//     // 解析 JSON 数据，出错时调用 default_theme
//     let theme_data: Value = match serde_json::from_str(&file_content) {
//         Ok(data) => data,
//         Err(_) => {
//             eprintln!("解析主题文件时出错，使用默认主题");
//             default_theme()
//         }
//     };

//     Ok(theme_data)
// }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_theme() {
        let default_theme_data = default_theme();
        println!("默认主题数据:\n{:?}", default_theme_data);
    }

    // #[test]
    // fn test_read_theme_file() {
    //     match read_theme_file() {
    //         Ok(theme_data) => println!("读取的主题数据: {:?}", theme_data),
    //         Err(e) => eprintln!("读取主题文件时出错: {}", e),
    //     }
    // }
}
