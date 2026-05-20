# Actions 目录说明

## 概述

`actions` 目录提供 command、menu、keybinding 的组合注册入口。

Action 用于描述一个用户可触发能力，并一次性注册对应命令、菜单项和快捷键。它是装配层，不是状态层。

## 核心概念

- `ActionDefinition` - 声明一个动作的标题、分类、命令、菜单贡献和快捷键贡献。
- `registerAction()` - 将 action 拆分注册到 `CommandService`、`MenuService` 和 `KeybindingManager`。
- `registerDefaultActions()` - 注册应用默认动作集合。

## 数据流

1. action 定义命令行为和贡献信息。
2. `registerAction()` 注册命令。
3. 可选注册菜单贡献，用于命令面板、标题栏等 UI 入口。
4. 可选注册快捷键贡献，用于键盘触发。
5. 菜单和快捷键最终都通过 command invocation 调用命令。

## 条件处理

- `requires` 会合并到 command、menu 和 keybinding 条件中。
- 菜单可以额外声明 `when` 和 `enablement`。
- 快捷键默认会避开文本输入、弹窗和已打开的命令面板。
- 如需允许特殊场景，应显式使用 `allowInTextInput`、`allowWhenDialogOpen` 或 `allowWhenCommandPaletteOpen`。

## 注意事项

- action 不应保存运行时状态。
- action 不应直接操作 UI；UI 应消费 menu contribution 或命令状态。
- 平台差异只应声明在具体 action/keybinding 贡献上，没有声明则默认没有平台特异性。
