# State 目录说明

## 概述

`state` 目录包含所有**运行时临时状态数据**的类型和默认值。

在运行时通过 `$lib/stores` 实例化，在应用关闭后会被清除。

每次实例化都使用默认值。

## 特点

- ❌ **不持久化**：状态数据不会保存到文件系统
- ✅ **运行时使用**：用于管理应用运行时的临时状态
- ✅ **内存存储**：所有状态都存储在内存中
- ✅ **响应式可修改**：运行时实例通常由 Svelte store 管理

## 文件结构

- `app-state.ts` - 应用状态类型和默认值（标题栏标题、平台信息、路由、UI、窗口与主题能力等）
- `contextSnapshot.ts` - 将 `AppState` 与 settings 投影成 command/menu/keybinding 使用的 context key 快照

## 使用方式

```typescript
import { createInitialAppStateSnapshot } from '$lib/state/app-state';
import { initAppState, setAppCommandPaletteOpen } from '$lib/stores/appState';

const initialAppState = createInitialAppStateSnapshot();
const appState = initAppState(initialAppState);
setAppCommandPaletteOpen(appState, true);
```

## 注意事项

- 状态数据在应用关闭后会丢失
- 如需持久化，应使用 `settings` 目录
- 状态通常通过 `stores` 目录中的 store 来管理
- 如需参与 command/menu/keybinding 判断，应通过 projection 投影到 context key
- UI 读取原始状态源，例如 `AppState.window.fullscreen`；命令条件读取对应 context key，例如 `ContextKey.WindowFullscreen`
- 路由条件不属于 `AppState`，由独立 route projection 提供 `ContextKey.Route`
