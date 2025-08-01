 #!/bin/bash

echo "正在启动Reminder Extension Backend..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 请先安装Node.js"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "错误: 请在backend目录下运行此脚本"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 初始化数据库（如果数据库文件不存在）
if [ ! -f "database/database.db" ]; then
    echo "正在初始化数据库..."
    mkdir -p database
    npm run init-db
fi

# 启动服务
echo "正在启动服务器..."
npm start