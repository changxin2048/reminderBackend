const fs = require('fs');
const path = require('path');
const database = require('../config/database');

async function initializeDatabase() {
  try {
    // 连接数据库
    await database.connect();
    const db = database.getDatabase();
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // 执行SQL语句
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await new Promise((resolve, reject) => {
          db.run(statement, (err) => {
            if (err) {
              console.error('执行SQL语句失败:', err.message);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    }
    
    console.log('数据库初始化成功');
    
    // 关闭数据库连接
    await database.close();
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;