# Reminder Extension Backend

浏览器扩展后端服务，提供用户认证和付款功能。

## 功能特性

- 用户注册/登录
- JWT认证
- 订阅计划管理
- 支付接口集成
- 微信公众号消息处理
- 微信客服消息发送
- AI智能对话回复
- SQLite数据库

## 技术栈

- Node.js + Express.js
- SQLite3 数据库
- JWT 认证
- bcryptjs 密码加密
- 微信公众号API
- XML消息解析
- 智谱AI API集成

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

### 微信公众号接口

- `GET /api/weixin/msg` - 微信URL验证
- `POST /api/weixin/msg` - 接收微信消息
- `GET /api/weixin/sendmsg` - 测试发送客服消息

## 数据库结构

- `users` - 用户表
- `subscriptions` - 订阅表
- `payments` - 付款记录表

## 部署说明

1. 安装 PM2: `npm install -g pm2`
2. 启动服务: `pm2 start server.js --name reminder-backend`
3. 配置 Nginx 反向代理（可选）

## 微信公众号配置

### 1. 环境变量配置

在 `.env` 文件中配置以下变量：

```bash
# 微信公众号Token（用于URL验证）
WECHAT_TOKEN=your_wechat_token_here

# 微信公众号AppID
WECHAT_APPID=your_wechat_appid_here

# 微信公众号AppSecret
WECHAT_APPSECRET=your_wechat_appsecret_here

# 测试用户OpenID（用于测试发送消息）
TEST_OPENID=your_test_openid_here

# 智谱AI API密钥
ZHIPU_API_KEY=your_zhipu_api_key_here
```

### 2. 微信公众号后台配置

1. 登录微信公众平台
2. 在「开发」-「基本配置」中设置服务器配置：
   - URL: `https://yourdomain.com/api/weixin/msg`
   - Token: 与环境变量 `WECHAT_TOKEN` 保持一致
   - EncodingAESKey: 随机生成
   - 消息加解密方式: 明文模式

### 3. 功能说明

- **URL验证**: 微信服务器验证服务器有效性
- **消息接收**: 接收用户发送的消息并通过AI生成智能回复
- **客服消息**: 主动向用户发送消息（需要在48小时内有交互）
- **AI对话**: 集成智谱AI，提供智能对话功能
- **自定义菜单**: 支持创建和管理公众号菜单

### 4. 自定义菜单配置

项目已预设微信自定义菜单配置，包含两个一级菜单：

**菜单结构：**
- **订阅通知**: 点击类型，用于用户订阅通知功能
- **更多**: 包含二级菜单：
  - APP下载: 跳转链接到APP下载页面
  - 推动通知: 点击类型，用于推送通知功能

**使用方法：**
1. 修改菜单配置：`config/wechat_menu.json`
2. 确保已配置微信AppID和AppSecret环境变量
3. 执行创建菜单命令：
   ```bash
   node utils/create_wechat_menu.js
   ```

**注意事项：**
- 系统会自动获取access_token，无需手动配置
- 菜单创建后24小时内对所有用户生效
- 个性化菜单需要用户分组权限
- **重要**：如果遇到40164错误（IP不在白名单），请在微信公众平台 -> 开发 -> 基本配置 -> IP白名单中添加当前服务器IP地址
- **权限要求**：
  - 服务号才能使用自定义菜单（订阅号需要认证）
  - 公众号需要通过微信认证
  - 如果遇到"api unauthorized"错误，请检查公众号类型和认证状态

## 安全注意事项

- 修改 JWT_SECRET
- 配置实际的支付接口
- 设置 HTTPS
- 配置防火墙规则
- 保护微信公众号的AppSecret