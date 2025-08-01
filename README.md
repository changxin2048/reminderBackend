 # Reminder Extension Backend

浏览器扩展后端服务，提供用户认证和付款功能。

## 功能特性

- 用户注册/登录
- JWT认证
- 订阅计划管理
- 支付接口集成
- SQLite数据库

## 技术栈

- Node.js + Express.js
- SQLite3 数据库
- JWT 认证
- bcryptjs 密码加密

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并修改配置：

```bash
cp .env.example .env
```

### 3. 初始化数据库

```bash
npm run init-db
```

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 付款接口

- `POST /api/payment/create` - 创建付款订单
- `GET /api/payment/status/:orderId` - 查询付款状态
- `POST /api/payment/callback/:method` - 支付回调
- `GET /api/payment/subscription` - 获取订阅状态
- `GET /api/payment/history` - 获取付款历史

## 数据库结构

- `users` - 用户表
- `subscriptions` - 订阅表
- `payments` - 付款记录表

## 部署说明

1. 安装 PM2: `npm install -g pm2`
2. 启动服务: `pm2 start server.js --name reminder-backend`
3. 配置 Nginx 反向代理（可选）

## 安全注意事项

- 修改 JWT_SECRET
- 配置实际的支付接口
- 设置 HTTPS
- 配置防火墙规则