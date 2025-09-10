const database = require('../config/database');

class PaymentModel {
  // 创建付款记录
  async create(paymentData) {
    const db = database.getDatabase();
    const { 
      user_id, 
      subscription_id, 
      amount, 
      currency = 'CNY', 
      payment_method, 
      order_id 
    } = paymentData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO payments (user_id, subscription_id, amount, currency, payment_method, order_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [user_id, subscription_id, amount, currency, payment_method, order_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...paymentData
          });
        }
      });
    });
  }

  // 根据订单ID查找付款记录
  async findByOrderId(order_id) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM payments WHERE order_id = ?
      `;
      
      db.get(sql, [order_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 根据用户ID获取付款记录
  async findByUserId(user_id, limit = 10, offset = 0) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM payments 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      
      db.all(sql, [user_id, limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 更新付款状态
  async updateStatus(id, status, transaction_id = null) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      let sql = `
        UPDATE payments 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
      `;
      let params = [status];
      
      if (transaction_id) {
        sql += `, transaction_id = ?`;
        params.push(transaction_id);
      }
      
      if (status === 'completed') {
        sql += `, completed_at = CURRENT_TIMESTAMP`;
      }
      
      sql += ` WHERE id = ?`;
      params.push(id);
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // 创建订阅
  async createSubscription(subscriptionData) {
    const db = database.getDatabase();
    const { user_id, plan_type, expires_at } = subscriptionData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO subscriptions (user_id, plan_type, expires_at)
        VALUES (?, ?, ?)
      `;
      
      db.run(sql, [user_id, plan_type, expires_at], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...subscriptionData
          });
        }
      });
    });
  }

  // 获取用户订阅状态
  async getUserSubscription(user_id) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      db.get(sql, [user_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 更新订阅状态
  async updateSubscriptionStatus(id, status) {
    const db = database.getDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE subscriptions 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = new PaymentModel();