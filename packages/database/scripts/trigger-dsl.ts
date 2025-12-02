/**
 * 触发器 DSL - 结构化定义数据库触发器
 * 提供辅助函数来生成可读性更好的触发器 SQL
 */

/**
 * 触发器配置接口
 */
export interface TriggerConfig {
    /** 数据库名称 */
    dbName: string;
    /** 所有表的触发器 SQL 对象（Drizzle sql 对象） */
    triggers: Record<string, any>; // Record<tableName, sql>
}

/**
 * 触发器定义接口
 */
export interface TriggerDefinition {
    name: string;
    timing: 'BEFORE' | 'AFTER';
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    columns?: string[];  // 仅用于 UPDATE 触发器，指定监听的列
    when?: string;       // WHEN 条件（可选）
    body: string;        // 触发器体 SQL
}

/**
 * 生成触发器 SQL
 */
export function createTrigger(def: TriggerDefinition): string {
    const { name, timing, event, table, columns, when, body } = def;

    let sql = `CREATE TRIGGER IF NOT EXISTS ${name}\n`;

    // 构建触发时机和事件
    if (event === 'UPDATE' && columns && columns.length > 0) {
        sql += `${timing} UPDATE OF ${columns.join(', ')} ON ${table}\n`;
    } else {
        sql += `${timing} ${event} ON ${table}\n`;
    }

    sql += `FOR EACH ROW\n`;

    // 添加 WHEN 条件（如果有）
    if (when) {
        sql += `WHEN ${when}\n`;
    }

    // 添加触发器体
    sql += `BEGIN\n`;
    sql += `    ${body.split('\n').join('\n    ')}\n`;
    sql += `END;`;

    return sql;
}

/**
 * 自动更新 updated_at 字段的触发器
 * 当指定列更新时，自动更新 updated_at 字段
 */
export function updatedAtTrigger(
    table: string,
    columns: string[]
): TriggerDefinition {
    return {
        name: `update_${table}_updated_at`,
        timing: 'AFTER',
        event: 'UPDATE',
        table,
        columns,
        body: `UPDATE ${table} SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;`,
    };
}

/**
 * JSON 字段验证触发器
 * 为指定列生成 INSERT 和 UPDATE 触发器，验证 JSON 格式
 */
export function jsonValidationTrigger(
    table: string,
    column: string
): TriggerDefinition[] {
    const baseName = `validate_${table}_${column}_json`;

    return [
        {
            name: `${baseName}`,
            timing: 'BEFORE',
            event: 'INSERT',
            table,
            when: `NEW.${column} IS NOT NULL`,
            body: `SELECT CASE
        WHEN json_valid(NEW.${column}) = 0 THEN
            RAISE(ABORT, '${column} must be valid JSON')
    END;`,
        },
        {
            name: `${baseName}_update`,
            timing: 'BEFORE',
            event: 'UPDATE',
            table,
            when: `NEW.${column} IS NOT NULL`,
            body: `SELECT CASE
        WHEN json_valid(NEW.${column}) = 0 THEN
            RAISE(ABORT, '${column} must be valid JSON')
    END;`,
        },
    ];
}

/**
 * CHECK 约束触发器
 * 为指定表生成 INSERT 和 UPDATE 触发器，执行自定义约束检查
 */
export function constraintCheckTrigger(
    table: string,
    checks: Array<{ condition: string; message: string }>
): TriggerDefinition[] {
    const baseName = `check_${table}_constraints`;

    // 构建 CASE 语句
    const caseStatements = checks
        .map((check) => `        WHEN ${check.condition} THEN
            RAISE(ABORT, '${check.message}')`)
        .join('\n');

    const body = `SELECT CASE
${caseStatements}
    END;`;

    return [
        {
            name: baseName,
            timing: 'BEFORE',
            event: 'INSERT',
            table,
            body,
        },
        {
            name: `${baseName}_update`,
            timing: 'BEFORE',
            event: 'UPDATE',
            table,
            body,
        },
    ];
}

/**
 * 将多个触发器定义转换为 SQL 字符串
 */
export function triggersToSQL(triggers: TriggerDefinition[]): string {
    return triggers.map((trigger) => createTrigger(trigger)).join('\n\n');
}

