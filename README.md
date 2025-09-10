# AI提醒助手后端服务

一个基于Express.js的Node.js后端服务，提供微信公众号集成、AI智能对话、用户认证和支付功能。

## 项目结构

```
reminderBackend/
├── src/                          # 源代码目录
│   ├── config/                   # 配置文件
│   │   ├── config.js            # 主配置文件
│   │   ├── database.js          # 数据库配置
│   │   └── wechat_menu.json     # 微信菜单配置
│   ├── controllers/              # 控制器
│   │   ├── ai.js               # AI对话控制器
│   │   └── weixin.js           # 微信控制器
│   ├── middleware/             # 中间件
│   │   ├── auth.js            # 认证中间件
│   │   └── validate.js        # 验证中间件
│   ├── models/                 # 数据模型
│   │   ├── payment.js         # 支付模型
│   │   └── user.js            # 用户模型
│   ├── routes/                 # 路由定义
│   │   ├── auth.js            # 认证路由
│   │   ├── payment.js         # 支付路由
│   │   └── weixin.js          # 微信路由
│   └── utils/                  # 工具函数
│       ├── create_wechat_menu.js  # 微信菜单创建工具
│       ├── hash.js              # 加密工具
│       └── jwt.js               # JWT工具
├── tests/                      # 测试文件
│   ├── unit/                   # 单元测试
│   │   └── api_test.js        # API单元测试
│   └── integration/            # 集成测试
│       └── wechat_test.js     # 微信功能测试
├── database/                   # 数据库相关
│   ├── init.js                # 数据库初始化
│   └── init.sql               # 数据库SQL脚本
├── docs/                       # 文档目录
├── scripts/                    # 脚本目录
├── server.js                   # 主服务器文件
├── package.json               # 项目依赖配置
├── .env.example               # 环境变量示例
└── .gitignore                 # Git忽略文件
```

## 功能特性

### ✅ 已完成功能

#### 基础架构
- Express.js 服务器搭建
- SQLite 数据库配置
- 环境变量管理
- 基础中间件配置

#### 用户认证系统
- 用户注册接口
- 用户登录接口
- JWT 认证中间件
- 用户信息获取和更新
- 密码加密处理

#### 支付系统
- 支付订单创建接口
- 支付状态查询接口
- 支付回调处理
- 订阅状态管理
- 支付历史记录

#### 微信公众号功能
- 微信URL验证接口
- 微信消息接收和回复
- AI智能对话回复功能
- 微信客服消息发送
- 自定义菜单配置
- 功能测试脚本

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env` 并填写相关配置：

```bash
cp .env.example .env
```

需要配置的环境变量：
- `PORT`: 服务器端口，默认3000
- `WECHAT_TOKEN`: 微信公众号Token
- `WECHAT_APPID`: 微信公众号AppID
- `WECHAT_APPSECRET`: 微信公众号AppSecret
- `ZHIPU_API_KEY`: 智谱AI API密钥
- `JWT_SECRET`: JWT密钥

### 3. 初始化数据库
```bash
npm run init-db
```

### 4. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 运行测试
```bash
# 运行微信功能测试
npm test

# 运行单元测试
npm run test:unit
```

## API接口文档

### 基础接口
- `GET /health` - 健康检查
- `GET /` - API服务信息

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 支付接口
- `POST /api/payment/create` - 创建支付订单
- `GET /api/payment/status/:orderId` - 查询支付状态
- `POST /api/payment/webhook` - 支付回调
- `GET /api/payment/history` - 支付历史

### 微信公众号接口
- `GET /api/weixin` - 微信URL验证
- `POST /api/weixin` - 接收微信消息
- `GET /api/weixin/sendmsg` - 测试发送客服消息

## 微信配置

### 微信公众号后台配置
1. 登录微信公众号后台
2. 进入 开发 > 基本配置
3. 设置服务器配置：
   - URL: `https://yourdomain.com/api/weixin`
   - Token: 与 `.env` 中的 `WECHAT_TOKEN` 一致
   - 消息加解密方式: 明文模式

### 创建微信菜单
运行菜单创建脚本：
```bash
node src/utils/create_wechat_menu.js
```

## 开发指南

### 项目规范
- 使用ES6+语法
- 每个函数和方法都有详细的注释说明
- 错误处理和日志记录完善
- 代码风格统一，易于维护

### 目录说明
- `src/controllers/`: 处理业务逻辑
- `src/models/`: 数据模型和数据库操作
- `src/routes/`: 路由定义和接口映射
- `src/middleware/`: 中间件函数
- `src/utils/`: 通用工具函数
- `src/config/`: 配置文件
- `tests/`: 测试文件

### 添加新功能
1. 在对应目录创建文件
2. 更新路由配置
3. 添加测试用例
4. 更新文档和进度记录

## 注意事项

### 微信开发注意事项
- 微信服务器需要HTTPS支持
- Token必须和微信公众号后台配置一致
- 客服消息只能在用户48小时内有交互时发送
- 建议先在测试号进行功能验证

### 安全考虑
- 妥善保管AppSecret和API密钥
- 生产环境使用HTTPS
- 建议添加接口访问频率限制
- 定期更新JWT密钥

## 技术支持

如有问题，请检查：
1. 环境变量配置是否正确
2. 数据库连接是否正常
3. 微信公众号后台配置是否完成
4. 查看服务器日志获取详细错误信息

## 许可证

ISC License