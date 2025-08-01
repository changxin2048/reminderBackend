const Joi = require('joi');

// 用户注册验证
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': '密码至少需要6个字符',
      'any.required': '密码是必填项'
    }),
    username: Joi.string().min(2).max(50).optional().messages({
      'string.min': '用户名至少需要2个字符',
      'string.max': '用户名不能超过50个字符'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// 用户登录验证
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
    password: Joi.string().required().messages({
      'any.required': '密码是必填项'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

// 付款验证
const validatePayment = (req, res, next) => {
  const schema = Joi.object({
    planType: Joi.string().valid('premium', 'pro').required().messages({
      'any.only': '计划类型必须是 premium 或 pro',
      'any.required': '计划类型是必填项'
    }),
    paymentMethod: Joi.string().valid('alipay', 'wechat').required().messages({
      'any.only': '支付方式必须是 alipay 或 wechat',
      'any.required': '支付方式是必填项'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePayment
};