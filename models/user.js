const database = require('../config/database');

class UserModel {
  // 创建用户
  async create(userData) {
    const db = database.getDatabase();
    const { email, password_hash, username } = userData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (email, password_hash, username)
        VALUES (?, ?, ?)
      `;
      
      db.run(sql, [email, password_hash, username], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            email,
            username
          });
        }
      });
    });
  }

  // 根据邮箱查找用户
  async findByEmail(email) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM users WHERE email = ?
      `;
      
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 根据ID查找用户
  async findById(id) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, email, username, avatar_url, status, created_at, updated_at
        FROM users WHERE id = ?
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 更新用户信息
  async update(id, updateData) {
    const db = database.getDatabase();
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    values.push(id);
    
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // 删除用户
  async delete(id) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM users WHERE id = ?`;
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = new UserModel();