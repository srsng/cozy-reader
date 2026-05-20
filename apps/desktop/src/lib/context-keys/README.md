# Context Keys 目录说明

## 概述

`context-keys` 目录提供 command、menu、keybinding 使用的条件判断层。

Context key 是一份轻量运行时快照，用于回答“当前条件下是否显示、是否启用、是否匹配快捷键”。它不是业务状态源，也不是持久化配置。

## 核心概念

- `ContextKeyService` - 合并手动 key 和 projection 快照，提供 `set`、`get`、`match`、`inspect`、`registerProjection` 和变更监听。
- `ContextKey` - 统一的 key 名称集合，避免字符串散落。
- `ContextKeyExpression` - VS Code 风格条件表达式，例如 `!textInputFocus && window.fullscreen`。
- `ContextKeyProjection` - 把 settings、`AppState` 或子应用 state 映射为 context key 快照。
- `modalContext` - 用于把弹窗打开状态写入 `AppState.ui.dialogOpen`，再由 app projection 投影到 `DialogOpen`。

## 状态归属

- `settings` 管持久化用户配置。
- `AppState` 管响应式、可修改的应用运行时状态。
- `ContextKeyService` 管命令、菜单、快捷键的条件判断快照。

UI 不应为了响应式读取而订阅 `ContextKeyService`。例如窗口全屏状态用于菜单 toggle、快捷键条件和按钮禁用时：

- UI 读取 `AppState.window.fullscreen`。
- command/menu/keybinding 通过 `ContextKey.WindowFullscreen` 判断。
- `ContextKey.WindowFullscreen` 由 app projection 从 `AppState` 生成。

## 常见来源

- 路由状态：由根布局导航钩子写入 `AppState.route`。
- 输入焦点：由根布局和快捷键监听器写入 `AppState.ui.textInputFocus`。
- 弹窗状态：由 dialog、drawer、sheet 等封装写入 `AppState.ui.dialogOpen`。
- 窗口状态：由窗口运行时或窗口命令写入 `AppState.window`。
- 持久化用户配置：由 `settings` store 投影，例如主题效果、窗口置顶。
- 平台能力：由平台运行时读取真实平台信息后写入 `AppState`。
- reader 状态：由 reader 子应用激活时投影。

## 注意事项

- 缺失 key 在布尔表达式中按 false 处理。
- 不要在根布局伪造无法同步确定的平台能力。
- 不要把 context key 当作 Svelte store 使用；需要响应式 UI 时应读取原始状态源。
- context key 的职责是判断条件，不负责保存业务数据。
- projection 拥有的 key 不应再通过 `ContextKeyService.set` 手动写入，避免同一个 key 出现两个状态源。
