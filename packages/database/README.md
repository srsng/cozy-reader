# @cozy-reader/database

数据库类型和服务包，为 Cozy Reader 提供完整的数据库管理功能。

## 特性

- ✅ **Drizzle ORM** - 使用 Drizzle ORM 定义数据库 Schema，自动生成类型
- ✅ **自动迁移** - 支持数据库版本迁移，自动应用迁移脚本
- ✅ **类型安全** - 完整的 TypeScript 类型推导，确保类型安全
- ✅ **多数据库支持** - 支持管理多个数据库（当前支持 books 数据库）
- ✅ **事务管理** - 支持单数据库和跨数据库事务
- ✅ **连接管理** - 自动管理数据库连接，支持健康检查和自动重连
- ✅ **工具函数** - 提供软删除、JSON 处理、时间转换等工具函数
- ✅ **触发器 DSL** - 使用结构化 DSL 定义触发器，提升可读性
- ✅ **测试覆盖** - 完整的单元测试，使用 Vitest 测试框架

## 架构说明

### 目录结构

```txt
packages/database/
├── drizzle/                    # Drizzle Schema 定义
│   └── books/
│       ├── schema.ts           # 表结构定义（SSOT）
│       ├── triggers.ts         # 触发器定义
│       ├── drizzle.config.ts   # Drizzle Kit 配置
│       └── migrations/         # 生成的迁移文件
├── scripts/                    # 构建脚本
│   ├── append-triggers.ts      # 追加触发器到迁移文件
│   └── trigger-dsl.ts          # 触发器 DSL 定义
└── src/
    ├── core/                   # 核心模块
    │   ├── database/           # 数据库连接和管理
    │   │   ├── manager.ts      # 数据库管理器
    │   │   ├── registry.ts     # 数据库注册表
    │   │   ├── init.ts         # 初始化
    │   │   ├── transaction.ts # 事务管理
    │   │   └── index.ts
    │   ├── types/              # 类型定义（统一）
    │   │   ├── index.ts        # 类型统一导出
    │   │   ├── guards.ts       # 类型守卫函数
    │   │   ├── books.ts        # 业务类型
    │   │   └── generated/      # Rust 生成的类型
    │   │       ├── DatabaseConfig.ts
    │   │       └── DatabaseName.ts
    │   ├── query/              # 查询构建
    │   │   ├── builder.ts      # 查询构建工具
    │   │   ├── softDelete.ts   # 软删除工具
    │   │   └── index.ts
    │   ├── execution/          # 执行层
    │   │   ├── executor.ts     # 统一执行器
    │   │   ├── performance.ts  # 性能监控
    │   │   └── index.ts
    │   ├── validation/         # 验证
    │   │   ├── zod.ts          # Zod 验证
    │   │   ├── field.ts        # 字段验证
    │   │   └── index.ts
    │   ├── serialization/       # 序列化
    │   │   ├── json.ts         # JSON 序列化
    │   │   └── index.ts
    │   ├── errors.ts           # 错误处理
    │   ├── schemas/            # Schema 导出
    │   │   └── books.ts
    │   └── index.ts            # 核心模块统一导出
    ├── services/               # 服务层
    │   ├── BaseService.ts     # 基础服务类
    │   └── books/             # Books 数据库服务
    │       ├── bookService.ts
    │       ├── commentService.ts
    │       └── readingSessionService.ts
    └── index.ts                # 主入口
```

### 类型系统

- **统一类型定义**：所有类型定义统一在 `core/types/` 模块中
    - `DatabaseResult<T>`: 数据库操作结果类型
    - `DatabaseErrorCode`: 数据库错误代码类型
    - `BaseQueryOptions`: 基础查询选项类型
    - 业务类型：`Book`, `Comment`, `ReadingSession` 等（从 Drizzle Schema 推导）
    - **后端生成类型**：使用 `ts-rs` 从 Rust 后端自动生成 TypeScript 类型
        - `DatabaseName`: 数据库名称枚举类型（如 `"books"`）
        - `DatabaseConfig`: 数据库配置类型

## 快速开始

### 1. 初始化数据库

在应用启动时调用初始化函数：

```typescript
import { initializeDatabases } from '@cozy-reader/database';

// 初始化所有数据库（仅初始化注册表，不创建连接）
// 注意：迁移由 Rust 端通过 tauri_plugin_sql 自动处理
// 数据库连接按需创建，在调用 getDatabase() 时自动创建
await initializeDatabases();
```

