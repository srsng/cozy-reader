# Settings 目录说明

## 概述

`settings` 目录包含所有**持久化的用户配置**的定义。

在运行时通过`$lib/stores`实例化，并通过subscribe副作用持久化保存。

用户修改后自动保存到文件系统，并在应用启动时加载。

## 特点

- ✅ **持久化存储**：所有设置都会保存到文件系统（通过 `LazyStore`）
- ✅ **自动保存**：设置修改后会在 10 秒后自动保存（防抖机制）
- ✅ **类型安全**：每个设置都有明确的类型定义和默认值

## 文件结构

- `Base.ts` - 基础设置（语言、日志级别、缩放等）
- `Theme.ts` - 主题设置（模式、类型、效果等）
- `Layout.ts` - 布局设置（标题栏、页眉、页脚等）
- `Reader.ts` - 阅读器设置（已过时，请使用 `reader/settings`）
- `background.ts` - 背景设置（全局背景、图片背景等）
- `user-settings.ts` - 用户设置主接口，组合所有子设置
- `index.ts` - 导出所有设置类型和默认值

## 使用方式

```typescript
import { inject } from '$lib/utils/context';
import { USER_SETTINGS } from '$lib/stores/userSettings';

const currentSettings = inject(USER_SETTINGS);

// 直接修改，会自动保存
$currentSettings.base.langCode = 'zh-cn';
```

## 注意事项

- 设置修改后会自动保存，无需手动调用保存函数
- 如需立即保存，可使用 `saveUserSettingsManually()`
- 所有设置都有默认值，确保向后兼容
