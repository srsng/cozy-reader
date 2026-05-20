# Commands 目录说明

## 概述

`commands` 目录负责应用命令的定义、注册、校验、执行和 scope 路由。

命令表示“可以被执行的行为”，例如窗口操作、导航、主题切换和缩放。命令本身不负责 UI 展示，也不直接声明按钮、菜单或快捷键。

## 核心概念

- `CommandDefinition` - 单个命令定义，包含 `id`、参数校验、执行条件和 `run`。
- `CommandService` - 单个 scope 内的命令注册表和执行器。
- `CommandRouter` - 按 `scope` 路由命令调用，例如应用命令和 reader 子应用命令。
- `CommandContext` - 命令运行时依赖集合，包含 settings、state、context key、窗口 API 和导航 API。
- `CommandInvocation` - 菜单、快捷键等入口传递给命令系统的统一调用结构。

## 职责边界

- 命令负责行为执行和执行前校验。
- 命令可通过 `enablement` 使用 context key 判断是否可执行。
- 命令参数优先使用 schema 做运行时校验。
- UI 展示应通过 `menus` 或具体组件完成，不写在命令定义里。
- 快捷键绑定应通过 `keybindings` 或 `actions` 注册，不写在命令定义里。

## 类型与动态扩展

- 已知命令通过 `CommandRegistry` 获得 TypeScript 参数和返回值检查。
- 动态命令使用 `asDynamicCommandId()` 显式标记。
- 动态命令需要依赖运行时 schema 保护参数和返回值边界。

## 注意事项

- 不要把持久化配置写入 `commands`，应使用 `settings`。
- 不要把响应式运行时状态放进命令系统，应用状态应使用 `AppState`。
- 命令条件判断状态应来自 `ContextKeyService`。
- 没有声明平台特异性的命令默认没有平台特异性。
