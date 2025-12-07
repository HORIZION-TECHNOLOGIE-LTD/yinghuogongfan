# SurfSense 完整部署指南

## 📋 目录

1. [前置要求](#前置要求)
2. [数据库部署（Azure PostgreSQL）](#数据库部署)
3. [后端部署（FastAPI）](#后端部署)
4. [前端部署（Next.js）](#前端部署)
5. [完整部署检查清单](#部署检查清单)
6. [监控和维护](#监控和维护)

---

## 🎯 前置要求

### 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Python**: 3.12+
- **Node.js**: 18+
- **内存**: 最低 4GB，推荐 8GB+
- **存储**: 最低 20GB 可用空间

### 必需工具

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必需工具
sudo apt install -y git curl wget build-essential \
    postgresql-client redis-server nginx supervisor

# 安装 Python 3.12
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# 安装 uv（Python 包管理器）
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
python3.12 --version
node --version
npm --version
uv --version
```

---

## 💾 数据库部署

### 选项 1: Azure PostgreSQL（推荐）

您已经创建了 Azure PostgreSQL 实例：
- Host: `chi393.postgres.database.azure.com`
- User: `YonggangZhen`
- Database: `postgres`

#### 配置步骤

```bash
# 1. 安装 pgvector 扩展
export PGPASSWORD="YOUR_PASSWORD"
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 2. 创建应用数据库（可选，使用独立数据库）
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres \
  -c "CREATE DATABASE surfsense;"

# 3. 在新数据库中安装 pgvector
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d surfsense \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

#### 配置防火墙

```bash
# 添加服务器 IP 到 Azure 防火墙
az postgres flexible-server firewall-rule create \
  --resource-group surfsense-rg \
  --name chi393 \
  --rule-name AllowDeploymentServer \
  --start-ip-address YOUR_SERVER_IP \
  --end-ip-address YOUR_SERVER_IP
```

### 选项 2: 本地 PostgreSQL（开发/测试）

```bash
# 安装 PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql << EOF
CREATE USER surfsense WITH PASSWORD 'your_secure_password';
CREATE DATABASE surfsense OWNER surfsense;
\c surfsense
CREATE EXTENSION vector;
EOF
```

---

## 🔧 后端部署

### 步骤 1: 克隆代码

```bash
# 创建应用目录
sudo mkdir -p /opt/surfsense
sudo chown $USER:$USER /opt/surfsense
cd /opt/surfsense

# 克隆仓库
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
```

### 步骤 2: 配置后端环境

```bash
cd surfsense_backend

# 创建虚拟环境
python3.12 -m venv .venv
source .venv/bin/activate

# 安装依赖
uv pip install -r requirements.txt

# 或使用 uv sync（如果有 pyproject.toml）
uv sync
```

### 步骤 3: 配置环境变量

创建 `.env` 文件：

```bash
cat > /opt/surfsense/yinghuogongfan/surfsense_backend/.env << 'EOF'
# ==============================================
# 应用配置
# ==============================================
APP_ENV=production
APP_NAME=SurfSense
APP_HOST=0.0.0.0
APP_PORT=8000
SECRET_KEY=your-super-secret-key-change-this-in-production

# ==============================================
# Azure PostgreSQL 配置
# ==============================================
DATABASE_URL=postgresql://YonggangZhen:YOUR_PASSWORD@chi393.postgres.database.azure.com:5432/postgres?sslmode=require

# 或者使用 surfsense 数据库
# DATABASE_URL=postgresql://YonggangZhen:YOUR_PASSWORD@chi393.postgres.database.azure.com:5432/surfsense?sslmode=require

# ==============================================
# Redis 配置（用于 Celery）
# ==============================================
REDIS_URL=redis://localhost:6379/0

# ==============================================
# OpenAI 配置
# ==============================================
OPENAI_API_KEY=your-openai-api-key

# ==============================================
# 其他 LLM API Keys（可选）
# ==============================================
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
REPLICATE_API_TOKEN=your-replicate-token

# ==============================================
# Celery 配置
# ==============================================
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# ==============================================
# 文件存储配置
# ==============================================
UPLOAD_DIR=/opt/surfsense/uploads
MAX_UPLOAD_SIZE=100000000

# ==============================================
# CORS 配置
# ==============================================
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# ==============================================
# 日志配置
# ==============================================
LOG_LEVEL=INFO
LOG_FILE=/opt/surfsense/logs/backend.log
EOF
```

⚠️ **重要**: 替换所有 `YOUR_PASSWORD`、`your-*` 占位符为实际值！

### 步骤 4: 运行数据库迁移

```bash
cd /opt/surfsense/yinghuogongfan/surfsense_backend
source .venv/bin/activate

# 运行迁移
uv run alembic upgrade head

# 验证
uv run python -c "from sqlalchemy import create_engine; engine = create_engine('YOUR_DATABASE_URL'); print('✅ 数据库连接成功')"
```

### 步骤 5: 配置 Supervisor（进程管理）

创建 Supervisor 配置文件：

```bash
sudo tee /etc/supervisor/conf.d/surfsense-backend.conf > /dev/null << 'EOF'
[program:surfsense-backend]
directory=/opt/surfsense/yinghuogongfan/surfsense_backend
command=/opt/surfsense/yinghuogongfan/surfsense_backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
user=surfsense
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/opt/surfsense/logs/backend.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=10
environment=PATH="/opt/surfsense/yinghuogongfan/surfsense_backend/.venv/bin"
EOF

# 创建日志目录
sudo mkdir -p /opt/surfsense/logs
sudo chown surfsense:surfsense /opt/surfsense/logs

# 重新加载 Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start surfsense-backend
```

### 步骤 6: 配置 Celery Worker（可选）

```bash
sudo tee /etc/supervisor/conf.d/surfsense-celery.conf > /dev/null << 'EOF'
[program:surfsense-celery]
directory=/opt/surfsense/yinghuogongfan/surfsense_backend
command=/opt/surfsense/yinghuogongfan/surfsense_backend/.venv/bin/celery -A celery_app worker --loglevel=info
user=surfsense
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/opt/surfsense/logs/celery.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=10
environment=PATH="/opt/surfsense/yinghuogongfan/surfsense_backend/.venv/bin"
EOF

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start surfsense-celery
```

### 步骤 7: 测试后端

```bash
# 检查服务状态
sudo supervisorctl status

# 测试 API
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health

# 查看日志
sudo tail -f /opt/surfsense/logs/backend.log
```

---

## 🌐 前端部署

### 步骤 1: 配置前端环境

```bash
cd /opt/surfsense/yinghuogongfan/surfsense_web

# 安装依赖
npm install

# 或使用 pnpm（更快）
npm install -g pnpm
pnpm install
```

### 步骤 2: 配置环境变量

创建 `.env.production`:

```bash
cat > /opt/surfsense/yinghuogongfan/surfsense_web/.env.production << 'EOF'
# API 配置
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# 应用配置
NEXT_PUBLIC_APP_NAME=SurfSense
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# 分析（可选）
NEXT_PUBLIC_GA_ID=your-ga-id
EOF
```

### 步骤 3: 构建生产版本

```bash
cd /opt/surfsense/yinghuogongfan/surfsense_web

# 构建
npm run build

# 或使用 pnpm
pnpm build
```

### 步骤 4: 配置 PM2（Next.js 进程管理）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "surfsense-web" -- start

# 保存配置
pm2 save

# 设置开机启动
pm2 startup
```

或创建 PM2 配置文件：

```bash
cat > /opt/surfsense/yinghuogongfan/surfsense_web/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'surfsense-web',
    script: 'npm',
    args: 'start',
    cwd: '/opt/surfsense/yinghuogongfan/surfsense_web',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

pm2 start ecosystem.config.js
pm2 save
```

### 步骤 5: 配置 Nginx 反向代理

```bash
sudo tee /etc/nginx/sites-available/surfsense << 'EOF'
# 后端 API
upstream backend {
    server 127.0.0.1:8000;
}

# 前端
upstream frontend {
    server 127.0.0.1:3000;
}

# HTTP -> HTTPS 重定向
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# 前端
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}

# 后端 API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # 请求大小限制（文件上传）
    client_max_body_size 100M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置（AI 处理可能需要较长时间）
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/surfsense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 步骤 6: 配置 SSL（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## ✅ 部署检查清单

### 数据库检查

```bash
# [ ] PostgreSQL 连接正常
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres -c "\q"

# [ ] pgvector 扩展已安装
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres \
  -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# [ ] 数据库迁移完成
cd /opt/surfsense/yinghuogongfan/surfsense_backend
source .venv/bin/activate
uv run alembic current
```

### 后端检查

```bash
# [ ] 服务正在运行
sudo supervisorctl status surfsense-backend

# [ ] API 响应正常
curl http://localhost:8000/health

# [ ] Celery worker 运行正常（如果启用）
sudo supervisorctl status surfsense-celery

# [ ] 日志无错误
sudo tail -n 100 /opt/surfsense/logs/backend.log
```

### 前端检查

```bash
# [ ] Next.js 服务运行
pm2 list

# [ ] 前端可访问
curl http://localhost:3000

# [ ] 构建文件存在
ls -la /opt/surfsense/yinghuogongfan/surfsense_web/.next
```

### Nginx 检查

```bash
# [ ] Nginx 配置正确
sudo nginx -t

# [ ] Nginx 运行中
sudo systemctl status nginx

# [ ] SSL 证书有效
sudo certbot certificates

# [ ] 外部访问正常
curl https://yourdomain.com
curl https://api.yourdomain.com/health
```

### 安全检查

```bash
# [ ] 防火墙配置
sudo ufw status

# [ ] .env 文件权限
ls -la /opt/surfsense/yinghuogongfan/surfsense_backend/.env
# 应该是 -rw------- (600)

# [ ] 敏感文件在 .gitignore
cat /opt/surfsense/yinghuogongfan/.gitignore | grep .env

# [ ] 数据库密码强度
# 确保使用强密码（16+ 字符）
```

---

## 📊 监控和维护

### 日志查看

```bash
# 后端日志
sudo tail -f /opt/surfsense/logs/backend.log

# Celery 日志
sudo tail -f /opt/surfsense/logs/celery.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# PM2 日志
pm2 logs surfsense-web
```

### 服务管理

```bash
# 重启后端
sudo supervisorctl restart surfsense-backend

# 重启前端
pm2 restart surfsense-web

# 重启 Nginx
sudo systemctl restart nginx

# 重启所有服务
sudo supervisorctl restart all
pm2 restart all
```

### 更新部署

```bash
# 1. 拉取最新代码
cd /opt/surfsense/yinghuogongfan
git pull origin main

# 2. 更新后端
cd surfsense_backend
source .venv/bin/activate
uv pip install -r requirements.txt
uv run alembic upgrade head
sudo supervisorctl restart surfsense-backend

# 3. 更新前端
cd ../surfsense_web
npm install
npm run build
pm2 restart surfsense-web

# 4. 清理缓存
pm2 flush
sudo systemctl reload nginx
```

### 备份

```bash
# 创建备份脚本
cat > /opt/surfsense/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/surfsense/backups
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
PGPASSWORD="YOUR_PASSWORD" pg_dump \
  -h chi393.postgres.database.azure.com \
  -U YonggangZhen \
  -d postgres \
  -F c -b -v \
  -f $BACKUP_DIR/db_$DATE.dump

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/surfsense/uploads

# 保留最近 7 天的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ 备份完成: $DATE"
EOF

chmod +x /opt/surfsense/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/surfsense/backup.sh >> /opt/surfsense/logs/backup.log 2>&1") | crontab -
```

### 监控脚本

```bash
# 创建健康检查脚本
cat > /opt/surfsense/health_check.sh << 'EOF'
#!/bin/bash

echo "=== SurfSense 健康检查 ==="
echo "时间: $(date)"
echo ""

# 检查后端
echo "后端服务:"
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端正常"
else
    echo "❌ 后端异常"
    sudo supervisorctl restart surfsense-backend
fi

# 检查前端
echo "前端服务:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端正常"
else
    echo "❌ 前端异常"
    pm2 restart surfsense-web
fi

# 检查数据库
echo "数据库连接:"
if PGPASSWORD="YOUR_PASSWORD" psql -h chi393.postgres.database.azure.com \
    -U YonggangZhen -d postgres -c "\q" 2>/dev/null; then
    echo "✅ 数据库正常"
else
    echo "❌ 数据库连接失败"
fi

# 检查磁盘空间
echo "磁盘使用:"
df -h / | tail -n 1

# 检查内存
echo "内存使用:"
free -h | grep Mem

echo "================================"
EOF

chmod +x /opt/surfsense/health_check.sh

# 每 5 分钟检查一次
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/surfsense/health_check.sh >> /opt/surfsense/logs/health.log 2>&1") | crontab -
```

---

## 🎯 快速部署命令总结

### 完整部署（一键脚本）

```bash
#!/bin/bash
# 保存为 deploy.sh 并执行

set -e

echo "🚀 开始部署 SurfSense..."

# 1. 克隆代码
cd /opt/surfsense
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# 2. 配置数据库
export PGPASSWORD="YOUR_PASSWORD"
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 3. 后端部署
cd surfsense_backend
python3.12 -m venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
uv run alembic upgrade head

# 4. 前端部署
cd ../surfsense_web
npm install
npm run build

# 5. 启动服务
sudo supervisorctl start surfsense-backend
pm2 start npm --name surfsense-web -- start
pm2 save

echo "✅ 部署完成！"
echo "前端: http://localhost:3000"
echo "后端: http://localhost:8000"
```

---

## 🆘 常见问题

### 问题 1: 后端无法连接数据库

**检查**:
```bash
# 测试连接
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres

# 检查防火墙
az postgres flexible-server firewall-rule list \
  --resource-group surfsense-rg \
  --name chi393
```

### 问题 2: 前端无法调用后端 API

**检查 CORS 配置**:
```python
# surfsense_backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 问题 3: Nginx 502 Bad Gateway

```bash
# 检查后端是否运行
sudo supervisorctl status

# 检查日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /opt/surfsense/logs/backend.log
```

---

## 📚 下一步

部署完成后，您可以：

1. **配置域名和 SSL**
2. **设置监控和告警**（可选：Prometheus + Grafana）
3. **开始开发新功能**：
   - AI 文案生成器（2-3天）
   - GrapesJS 网站生成器（3-4周）
   - 参考：`docs/IMPLEMENTATION_PROGRESS_TRACKER.md`

---

**提示**: 所有密码和 API key 请妥善保管，不要提交到 Git！
