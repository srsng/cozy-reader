# Menus 目录说明

## 概述

`menus` 目录管理菜单贡献，包括命令面板、标题栏、reader 菜单和设置页等入口。

菜单贡献负责描述“在哪里显示、显示什么、当前是否可见、是否可执行、是否处于 toggled 状态”。真正的行为执行仍由命令系统完成。

## 核心概念

- `MenuContribution` - 单个菜单项定义。
- `MenuId` - 菜单区域标识，例如 `CommandPalette`、`TitleBar`。
- `MenuService` - 菜单贡献注册表，负责过滤、排序、检查和执行。
- `MenuContributionInspection` - 菜单项当前可见性、可执行性和 toggle 状态的诊断结果。

## 数据流

1. action 或功能模块注册 menu contribution。
2. `MenuService` 使用 context key 判断 `when`、`enablement` 和 `toggled`。
3. UI 组件读取 `getVisibleItems()` 或 `getItem()` 渲染菜单项。
4. 用户触发菜单项时，`MenuService` 通过 `CommandRouter` 执行对应 invocation。

## 条件语义

- `when` 控制是否显示。
- `enablement` 控制显示后是否可执行。
- `toggled.when` 控制 toggle 状态，以及可选的替换标题和描述。
- 菜单项可执行还要求目标命令存在且命令自身可执行。

## 注意事项

- menu 不保存业务状态，只读取 context key。
- menu 不直接调用窗口、路由或业务 API，应通过 command invocation 执行命令。
- 标题栏按钮、命令面板条目等 UI 应尽量消费同一份 menu contribution，避免重复定义。
