# Repository Guidelines

## 项目结构与模块组织

本仓库是 pnpm workspace 与 Rust Cargo workspace 组合的 Tauri 桌面应用。

- `apps/desktop/`：主前端应用，包含 SvelteKit 路由、阅读器界面、设置页和 Tauri 前端适配。
- `packages/database/`：共享数据库层，包含 Drizzle schema、迁移脚本和 Vitest 测试。
- `packages/foliate-js/`：本地电子书渲染依赖。
- `crates/cozy-reader-tauri/`：Tauri 宿主应用。
- `crates/cozy-database/`、`crates/cozy-database-codegen/`：Rust 侧数据库注册与代码生成。
- `packages/ui/`：因特殊原因暂时废弃，不作为当前可用 UI 来源。前端组件以 `apps/desktop/src/lib/components/ui/` 为准，导入优先使用 `$lib/components/ui` 或 `$ui`。

## 智能体规则入口

- 对 Codex 及其他读取 `AGENTS.md` 的智能体，仓库级规则统一以本文件为准。
- 如果未来某个子目录新增局部 `AGENTS.md`，则该子目录内优先遵循局部规则。
- `.claude/rules/` 目前仅保留兼容性说明，不再作为主规则入口。

## 开发、构建与测试命令

- `pnpm dev`：启动 Tauri 桌面开发环境。
- `pnpm test`：运行 workspace 级测试入口，等价于 `pnpm --recursive --if-present run test`，当前会执行 `@cozy-reader/database` 和 `@cozy-reader/desktop` 的测试脚本。
- `pnpm test:desktop`：运行桌面端测试。
- `pnpm test:database`：运行数据库包测试。
- `pnpm check:desktop`：对桌面端运行 `svelte-check`。
- `pnpm dev:storybook`：启动 `@cozy/ui` 的 Storybook，仅用于废弃包排查。
- `pnpm format`：使用 Prettier 格式化仓库。
- `pnpm db:gen`：在 schema 变更后生成 Drizzle 迁移。
- `pnpm ts-rs:gen`：重新生成 Rust 导出的 TypeScript 绑定。
- `pnpm --filter @cozy-reader/database test`：运行数据库包的 Vitest 测试，等同于 `pnpm test:database`。
- `pnpm --filter @cozy-reader/desktop test`：运行桌面端 Vitest 测试，等同于 `pnpm test:desktop`。
- `cargo check -p cozy-database`：检查 Rust 数据库代码。

## 代码风格、技术栈与命名约定

格式规则以 `.prettierrc` 为准：4 空格缩进、单引号、`printWidth: 100`、禁止尾随逗号。前端技术栈固定为 `Svelte 5 + Tauri v2 + Rust`。不要使用过时的 Svelte 4 写法；优先使用 Svelte 5 runes，但 runes 只能用于 `.svelte` 与 `.svelte.ts/.js`，普通 `.ts/.js` 文件不要使用。前端优先复用 `apps/desktop/src/lib/components/ui/` 下的组件，样式优先使用 Tailwind CSS v4。组件文件使用 PascalCase，例如 `BooksGrid.svelte`；工具函数使用 lowerCamelCase；SvelteKit 路由文件遵循 `+page.svelte`、`+layout.ts` 命名。遇到不熟悉的库或框架，优先查官方文档，必要时使用 Context7。

## 测试规范

当前自动化测试主要在 `apps/desktop/src/` 和 `packages/database/tests/`，框架为 Vitest。测试文件命名使用 `*.test.ts`，并按模块归类，例如 `tests/core/query/builder.test.ts`。`apps/desktop` 与 `packages/database` 目前定义了 `test` 脚本；`packages/ui`、`packages/foliate-js`、`crates/` 当前没有测试入口。修改数据库 schema、查询构造、序列化或校验逻辑时，应同步补充或更新测试；前端改动至少运行 `pnpm check:desktop`，涉及桌面端测试时优先运行 `pnpm test:desktop`，需要验证 workspace 级测试入口时运行 `pnpm test`。
