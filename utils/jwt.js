const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JWTUtils {
  // 生成token
  generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  // 验证token
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // 解码token（不验证）
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new JWTUtils();