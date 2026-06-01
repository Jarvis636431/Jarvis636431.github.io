## 📁 数据库操作

| 操作                | 命令                                           |
|---------------------|------------------------------------------------|
| 显示所有数据库       | `SHOW DATABASES;`                              |
| 创建数据库           | `CREATE DATABASE dbname;`                      |
| 删除数据库           | `DROP DATABASE dbname;`                        |
| 使用数据库           | `USE dbname;`                                  |
| 查看当前使用的数据库 | `SELECT DATABASE();`                           |

---

## 📦 表结构操作

| 操作                  | 命令                                                                 |
|-----------------------|----------------------------------------------------------------------|
| 显示当前库所有表       | `SHOW TABLES;`                                                      |
| 查看表结构             | `DESC tablename;` 或 `SHOW COLUMNS FROM tablename;`                |
| 创建表                 | `CREATE TABLE tablename (...);`                                    |
| 删除表                 | `DROP TABLE tablename;`                                            |
| 添加字段               | `ALTER TABLE tablename ADD columnname DATATYPE;`                   |
| 修改字段名和类型       | `ALTER TABLE tablename CHANGE oldname newname NEWTYPE;`            |
| 删除字段               | `ALTER TABLE tablename DROP COLUMN columnname;`                    |

---

## ✍️ 数据操作（增删改查）

| 操作        | 命令                                                                      |
|-------------|---------------------------------------------------------------------------|
| 插入数据     | `INSERT INTO users (name, email) VALUES ('Tom', 'tom@example.com');`     |
| 查询所有数据 | `SELECT * FROM users;`                                                   |
| 条件查询     | `SELECT * FROM users WHERE id = 1;`                                      |
| 模糊查询     | `SELECT * FROM users WHERE name LIKE 'T%';`                              |
| 排序查询     | `SELECT * FROM users ORDER BY id DESC LIMIT 10;`                         |
| 更新数据     | `UPDATE users SET email='new@example.com' WHERE id=1;`                  |
| 删除数据     | `DELETE FROM users WHERE id=1;`                                          |
| 统计行数     | `SELECT COUNT(*) FROM users;`                                            |

---

## 👤 用户和权限管理（需 root）

| 操作                        | 命令                                                                 |
|-----------------------------|----------------------------------------------------------------------|
| 创建用户                     | `CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';`           |
| 授权                         | `GRANT ALL PRIVILEGES ON dbname.* TO 'user'@'localhost';`            |
| 撤销权限                     | `REVOKE ALL PRIVILEGES ON dbname.* FROM 'user'@'localhost';`         |
| 刷新权限                     | `FLUSH PRIVILEGES;`                                                  |
| 查看所有用户                 | `SELECT User, Host FROM mysql.user;`                                |
| 删除用户                     | `DROP USER 'user'@'localhost';`                                     |

---

## 🛠️ 常用函数 / 系统命令

| 功能             | 命令                        |
|------------------|-----------------------------|
| 当前时间         | `SELECT NOW();`              |
| 当前用户         | `SELECT USER();`             |
| 数据库版本       | `SELECT VERSION();`          |
| 当前所在数据库   | `SELECT DATABASE();`         |
| 随机数（0~1）    | `SELECT RAND();`             |
| 获取字符串长度   | `SELECT LENGTH('abc');`      |

---

## 🔍 日志与状态

| 查看内容            | 命令                             |
|---------------------|----------------------------------|
| 错误日志位置         | `SHOW VARIABLES LIKE 'log_error';` |
| 是否开启查询日志     | `SHOW VARIABLES LIKE 'general_log';` |
| 当前连接数           | `SHOW STATUS LIKE 'Threads_connected';` |

---

## 🧩 快捷技巧

| 功能                    | 操作                                      |
|-------------------------|-------------------------------------------|
| 终端卡住 `->` 时退出     | 输入 `;` 或按 `Ctrl + C` 回到主提示符     |
| 查询结果加行号           | 使用 GUI 工具 或 `LIMIT` 实现分页         |
| 跨库操作                | `SELECT * FROM otherdb.users;`            |

---

## 📌 推荐风格示例

```sql
-- SQL 关键字大写，表名/字段小写
SELECT id, name FROM users WHERE email LIKE '%@qq.com';