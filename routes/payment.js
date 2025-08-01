const express = require('express');
const router = express.Router();
const paymentModel = require('../models/payment');
const authMiddleware = require('../middleware/auth');
const { validatePayment } = require('../middleware/validate');

// 定价配置
const PLAN_PRICES = {
  premium: 29.9,  // 月费
  pro: 99.9       // 年费
};

// 创建付款订单
router.post('/create', authMiddleware, validatePayment, async (req, res) => {
  try {
    const { planType, paymentMethod } = req.body;
    const userId = req.user.id;
    
    // 生成订单ID
    const orderId = `order_${Date.now()}_${userId}`;
    const amount = PLAN_PRICES[planType];
    
    // 创建付款记录
    const payment = await paymentModel.create({
      user_id: userId,
      amount,
      payment_method: paymentMethod,
      order_id: orderId,
      status: 'pending'
    });
    
    // 这里应该调用实际的支付接口
    // 为了演示，我们返回一个模拟的支付链接
    const paymentUrl = generatePaymentUrl(paymentMethod, orderId, amount);
    
    res.json({
      success: true,
      message: '订单创建成功',
      data: {
        orderId,
        amount,
        paymentUrl,
        planType
      }
    });
    
  } catch (error) {
    console.error('创建付款订单失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 查询付款状态
router.get('/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await paymentModel.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 验证订单属于当前用户
    if (payment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权访问此订单'
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: payment.order_id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      }
    });
    
  } catch (error) {
    console.error('查询付款状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 支付回调接口（用于支付平台回调）
router.post('/callback/:method', async (req, res) => {
  try {
    const { method } = req.params; // alipay 或 wechat
    
    // 这里应该验证回调的真实性
    // 为了演示，我们简化处理
    const { orderId, transactionId, status } = req.body;
    
    const payment = await paymentModel.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    // 更新付款状态
    await paymentModel.updateStatus(payment.id, status, transactionId);
    
    // 如果付款成功，创建或更新订阅
    if (status === 'completed') {
      const planType = getPlanTypeByAmount(payment.amount);
      const expiresAt = calculateExpirationDate(planType);
      
      await paymentModel.createSubscription({
        user_id: payment.user_id,
        plan_type: planType,
        expires_at: expiresAt
      });
    }
    
    res.json({
      success: true,
      message: '回调处理成功'
    });
    
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户订阅状态
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const subscription = await paymentModel.getUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.json({
        success: true,
        data: {
          planType: 'free',
          status: 'active',
          expiresAt: null
        }
      });
    }
    
    // 检查订阅是否过期
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    
    if (expiresAt < now && subscription.status === 'active') {
      // 更新为过期状态
      await paymentModel.updateSubscriptionStatus(subscription.id, 'expired');
      subscription.status = 'expired';
    }
    
    res.json({
      success: true,
      data: {
        planType: subscription.plan_type,
        status: subscription.status,
        expiresAt: subscription.expires_at,
        createdAt: subscription.created_at
      }
    });
    
  } catch (error) {
    console.error('获取订阅状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取付款历史
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const payments = await paymentModel.findByUserId(req.user.id, limit, offset);
    
    res.json({
      success: true,
      data: payments.map(payment => ({
        orderId: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.payment_method,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      }))
    });
    
  } catch (error) {
    console.error('获取付款历史失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 辅助函数
function generatePaymentUrl(method, orderId, amount) {
  // 这里应该调用实际的支付接口生成支付链接
  // 为了演示，返回模拟链接
  const baseUrls = {
    alipay: 'https://openapi.alipay.com/gateway.do',
    wechat: 'https://api.mch.weixin.qq.com/pay/unifiedorder'
  };
  
  return `${baseUrls[method]}?order_id=${orderId}&amount=${amount}`;
}

function getPlanTypeByAmount(amount) {
  for (const [plan, price] of Object.entries(PLAN_PRICES)) {
    if (Math.abs(amount - price) < 0.01) {
      return plan;
    }
  }
  return 'premium'; // 默认
}

function calculateExpirationDate(planType) {
  const now = new Date();
  if (planType === 'premium') {
    // 月费：30天
    now.setDate(now.getDate() + 30);
  } else if (planType === 'pro') {
    // 年费：365天
    now.setDate(now.getDate() + 365);
  }
  return now.toISOString();
}

module.exports = router;