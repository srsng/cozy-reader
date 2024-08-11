use std::collections::HashMap;

use epub::doc::EpubDoc;

#[tauri::command(rename_all = "snake_case")]
pub fn send_epub2(file_path: String) -> tauri::Result<()> {
    let epub = EpubDoc::new(file_path).unwrap();
    // let epub = std::fs::read(file_path).unwrap();
    // let epub = epub::doc::EpubDoc::new(&epub).unwrap();
    // let title = epub.title().unwrap();
    // let author = epub.author().unwrap();
    // let cover = epub.cover().unwrap();
    // let cover = base64::encode(cover);
    // let cover = format!("data:image/png;base64,{}", cover);
    // let mut chapters = Vec::new();
    // for chapter in epub.chapters() {
    //     chapters.push(chapter.title);
    // }
    // let chapters = serde_json::to_string(&chapters).unwrap();
    // format!(
    //     "{{\"title\":\"{}\",\"author\":\"{}\",\"cover\":\"{}\",\"chapters\":{}}}",
    //     title, author, cover, chapters
    // )
    // Ok(epub)
    Ok(())
}
