#[cfg(test)]
mod tests {
    use crate::books::migrations::tests::execute_sql;
    use rusqlite::Connection;

    fn get_database_schema(conn: &Connection) -> String {
        let mut schema = String::new();

        // 获取表定义
        let mut stmt = conn
            .prepare("SELECT sql FROM sqlite_master WHERE type='table' ORDER BY name")
            .unwrap();
        let tables = stmt
            .query_map([], |row| row.get::<_, Option<String>>(0))
            .unwrap();

        for table in tables {
            if let Ok(Some(sql)) = table {
                schema.push_str(&sql);
                schema.push_str(";\n");
            }
        }

        // 获取索引定义
        let mut stmt = conn
            .prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY name")
            .unwrap();
        let indexes = stmt
            .query_map([], |row| row.get::<_, Option<String>>(0))
            .unwrap();

        for index in indexes {
            if let Ok(Some(sql)) = index {
                schema.push_str(&sql);
                schema.push_str(";\n");
            }
        }

        // 获取触发器定义
        let mut stmt = conn
            .prepare("SELECT sql FROM sqlite_master WHERE type='trigger' ORDER BY name")
            .unwrap();
        let triggers = stmt
            .query_map([], |row| row.get::<_, Option<String>>(0))
            .unwrap();

        for trigger in triggers {
            if let Ok(Some(sql)) = trigger {
                schema.push_str(&sql);
                schema.push_str(";\n");
            }
        }

        schema
    }

    #[test]
    fn test_m001_initial_schema_idempotency() {
        let sql = include_str!("../m001_initial_schema.sql");

        // 第一次执行
        let conn1 = Connection::open_in_memory().unwrap();
        execute_sql(&conn1, sql);
        let schema1 = get_database_schema(&conn1);

        // 第二次执行
        let conn2 = Connection::open_in_memory().unwrap();
        execute_sql(&conn2, sql);
        execute_sql(&conn2, sql); // 执行两次
        let schema2 = get_database_schema(&conn2);

        assert_eq!(
            schema1, schema2,
            "Schema should be identical after second execution"
        );
    }
}
