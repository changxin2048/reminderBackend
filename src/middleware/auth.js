const jwtUtils = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    
    // 验证token
    const decoded = jwtUtils.verifyToken(token);
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

module.exports = authMiddleware;