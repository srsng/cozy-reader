# Keybindings 目录说明

## 概述

`keybindings` 目录负责键盘快捷键注册、解析、用户覆盖和事件处理。

快捷键只负责把键盘组合解析成 command invocation 或兼容 handler。默认路径应调用命令系统，而不是直接执行业务逻辑。

## 核心概念

- `KeybindingManager` - 快捷键注册表和事件入口。
- `KeybindingListener` - 监听浏览器键盘事件并转换为按键组合。
- `KeybindingResolver` - 根据组合、context key 和注册顺序解析匹配项。
- `StaticKeybinding` - 注册后的快捷键定义。
- `UserKeybindingRule` - 用户覆盖或禁用默认快捷键的配置规则。

## 条件与优先级

- 快捷键通过 `when` 使用 context key 判断是否匹配。
- 默认 action 快捷键会避开文本输入、弹窗和打开的命令面板。
- 用户规则可以禁用或替换已有快捷键。
- 平台差异由 action/keybinding 贡献显式声明。

## 浏览器默认行为

部分浏览器默认快捷键会被阻止，例如刷新、打印、下载等。需要接管的快捷键应注册到命令系统，例如 `window.refresh`。

## 当前限制

- 当前不支持 VS Code 风格的分段组合快捷键，例如 `Ctrl+K Ctrl+C`。
- `sequence` 字段仅作为未来扩展预留，不参与当前解析。

## 注意事项

- 不要在快捷键 handler 中绕过命令系统实现业务行为。
- 快捷键是否可执行应同时受 `when` 和命令 `enablement` 约束。
- 输入焦点状态会同步到 `ContextKey.TextInputFocus`，用于保护文本输入体验。