### 2. 使用服务层

```typescript
import { BookService } from '@cozy-reader/database';

// 创建书籍
const book = await BookService.create({
    path: '/path/to/book.epub',
    title: '示例书籍',
    author: '作者名',
    format: 'epub',
    storageType: 'local'
});

// 查询书籍
const books = await BookService.list({
    status: 'reading',
    limit: 10
});

// 更新书籍
await BookService.update(book.id, {
    status: 'completed',
    rating: 5
});
```

### 3. 使用数据库管理器

```typescript
import { DatabaseManager } from '@cozy-reader/database';
import type { DatabaseName } from '@cozy-reader/database';

const manager = DatabaseManager.getInstance();

// 按需获取数据库连接（如果不存在会自动创建）
const db = await manager.getDatabase('books');

// 执行自定义查询
const result = await db.select('SELECT * FROM books WHERE status = ?', ['reading']);
```

**注意**：`DatabaseManager` 采用按需连接模式，只有在调用 `getDatabase()` 时才会创建连接。

### 4. 使用事务

事务在处理非原子操作时是必要的，确保数据一致性。

#### 单数据库事务

```typescript
import { createTransaction } from '@cozy-reader/database';
import { DatabaseManager } from '@cozy-reader/database';

const db = await DatabaseManager.getInstance().getDatabase('books');
const tx = createTransaction(db);

await tx.run(async (db) => {
    // 在事务中执行多个操作
    await db.execute('INSERT INTO books (...) VALUES (...)');
    await db.execute('UPDATE books SET ... WHERE ...');
    // 如果任何操作失败，整个事务会回滚
});
```

#### 保存点（嵌套事务）

```typescript
const tx = createTransaction(db);

await tx.run(async (db) => {
    await db.execute('INSERT INTO books (...) VALUES (...)');

    // 创建保存点
    await tx.createSavepoint('checkpoint1');

    try {
        await db.execute('UPDATE books SET ...');
    } catch (error) {
        // 回滚到保存点
        await tx.rollbackToSavepoint('checkpoint1');
    }

    // 释放保存点
    await tx.releaseSavepoint('checkpoint1');
});
```

## API 文档

### 数据库管理器

#### `DatabaseManager.getInstance()`

获取数据库管理器单例。

#### `initialize(): Promise<void>`

初始化数据库管理器（仅初始化注册表，不创建连接）。数据库连接按需创建。

#### `getDatabase(name: DatabaseName): Promise<Database>`

获取指定数据库的连接（按需创建）。如果连接不存在或不健康，会自动创建或重新创建。

#### `isConnected(name: DatabaseName): boolean`

检查数据库是否已连接。

#### `getConnectedDatabases(): DatabaseName[]`

获取所有已连接的数据库名称。

#### `closeDatabase(name: DatabaseName): Promise<void>`

关闭指定数据库连接。

#### `closeAll(): Promise<void>`

关闭所有数据库连接。

### 服务层

#### BookService

- `create(input: NewBook): Promise<Book>` - 创建书籍
- `getById(id: number): Promise<Book>` - 根据 ID 获取书籍
- `list(filters?): Promise<Book[]>` - 列表查询书籍
- `update(id: number, input: BookUpdate): Promise<Book>` - 更新书籍
- `softDelete(id: number): Promise<void>` - 软删除书籍
- `hardDelete(id: number): Promise<void>` - 硬删除书籍
- `restore(id: number): Promise<Book>` - 恢复书籍

#### CommentService

- `create(input: NewComment): Promise<Comment>` - 创建评论
- `getById(id: number): Promise<Comment>` - 根据 ID 获取评论
- `listByBookId(bookId: number): Promise<Comment[]>` - 根据书籍 ID 查询评论
- `update(id: number, input: CommentUpdate): Promise<Comment>` - 更新评论
- `softDelete(id: number): Promise<void>` - 软删除评论
- `hardDelete(id: number): Promise<void>` - 硬删除评论
- `restore(id: number): Promise<Comment>` - 恢复评论

#### ReadingSessionService

