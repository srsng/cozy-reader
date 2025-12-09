# Reader Stores 目录说明

## 概述

`reader/stores` 目录包含阅读器相关的所有 Store。根据数据特性分为 Settings Store（持久化）和 State Store（运行时）。

## Store 分类

### Settings Store（持久化配置）

#### `readerSettings.ts` - Reader 设置 Store

管理 Reader 的全局默认设置，持久化到 `reader-settings.json`。

**包含的设置块**：

- `font` - 字体设置（字体族、大小、粗细等）
- `layout` - 布局设置（边距、列数、滚动模式等）
- `style` - 样式设置（主题、颜色、代码高亮等）
- `viewConfig` - 视图配置（显示选项、进度样式等）
- `tts` - TTS 配置（语音、语速等）
- `translator` - 翻译配置（提供商、目标语言等）
- `screen` - 屏幕配置（方向等）

**特点**：

- ✅ 持久化存储
- ✅ 自动保存（10秒防抖）
- ✅ 全局默认值，每本书可以覆盖

**使用方式**：

```typescript
import { inject } from '$lib/utils/context';
import { READER_SETTINGS } from '$lib/reader/stores/readerSettings';

const readerSettings = inject(READER_SETTINGS);
$readerSettings.font.defaultFontSize = 18; // 自动保存
```

### State Store（运行时状态）

#### `readerStore.ts` - Reader 视图状态 Store

管理当前打开的书籍视图状态、进度、设置等运行时数据。

**包含的状态**：

- `viewStates` - 所有视图状态（每本书一个）
- `bookKeys` - 当前打开的书籍列表
- `hoveredBookKey` - 当前悬停的书籍

**特点**：

- ❌ 不持久化（视图状态）
- ✅ 进度会保存到数据库（通过 `saveProgressToDatabase`）
- ✅ 每本书的设置会保存到数据库（通过 `saveSettingsToDatabase`）

#### `sidebarStore.ts` - 侧边栏状态 Store

管理侧边栏的显示/隐藏、当前标签页等 UI 状态。

**包含的状态**：

- `isVisible` - 是否可见
- `currentTab` - 当前标签页
- `searchTerm` - 搜索关键词
- `isPinned` - 是否固定
- `sideBarBookKey` - 关联的 bookKey

**特点**：

- ❌ 不持久化
- ✅ 纯 UI 状态

#### `notebookStore.ts` - 笔记状态 Store

管理笔记的 UI 状态和缓存。

**包含的状态**：

- `notes` - 笔记缓存（从数据库加载）
- `isVisible` - 笔记本是否可见
- `selectedNoteId` - 选中的笔记 ID
- `newAnnotation` - 新建注释的文本选择
- `editAnnotation` - 正在编辑的注释
- `annotationDrafts` - 注释草稿
- `notebookWidth` - 笔记本宽度
- `isPinned` - 是否固定

**特点**：

- ❌ UI 状态不持久化
- ✅ 笔记数据来自数据库（持久化）
- ✅ 草稿是临时状态

#### `parallelViewStore.ts` - 并行视图状态 Store

管理并行视图的同步状态。

**包含的状态**：

- `parallelViews` - 并行视图组列表

**特点**：

- ❌ 不持久化
- ✅ 运行时同步状态

#### `bookDataStore.ts` - 书籍数据缓存 Store

管理书籍数据的缓存（配置、文档对象等）。

**包含的数据**：

- `booksData` - 书籍数据映射

**特点**：

- ❌ 缓存不持久化（内存中）
- ✅ 配置会保存到数据库（通过 `saveConfig`）
- ✅ 文档对象是运行时数据

## 数据流

```
全局默认设置 (readerSettings)
    ↓
每本书的 ViewSettings (readerStore.viewStates[bookKey].viewSettings)
    ↓
合并逻辑：默认设置 < 全局 Reader 设置 < 书籍配置设置
    ↓
应用到视图 (FoliateReader)
```

## 注意事项

1. **Settings vs State**：
    - Settings：需要持久化的配置 → `readerSettings.ts`
    - State：运行时临时状态 → 其他所有 store

2. **持久化位置**：
    - Reader 全局设置 → `reader-settings.json`（通过 `readerSettings.ts`）
    - 每本书的设置 → 数据库 `ReadingProgress.viewSettings`（通过 `readerStore`）
    - 每本书的进度 → 数据库 `ReadingProgress`（通过 `readerStore`）

3. **设置合并**：
    - 全局 Reader 设置作为默认值
    - 每本书可以覆盖全局设置
    - 合并发生在 `readerStore.initViewState` 中
