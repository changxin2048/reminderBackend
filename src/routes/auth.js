const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const hashUtils = require('../utils/hash');
const jwtUtils = require('../utils/jwt');
const authMiddleware = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// 用户注册
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }
    
    // 加密密码
    const password_hash = await hashUtils.hashPassword(password);
    
    // 创建用户
    const user = await userModel.create({
      email,
      password_hash,
      username
    });
    
    // 生成JWT token
    const token = jwtUtils.generateToken({
      id: user.id,
      email: user.email
    });
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      }
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 用户登录
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }
    
    // 验证密码
    const isValidPassword = await hashUtils.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }
    
    // 生成JWT token
    const token = jwtUtils.generateToken({
      id: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, avatar_url } = req.body;
    const updateData = {};
    
    if (username !== undefined) updateData.username = username;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的数据'
      });
    }
    
    const updated = await userModel.update(req.user.id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '用户信息更新成功'
    });
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;