- `create(input: NewReadingSession): Promise<ReadingSession>` - 创建阅读会话
- `getById(id: number): Promise<ReadingSession>` - 根据 ID 获取阅读会话
- `listByBookId(bookId: number): Promise<ReadingSession[]>` - 根据书籍 ID 查询阅读会话
- `update(id: number, input: ReadingSessionUpdate): Promise<ReadingSession>` - 更新阅读会话
- `softDelete(id: number): Promise<void>` - 软删除阅读会话
- `hardDelete(id: number): Promise<void>` - 硬删除阅读会话
- `restore(id: number): Promise<ReadingSession>` - 恢复阅读会话

### 工具函数

#### 统一数据库操作包装器

所有服务层都使用统一的数据库操作包装器，提供自动错误处理和可选的性能监控：

```typescript
import { executeSelect, executeUpdate } from '@cozy-reader/database';
import Database from '@tauri-apps/plugin-sql';

const db = await DatabaseManager.getInstance().getDatabase('books');

// SELECT 查询（自动错误处理）
const books = await executeSelect<Book[]>(
    db,
    'books',
    'SELECT * FROM books WHERE status = ?',
    ['reading'],
    {
        enableMonitoring: true, // 可选：启用性能监控
        operationName: 'getBooksByStatus'
    }
);

// INSERT/UPDATE/DELETE 操作（自动错误处理）
const result = await executeUpdate(
    db,
    'books',
    'UPDATE books SET status = ? WHERE id = ?',
    ['completed', bookId],
    {
        enableMonitoring: true,
        operationName: 'updateBookStatus'
    }
);
```

#### 软删除

统一的软删除工具函数，所有服务层共享：

```typescript
import {
    softDelete,
    hardDelete,
    restoreDeleted,
    buildSoftDeleteCondition
} from '@cozy-reader/database';

const db = await DatabaseManager.getInstance().getDatabase('books');

// 软删除（自动检查记录是否存在且未删除）
await softDelete(db, 'books', 'books', bookId);

// 硬删除（物理删除）
await hardDelete(db, 'books', 'books', bookId);

// 恢复已删除的记录
await restoreDeleted(db, 'books', 'books', bookId);

// 构建软删除条件（用于查询）
const condition = buildSoftDeleteCondition(); // 'deleted_at IS NULL'
const conditionWithDeleted = buildSoftDeleteCondition('deleted_at', true); // '1=1'
```

#### Schema 默认值常量

从 Schema 提取的默认值常量，确保与 Schema 定义同步：

```typescript
import {
    BOOKS_DEFAULTS,
    COMMENTS_DEFAULTS,
    READING_SESSIONS_DEFAULTS
} from '@cozy-reader/database/drizzle/books/schema-defaults';

// 使用默认值而不是硬编码
const status = input.status || BOOKS_DEFAULTS.status; // 'not_started'
const commentType = input.commentType || COMMENTS_DEFAULTS.commentType; // 'note'
const isPrivate = input.isPrivate ?? COMMENTS_DEFAULTS.isPrivate; // 1
```

**注意**：`schema-defaults.ts` 现在从 `schema.ts` 自动提取默认值，确保同步。SQL 表达式（如 `sql`(strftime('%s', 'now'))`）无法在运行时提取，需要手动处理。

#### JSON 工具

```typescript
import { isValidJSON, serializeJSON, deserializeJSON } from '@cozy-reader/database';

// 验证 JSON 字符串
if (isValidJSON(jsonString)) {
    // 序列化对象为 JSON 字符串（用于数据库存储）
    const jsonStr = serializeJSON({ key: 'value' });

    // 反序列化 JSON 字符串为对象（从数据库读取）
    const data = deserializeJSON<MyType>(jsonString, defaultValue, optionalSchema);
}
```

#### 时间工具

```typescript
import {
    timestampToISOString,
    getCurrentTimestamp,
    formatReadingTime
} from '@cozy-reader/database';

const timestamp = getCurrentTimestamp();
const isoString = timestampToISOString(timestamp);
const readingTime = formatReadingTime(125); // { day: 0, hour: 2, min: 5 }
```

## 开发指南

### 生成迁移

修改 Schema 后，生成迁移文件：

```bash
pnpm db:gen:books
```

这会：

1. 使用 Drizzle Kit 生成迁移 SQL
2. 自动追加触发器 SQL 到迁移文件

### 添加新数据库

1. 在 `drizzle/` 目录下创建新数据库目录（如 `settings/`）
2. 创建 `schema.ts` 和 `drizzle.config.ts`
3. 在 `src/registry/config.ts` 中添加配置
4. 运行 `pnpm db:gen:settings` 生成迁移

### Schema 定义

Schema 是 Single Source of Truth（SSOT），所有表结构、索引、CHECK 约束都在这里定义：

```typescript
import { sqliteTable, integer, text, check } from 'drizzle-orm/sqlite-core';

