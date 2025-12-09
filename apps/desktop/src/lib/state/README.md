# State 目录说明

## 概述

`state` 目录包含所有**运行时临时状态数据**。

在运行时通过`$lib/stores`实例化，在应用关闭后会被清除。

每次实例化都使用默认值。

## 特点

- ❌ **不持久化**：状态数据不会保存到文件系统
- ✅ **运行时使用**：用于管理应用运行时的临时状态
- ✅ **内存存储**：所有状态都存储在内存中

## 文件结构

- `app-state.ts` - 应用状态（标题、全屏、开发者工具等）

## 使用方式

```typescript
import { appState } from '$lib/state/app-state';

// 直接使用，无需持久化
appState.fullscreen = true;
```

## 注意事项

- 状态数据在应用关闭后会丢失
- 如需持久化，应使用 `settings` 目录
- 状态通常通过 `stores` 目录中的 store 来管理
