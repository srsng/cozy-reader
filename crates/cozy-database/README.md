# cozy-database

数据库抽象层。定义三个核心类型：

- `DatabaseName` — 枚举，受支持的数据库名称（如 `Books`），与前端共享
- `DatabaseDefinition` — 数据库元定义（名称、文件名、WAL、迁移函数指针）
- `DatabaseConfig` — 导出到前端的配置类型，通过 `ts-rs` 生成 `.ts` 文件到 `packages/database/src/core/types/generated/`

构建时 `build.rs` 调用 `cozy-database-codegen` 自动生成 `src/db/` 模块（迁移函数 + 定义常量）。运行时可获取 `DATABASES` 常量列表执行迁移。

**添加数据库流程**：在 `config.rs` 注册数据库 → `pnpm run ts-rs:gen` 生成类型到 `packages\database` → `packages\database\drizzle\{db}\schema.ts` 定义 → `packages\database\src` 封装CRUD → `pnpm run db:gen:{db}` 生成迁移 SQL → 构建自动生效。

**更新数据库流程**：改 schema → `pnpm db:gen:{db}` → 构建。