export const books = sqliteTable(
    'books',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        title: text('title').notNull()
        // ...
    },
    (table) => [
        check('status_check', sql`${table.status} IN ('reading', 'completed')`)
        // ...
    ]
);
```

### 触发器定义

使用触发器 DSL 定义触发器：

```typescript
import { updatedAtTrigger, createTrigger } from '../../scripts/trigger-dsl';

export const booksUpdatedAtTrigger = updatedAtTrigger('books', [
    'title',
    'author'
    // ...
]);

export const booksTriggers = sql`
  ${createTrigger(booksUpdatedAtTrigger)}
`;
```

## 服务层规范

所有服务层都遵循以下统一规范：

1. **统一错误处理**：使用 `executeSelect` 和 `executeUpdate` 包装所有数据库操作，自动捕获并转换为 `DatabaseError`
2. **自动软删除**：在 `executeSelect`/`executeUpdate` 中提供 `tableName` 选项，自动处理软删除条件
3. **统一默认值**：使用 `schema-defaults.ts` 中的常量，避免硬编码
4. **可选性能监控**：通过 `enableMonitoring` 选项启用性能监控

示例：

```typescript
import { executeSelect, executeUpdate } from '../../core/execution';
import { softDelete } from '../../core/query';
import { BOOKS_DEFAULTS } from '../../../drizzle/books/schema-defaults';

export class BookService {
    static async create(input: NewBook): Promise<Book> {
        const db = await DatabaseManager.getInstance().getDatabase('books');

        const result = await executeUpdate(
            db,
            'books',
            'INSERT INTO books (...) VALUES (...)',
            [
                /* params */
            ],
            { operationName: 'BookService.create' }
        );

        return await this.getById(result.lastInsertId);
    }

    static async softDelete(id: number): Promise<void> {
        const db = await DatabaseManager.getInstance().getDatabase('books');
        await softDelete(db, 'books', 'books', id);
    }
}
```

## 测试

项目使用 [Vitest](https://vitest.dev/) 作为测试框架。所有测试文件统一存放在 `tests/` 目录下。

### 目录结构

```
packages/database/
├── tests/                    # 测试文件目录
│   └── core/                # 核心模块测试（对应 src/core/）
│       ├── query/           # 查询构建测试
│       │   ├── builder.test.ts
│       │   └── softDelete.test.ts
│       ├── serialization/    # 序列化测试
│       │   └── json.test.ts
│       ├── validation/       # 验证测试
│       │   ├── field.test.ts
│       │   └── zod.test.ts
│       └── types/           # 类型守卫测试
│           └── guards.test.ts
└── src/                      # 源代码目录
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监视模式运行测试
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 测试覆盖

- ✅ `core/query/builder.ts` - 查询构建工具函数（排序、分页、搜索、标签筛选、软删除条件、转义）
- ✅ `core/query/softDelete.ts` - 软删除工具函数（软删除、硬删除、恢复、检查删除状态）
- ✅ `core/serialization/json.ts` - JSON 序列化/反序列化工具
- ✅ `core/validation/field.ts` - 字段名验证工具（防止 SQL 注入）
- ✅ `core/validation/zod.ts` - Zod 运行时验证工具
- ✅ `core/types/guards.ts` - 类型守卫函数

## 注意事项

1. **模块结构**：核心功能统一在 `core/` 模块中，工具函数在 `utils/` 中
2. **类型安全**：所有功能都使用 TypeScript 类型，确保类型安全
3. **错误处理**：统一使用 `DatabaseError` 和 `DatabaseResult` 类型
4. **迁移执行**：迁移在应用启动时自动执行，无需手动干预
5. **连接管理**：数据库连接由 `DatabaseManager` 统一管理，支持自动重连
6. **默认值同步**：`schema-defaults.ts` 需要手动与 `schema.ts` 保持同步
7. **性能监控**：默认禁用，需要时通过 `enableMonitoring` 选项启用
8. **测试**：所有核心功能都有单元测试覆盖，确保代码质量
9. **导入路径**：推荐使用统一导出 `@cozy-reader/database`，内部模块路径可能变化
