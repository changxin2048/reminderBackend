const express = require('express');
// 创建Express路由实例用于处理微信相关路由
const weixinRouter = express.Router();
const WeixinController = require('../controllers/weixin');

/**
 * 接收微信消息接口
 * POST /msg
 * 用于接收微信发送的消息并输出日志
 */
weixinRouter.post('/msg', WeixinController.receiveMessage);

/**
 * 微信消息验证接口（GET方法）
 * GET /msg
 * 用于微信服务器验证URL有效性
 */
weixinRouter.get('/msg', WeixinController.verifyMessage);

/**
 * 测试发送消息接口
 * GET /sendmsg
 * 用于测试主动发送客服消息功能
 */
weixinRouter.get('/sendmsg', WeixinController.sendTestMessage);

module.exports = weixinRouter;
