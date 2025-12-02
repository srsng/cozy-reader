import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { TriggerConfig } from './trigger-dsl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 从 Drizzle SQL 对象中提取 SQL 字符串
 * 只提取 CREATE TRIGGER ... END; 部分，忽略注释
 */
function extractSQL(sqlObj: any): string {
    let rawSQL: string;

    if (typeof sqlObj === 'string') {
        rawSQL = sqlObj.trim();
    } else if (sqlObj.queryChunks && Array.isArray(sqlObj.queryChunks)) {
        const result = sqlObj.queryChunks.map((chunk: any) => {
            // 如果 chunk 本身就是字符串，直接返回
            if (typeof chunk === 'string') {
                return chunk;
            }
            // 如果 chunk 有 value 属性
            if (chunk.value) {
                if (Array.isArray(chunk.value)) {
                    return chunk.value.join('');
                }
                return String(chunk.value);
            }
            return '';
        }).join('');
        rawSQL = result.trim();
    } else {
        rawSQL = String(sqlObj).trim();
    }

    // 只提取 CREATE TRIGGER ... END; 部分，忽略注释
    const triggerMatch = rawSQL.match(/CREATE TRIGGER[\s\S]*?END;/);
    if (triggerMatch) {
        // 移除末尾的换行和空白，确保返回的 SQL 以 END; 结尾，没有换行
        return triggerMatch[0].trimEnd();
    }

    return rawSQL.trimEnd();
}

/**
 * 生成触发器的唯一 marker
 * 基于触发器名称生成，格式：-- @trigger: <trigger_name>
 */
function getTriggerMarker(triggerName: string): string {
    return `-- @trigger: ${triggerName}`;
}

/**
 * 从触发器 SQL 中提取触发器名称
 * 通过解析 CREATE TRIGGER 语句获取
 */
function extractTriggerName(sql: string): string | null {
    const match = sql.match(/CREATE TRIGGER IF NOT EXISTS\s+(\w+)/i);
    return match ? match[1] : null;
}

/**
 * 从迁移文件中提取已存在的触发器定义
 * 返回一个 Map，key 是触发器名称，value 是完整的触发器信息（包括 marker、SQL 内容和位置）
 * 如果 marker 之前有 DROP 语句，也会一起提取
 */
function extractExistingTriggers(migrationContent: string): Map<string, { marker: string; sql: string; startIndex: number; endIndex: number; tableName: string; hasDropStatement: boolean }> {
    const triggers = new Map<string, { marker: string; sql: string; startIndex: number; endIndex: number; tableName: string; hasDropStatement: boolean }>();

    // 匹配 marker 和对应的 CREATE TRIGGER 语句
    const markerRegex = /-- @trigger: (\w+)/g;
    let match;

    while ((match = markerRegex.exec(migrationContent)) !== null) {
        const triggerName = match[1];
        const markerStart = match.index;
        const markerEnd = match.index + match[0].length;

        // 查找对应的 CREATE TRIGGER 语句（从 marker 之后开始）
        const afterMarker = migrationContent.substring(markerEnd);
        const triggerMatch = afterMarker.match(/CREATE TRIGGER[\s\S]*?END;/);

        if (triggerMatch) {
            const triggerSQL = triggerMatch[0];
            const triggerStart = markerEnd + triggerMatch.index;
            const triggerEnd = triggerStart + triggerSQL.length;

            // 检查 marker 之前是否有 DROP 语句
            const beforeMarker = migrationContent.substring(0, markerStart);
            const dropPattern = new RegExp(`DROP\\s+TRIGGER\\s+IF\\s+EXISTS\\s+${triggerName}\\s*;`, 'i');
            const hasDropStatement = dropPattern.test(beforeMarker);

            // 尝试提取表名（从注释中）
            const tableNameMatch = migrationContent.substring(markerStart, triggerStart).match(/-- (\w+)\s+表触发器/);
            const tableName = tableNameMatch ? tableNameMatch[1] : 'unknown';

            triggers.set(triggerName, {
                marker: match[0],
                sql: triggerSQL,
                startIndex: markerStart,
                endIndex: triggerEnd,
                tableName,
                hasDropStatement
            });
        }
    }

    return triggers;
}

/**
 * 规范化触发器 SQL，用于比较
 * 移除多余空白、注释等，只保留核心 SQL 逻辑
 */
function normalizeTriggerSQL(sql: string): string {
    return sql
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
            // 移除空行和注释行
            return line && !line.startsWith('--');
        })
        .join(' ')
        .replace(/\s+/g, ' ')  // 将多个空白字符替换为单个空格
        .replace(/IF NOT EXISTS/g, '')  // 移除 IF NOT EXISTS（不影响功能）
        .trim()
        .toLowerCase();
}

