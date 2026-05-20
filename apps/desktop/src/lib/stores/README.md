# Stores 目录说明

## 概述

`stores` 目录包含所有通过 **Svelte Store** 实现的响应式数据对象。Store 可以是 settings（持久化配置）或 state（运行时状态）。

## 特点

- ✅ **响应式**：使用 Svelte Store 实现响应式更新
- ✅ **统一接口**：提供 `subscribe`, `set`, `update` 方法
- ✅ **类型安全**：所有 store 都有明确的类型定义

## Store 类型

### Settings Store（持久化配置）

Settings store 管理持久化的用户配置，会自动保存到文件系统：

- `userSettings.ts` - 用户设置 store（基础、主题、布局等）
- `reader/stores/readerSettings.ts` - Reader 设置 store（字体、布局、样式等）

**特点**：

- 自动保存（10秒防抖）
- 应用启动时自动加载
- 修改后自动持久化

### State Store（运行时状态）

State store 管理运行时临时状态，不持久化：

- `appState.ts` - 应用运行时状态，例如标题栏标题、平台信息、路由、UI、窗口和主题能力

**特点**：

- 不持久化
- 应用关闭后清除
- 用于管理响应式、可修改的运行时状态；需要参与命令、菜单、快捷键判断时，由 projection 映射到 `ContextKeyService`

## 使用方式

### Settings Store

```typescript
import { inject } from '$lib/utils/context';
import { USER_SETTINGS } from '$lib/stores/userSettings';

const currentSettings = inject(USER_SETTINGS);
$currentSettings.base.langCode = 'zh-cn'; // 自动保存
```

### State Store

```typescript
import { readerStore } from '$lib/reader/stores/readerStore';

const viewState = readerStore.getViewState(bookKey);
readerStore.setViewSettings(bookKey, newSettings); // 不持久化
```

## 注意事项

- Settings store 会自动保存，State store 不会
- 区分 settings 和 state 的关键：是否需要持久化
- 所有 store 都通过 context 或单例模式提供
- UI 应读取 settings/state/reader store；`ContextKeyService` 只服务 command/menu/keybinding 的条件判断
