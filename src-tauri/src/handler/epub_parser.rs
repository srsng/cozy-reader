use epub::doc::NavPoint;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct Catalogue {
    pub catalogue: Vec<CatalogueItem>,
}

impl Catalogue {
    /// 从epub文档的toc中构建目录
    pub fn build_from_nva_points(toc: &Vec<NavPoint>) -> Self {
        if toc.is_empty() {
            return Catalogue {
                catalogue: Vec::new(),
            };
        }

        let mut catalogue = Vec::new();

        for (_i, item) in toc.iter().enumerate() {
            let catalogue_item = CatalogueItem::new(
                item.play_order,
                item.label.clone(),
                item.content.clone(),
                Catalogue::build_from_nva_points(&item.children),
            );
            catalogue.push(catalogue_item);
        }
        Catalogue { catalogue }
    }

    /// 获取所有CatalogueItem，集中到items参数中
    fn collect_items(&self, items: &mut Vec<CatalogueItem>) {
        for item in &self.catalogue {
            items.push(item.clone());
            item.sub_catalogue.collect_items(items);
        }
    }
    /// 按照 Catalogue 属性 play_order从小到大排序，返回一个一维vec
    pub fn flatten(&self) -> Vec<CatalogueItem> {
        let mut items = Vec::new();
        self.collect_items(&mut items);
        items.sort_by_key(|item| item.play_order);
        items
    }
}

#[derive(Debug, Clone)]
pub struct CatalogueItem {
    pub play_order: usize,
    pub label: String,
    pub uri_path: PathBuf,
    pub sub_catalogue: Catalogue, // 规定：子目录为空时，vec长度为0，避免None
}

impl CatalogueItem {
    fn new(play_order: usize, label: String, uri_path: PathBuf, sub_catalogue: Catalogue) -> Self {
        CatalogueItem {
            play_order,
            label,
            uri_path,
            sub_catalogue,
        }
    }
}
