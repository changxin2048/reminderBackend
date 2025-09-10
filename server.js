const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const database = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const weixinRoutes = require('./routes/weixin');

const app = express();

// 中间件
app.use(cors({
  origin: ['chrome-extension://*', 'http://localhost:*', 'https://localhost:*'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 微信XML数据处理中间件
app.use('/api/weixin', express.raw({ type: 'text/xml' }));
app.use('/api/weixin', (req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString('utf8');
    req.body = req.body.toString('utf8');
  }
  next();
});

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径 - API服务信息
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'AI提醒助手后端服务',
    version: '1.0.0',
    description: '提供微信公众号集成、AI对话、用户认证和支付功能的后端API服务',
    endpoints: {
      health: '/health - 健康检查',
      auth: '/api/auth/* - 用户认证相关接口',
      payment: '/api/payment/* - 支付相关接口',
      weixin: '/api/weixin/* - 微信公众号相关接口'
    },
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/weixin', weixinRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await database.connect();
    console.log('数据库连接成功');
    
    // 启动HTTP服务器
    app.listen(config.port, () => {
      console.log(`服务器运行在端口 ${config.port}`);
      console.log(`健康检查: http://localhost:${config.port}/health`);
      console.log(`API文档: http://localhost:${config.port}/api`);
    });
    
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  try {
    await database.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n收到SIGTERM信号，正在关闭服务器...');
  try {
    await database.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
    process.exit(1);
  }
});

// 启动服务器
startServer();