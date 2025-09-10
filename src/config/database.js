const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.resolve(config.database.path);
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('数据库连接失败:', err.message);
          reject(err);
        } else {
          console.log('数据库连接成功');
          resolve(this.db);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('数据库连接已关闭');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getDatabase() {
    return this.db;
  }
}

module.exports = new Database();