/**
 * 为指定数据库追加触发器到最新生成的迁移文件
 */
async function appendTriggersToMigration(dbName: string) {
    // 1. 找到最新生成的迁移文件
    const migrationsDir = join(__dirname, '..', 'drizzle', dbName, 'migrations');

    try {
        const files = readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql') && file.match(/^\d+_/))
            .map(file => ({
                name: file,
                path: join(migrationsDir, file),
                version: parseInt(file.match(/^(\d+)_/)?.[1] || '0', 10),
            }))
            .sort((a, b) => b.version - a.version);

        if (files.length === 0) {
            console.warn(`No migration file found for ${dbName}`);
            return;
        }

        const latestMigration = files[0];

        // 2. 读取迁移文件内容
        let migrationContent = readFileSync(latestMigration.path, 'utf-8');

        // 3. 动态导入触发器配置
        const triggersModule = await import(`../drizzle/${dbName}/triggers.js`);

        if (!triggersModule.triggersConfig) {
            throw new Error(`triggersConfig not found in drizzle/${dbName}/triggers.ts`);
        }

        const triggersConfig: TriggerConfig = triggersModule.triggersConfig;

        // 验证数据库名称匹配
        if (triggersConfig.dbName !== dbName) {
            throw new Error(
                `Database name mismatch: expected ${dbName}, got ${triggersConfig.dbName}`
            );
        }

        // 4. 提取已存在的触发器
        const existingTriggers = extractExistingTriggers(migrationContent);

        // 5. 处理每个触发器：检查是否需要添加或更新
        const triggersToAdd: Array<{ name: string; sql: string; marker: string; tableName: string }> = [];
        const triggersToUpdate: Array<{ name: string; oldSql: string; newSql: string; marker: string; tableName: string; startIndex: number; endIndex: number; hasDropStatement: boolean }> = [];

        for (const [tableName, triggerSQL] of Object.entries(triggersConfig.triggers)) {
            const sql = extractSQL(triggerSQL);
            if (!sql) {
                continue;
            }

            // 提取触发器名称
            const triggerName = extractTriggerName(sql);
            if (!triggerName) {
                console.warn(`Warning: Could not extract trigger name from ${tableName} triggers, skipping...`);
                continue;
            }

            const marker = getTriggerMarker(triggerName);
            const existing = existingTriggers.get(triggerName);

            if (existing) {
                // 触发器已存在，检查内容是否相同
                const normalizedExisting = normalizeTriggerSQL(existing.sql);
                const normalizedNew = normalizeTriggerSQL(sql);

                if (normalizedExisting !== normalizedNew) {
                    // 内容不同，需要更新
                    console.log(`  → Trigger ${triggerName} changed, will update...`);
                    triggersToUpdate.push({
                        name: triggerName,
                        oldSql: existing.sql,
                        newSql: sql,
                        marker,
                        tableName,
                        startIndex: existing.startIndex,
                        endIndex: existing.endIndex,
                        hasDropStatement: existing.hasDropStatement
                    });
                } else {
                    console.log(`  ✓ Trigger ${triggerName} is up to date`);
                }
            } else {
                // 触发器不存在，需要添加
                console.log(`  → Trigger ${triggerName} not found, will add...`);
                triggersToAdd.push({
                    name: triggerName,
                    sql,
                    marker,
                    tableName
                });
            }
        }

        // 6. 如果没有需要添加或更新的触发器，跳过
        if (triggersToAdd.length === 0 && triggersToUpdate.length === 0) {
            console.log(`✓ All triggers in ${latestMigration.name} are up to date, skipped...`);
            return;
        }

        // 7. 更新迁移文件内容
        let updatedContent = migrationContent;

        // 7.1 先更新已存在的触发器（从后往前更新，避免索引偏移）
        // 格式：marker + 表注释 + DROP + CREATE（DROP 和 CREATE 之间只有一个换行）
        const sortedUpdates = triggersToUpdate.sort((a, b) => b.startIndex - a.startIndex);
        for (const update of sortedUpdates) {
            // 找到 marker 到 END; 的完整内容并替换
            const beforeMarker = updatedContent.substring(0, update.startIndex);
            const afterTrigger = updatedContent.substring(update.endIndex);

            // 检查 marker 之前是否已有 DROP 语句，如果有，需要一起替换
            let actualStartIndex = update.startIndex;

            if (update.hasDropStatement) {
                // 如果已有 DROP 语句，找到 DROP 语句的开始位置
                const beforeMarkerContent = updatedContent.substring(0, update.startIndex);
                const dropPattern = new RegExp(`DROP\\s+TRIGGER\\s+IF\\s+EXISTS\\s+${update.name}\\s*;`, 'i');
                const dropMatch = beforeMarkerContent.match(dropPattern);
                if (dropMatch && dropMatch.index !== undefined) {
                    // 找到 DROP 语句前的换行位置
                    const beforeDrop = beforeMarkerContent.substring(0, dropMatch.index);
                    const newlineBeforeDrop = beforeDrop.lastIndexOf('\n');
                    actualStartIndex = newlineBeforeDrop >= 0 ? newlineBeforeDrop + 1 : dropMatch.index;
                }
            }

            const beforeTrigger = updatedContent.substring(0, actualStartIndex);

            // 构建新的触发器组：marker + 表注释 + DROP + CREATE（组首尾无换行）
            // 确保 update.newSql 末尾没有换行（extractSQL 已经处理，但双重保险）
            const cleanNewSql = update.newSql.trimEnd();
            const newTriggerContent = `${update.marker}\n-- ${update.tableName} 表触发器\nDROP TRIGGER IF EXISTS ${update.name};\n${cleanNewSql}`;

            // 规范化 afterTrigger：移除所有开头的空白和换行
            let normalizedAfterTrigger = afterTrigger.replace(/^[\s\n\r]+/, '');

            // 规范化 beforeTrigger：移除末尾的所有空白和换行
            const normalizedBeforeTrigger = beforeTrigger.replace(/[\s\n\r]+$/, '');

            if (normalizedAfterTrigger.length > 0) {
                // 如果还有内容（下一个触发器），添加两个换行用于分隔组
                updatedContent = normalizedBeforeTrigger + '\n\n' + newTriggerContent + '\n\n' + normalizedAfterTrigger;
            } else {
                // 如果没有内容，不添加换行
                updatedContent = normalizedBeforeTrigger + '\n\n' + newTriggerContent;
            }
        }

        // 7.2 生成新的触发器 SQL
        // 格式：marker + 表注释 + DROP + CREATE（DROP 和 CREATE 之间只有一个换行）
        const newTriggersBlock = triggersToAdd.map(t => {
            const triggerName = extractTriggerName(t.sql);
            if (!triggerName) {
                return `${t.marker}\n-- ${t.tableName} 表触发器\n${t.sql}`;
            }
            return `${t.marker}\n-- ${t.tableName} 表触发器\nDROP TRIGGER IF EXISTS ${triggerName};\n${t.sql}`;
        }).join('\n\n');

        // 7.3 处理触发器部分
        const TRIGGER_SECTION_MARKER = '-- 触发器（自动追加）';
        let completeSQL: string;

        if (updatedContent.includes(TRIGGER_SECTION_MARKER)) {
            // 已有触发器部分，需要替换整个触发器部分
            const triggerSectionStart = updatedContent.indexOf(TRIGGER_SECTION_MARKER);

            // 向前查找，找到触发器部分真正的开始位置（第一个分隔符之前）
            const beforeMarker = updatedContent.substring(0, triggerSectionStart);

            // 查找第一个分隔符的位置（格式：`\n-- ============================================\n` 或文件开头）
            // 从 marker 向前查找，找到最接近 marker 的分隔符（第一个分隔符）
            const separatorPattern = /(\n|^)-- =+.*?=+\s*\n/g;
            let firstSeparatorIndex = -1;
            let match;

            // 查找所有匹配的分隔符
            const allMatches: Array<number> = [];
            while ((match = separatorPattern.exec(beforeMarker)) !== null) {
                allMatches.push(match.index);
            }

            if (allMatches.length > 0) {
                // 找到第一个分隔符（最接近 marker 的，即最后一个匹配）
                firstSeparatorIndex = allMatches[allMatches.length - 1];
            }

            // 确定触发器部分的开始位置
            let actualSectionStart: number;
            let needsSeparatorBefore: boolean;

            if (firstSeparatorIndex >= 0) {
                // 找到了分隔符，从分隔符之前开始（包括分隔符前的换行）
                // 查找分隔符前的换行位置，确保完全替换分隔符
                const beforeSeparator = beforeMarker.substring(0, firstSeparatorIndex);
                const newlineBeforeSeparator = beforeSeparator.lastIndexOf('\n');
                // 从换行之后开始，这样分隔符会被完全替换
                actualSectionStart = newlineBeforeSeparator >= 0 ? newlineBeforeSeparator + 1 : firstSeparatorIndex;
                needsSeparatorBefore = false; // 分隔符会被替换，不需要添加
            } else {
                // 没有找到分隔符，从 marker 之前开始
                actualSectionStart = triggerSectionStart;
                needsSeparatorBefore = true; // 需要添加分隔符
            }

            const beforeTriggers = updatedContent.substring(0, actualSectionStart);

            // 找到触发器部分的结束位置（下一个分隔符或文件末尾）
            const afterTriggers = updatedContent.substring(triggerSectionStart);
            const nextSectionMatch = afterTriggers.match(/\n\n-- =+.*?=+\n/);
            const triggerSectionEnd = nextSectionMatch
                ? triggerSectionStart + nextSectionMatch.index!
                : updatedContent.length;
            const afterTriggerSection = updatedContent.substring(triggerSectionEnd);

            // 提取现有的触发器内容（跳过 marker 和后面的分隔符）
            const triggerSectionContent = updatedContent.substring(triggerSectionStart, triggerSectionEnd);
            const triggerContentMatch = triggerSectionContent.match(/-- 触发器（自动追加）\s*\n-- =+.*?=+\s*\n(.*)$/s);
            const existingTriggerContent = triggerContentMatch ? triggerContentMatch[1].trim() : '';

            // 构建新的触发器部分
            let newTriggerSection = '';
            if (needsSeparatorBefore) {
                // 需要添加分隔符
                const needsNewline = beforeTriggers.trimEnd().length > 0 && !beforeTriggers.trimEnd().endsWith('--> statement-breakpoint');
                newTriggerSection = (needsNewline ? '\n\n' : '') + `-- ============================================\n${TRIGGER_SECTION_MARKER}\n-- ============================================\n\n`;
            } else {
                // 不需要添加分隔符（分隔符会被替换）
                // 检查 beforeTriggers 末尾是否需要换行
                const needsNewline = beforeTriggers.trimEnd().length > 0 && !beforeTriggers.trimEnd().endsWith('--> statement-breakpoint');
                newTriggerSection = (needsNewline ? '\n' : '') + `-- ============================================\n${TRIGGER_SECTION_MARKER}\n-- ============================================\n\n`;
            }

            // 添加现有触发器内容
            if (existingTriggerContent) {
                // 规范化现有内容：移除首尾的所有空白和换行
                const normalizedExistingContent = existingTriggerContent.replace(/^[\s\n\r]+/, '').replace(/[\s\n\r]+$/, '');
                newTriggerSection += normalizedExistingContent;
                if (newTriggersBlock) {
                    // 触发器组之间用两个换行分隔
                    newTriggerSection += '\n\n' + newTriggersBlock;
                }
            } else if (newTriggersBlock) {
                // 没有现有内容，只有新触发器
                newTriggerSection += newTriggersBlock;
            }

            completeSQL = beforeTriggers + newTriggerSection + (afterTriggerSection ? '\n' + afterTriggerSection : '');
        } else {
            // 没有触发器部分，创建新的触发器部分
            let triggersSection = `\n\n-- ============================================\n${TRIGGER_SECTION_MARKER}\n-- ============================================\n\n`;

            // 添加更新的触发器（每个触发器组首尾无换行）
            if (triggersToUpdate.length > 0) {
                const updatedTriggersBlock = triggersToUpdate.map(u => {
                    const cleanNewSql = u.newSql.trimEnd();
                    return `${u.marker}\n-- ${u.tableName} 表触发器\nDROP TRIGGER IF EXISTS ${u.name};\n${cleanNewSql}`;
                }).join('\n\n');
                triggersSection += updatedTriggersBlock;
                if (newTriggersBlock) {
                    // 触发器组之间用两个换行分隔
                    triggersSection += '\n\n' + newTriggersBlock;
                }
            } else if (newTriggersBlock) {
                // 只有新触发器
                triggersSection += newTriggersBlock;
            }

            completeSQL = updatedContent.trimEnd() + triggersSection;
        }

        // 8. 覆盖原迁移文件
        writeFileSync(latestMigration.path, completeSQL, 'utf-8');

        const actionSummary: string[] = [];
        if (triggersToUpdate.length > 0) {
            actionSummary.push(`updated ${triggersToUpdate.length} trigger(s)`);
        }
        if (triggersToAdd.length > 0) {
            actionSummary.push(`added ${triggersToAdd.length} new trigger(s)`);
        }

        console.log(`✓ ${actionSummary.join(', ')} in ${latestMigration.name}`);
    } catch (error) {
        console.error(`Failed to append triggers for ${dbName}:`, error);
        process.exit(1);
    }
}

// 执行
const dbName = process.argv[2];
if (!dbName) {
    console.error('Usage: tsx scripts/append-triggers.ts <dbName>');
    process.exit(1);
}

appendTriggersToMigration(dbName).catch(console.error);

