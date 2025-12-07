# SurfSense 部署指南

本指南提供了部署 SurfSense 的全面说明。选择最适合您需求的部署方法。

## 目录

- [前提条件](#前提条件)
- [使用 Docker 快速开始（推荐）](#使用-docker-快速开始推荐)
- [生产环境部署](#生产环境部署)
- [手动安装](#手动安装)
- [环境配置](#环境配置)
- [故障排除](#故障排除)

## 前提条件

在部署 SurfSense 之前，请确保您具备：

### 必需软件

- **Docker & Docker Compose**（用于 Docker 部署）
  - Docker Engine 20.10+
  - Docker Compose 2.0+
- **Python 3.11+**（用于手动安装）
- **Node.js 18+**（用于手动安装）
- **PostgreSQL 15+** 带 pgvector 扩展（用于手动安装）
- **Redis 7+**（用于手动安装）

### 必需的 API 密钥

至少需要以下文件处理服务之一：

1. **Docling**（默认，免费）- 无需 API 密钥
   - 本地处理，注重隐私
   - 支持：PDF、DOCX、HTML、图像、CSV
   
2. **Unstructured.io** - 需要 API 密钥
   - 支持 34+ 种格式
   - 获取 API 密钥：https://unstructured.io
   
3. **LlamaCloud** - 需要 API 密钥
   - 增强解析，50+ 种格式
   - 获取 API 密钥：https://cloud.llamaindex.ai

### 可选服务

- **身份验证**：在 LOCAL 或 GOOGLE OAuth 之间选择
- **LLM 提供商**：OpenAI、Anthropic、Google、Azure 或 Ollama（本地）
- **搜索引擎**：Tavily、LinkUp 或自托管 SearxNG
- **外部集成**：Slack、Linear、Jira、Notion 等

## 使用 Docker 快速开始（推荐）

### 自动化设置（最简单）

我们提供快速启动脚本来自动化初始设置：

**Linux/macOS:**
```bash
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
./quick-start.sh
```

**Windows:**
```cmd
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
quick-start.bat
```

该脚本将：
- 从示例创建所有必要的 `.env` 文件
- 生成安全的 PostgreSQL 密码
- 提供配置的后续步骤

运行脚本后，按照显示的说明添加您的 API 密钥并启动服务。

### 手动设置

如果您更喜欢手动设置：

#### 1. 克隆仓库

```bash
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan
```

#### 2. 配置环境变量

在根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

使用您的设置编辑 `.env` 文件：

```bash
# 最小配置
POSTGRES_PASSWORD=your_secure_password
NEXT_PUBLIC_ETL_SERVICE=DOCLING  # 无需 API 密钥

# 可选：如需要可更改默认端口
FRONTEND_PORT=3000
BACKEND_PORT=8000
POSTGRES_PORT=5432
```

#### 3. 配置后端

导航到后端目录并设置配置：

```bash
cd surfsense_backend
cp .env.example .env
```

使用您的 API 密钥编辑 `surfsense_backend/.env`：

```bash
# LLM 配置（选择一个或多个）
OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
# GOOGLE_API_KEY=your_google_key

# 文件处理（默认使用 Docling - 无需密钥）
# ETL_SERVICE=DOCLING

# 或使用其他服务：
# ETL_SERVICE=UNSTRUCTURED
# UNSTRUCTURED_API_KEY=your_unstructured_key

# ETL_SERVICE=LLAMACLOUD
# LLAMA_CLOUD_API_KEY=your_llama_key
```

#### 4. 配置前端

导航到前端目录：

```bash
cd ../surfsense_web
cp .env.example .env
```

#### 5. 启动服务

返回根目录并启动所有服务：

```bash
cd ..
docker-compose up -d
```

这将启动：
- PostgreSQL 带 pgvector（端口 5432）
- pgAdmin（端口 5050）- 数据库管理 UI
- Redis（端口 6379）- 消息代理
- 后端 API（端口 8000）
- 前端 Web UI（端口 3000）

#### 6. 访问 SurfSense

- **Web UI**：http://localhost:3000
- **API 文档**：http://localhost:8000/docs
- **pgAdmin**：http://localhost:5050（admin@surfsense.com / surfsense）

#### 7. 初始化数据库

数据库将在首次运行时自动初始化。如需要，可以手动运行迁移：

```bash
docker-compose exec backend alembic upgrade head
```

## 生产环境部署

对于生产环境，建议进行额外配置：

### 1. 启用 Celery Worker

在 `docker-compose.yml` 中取消注释 Celery 服务：

```yaml
services:
  # ... 现有服务 ...
  
  celery_worker:
    # 取消注释整个部分
    
  celery_beat:
    # 取消注释整个部分
    
  flower:
    # 取消注释整个部分以进行任务监控
```

### 2. 使用预构建镜像（可选）

要使用预构建镜像而不是本地构建，更新 `docker-compose.yml`：

```yaml
backend:
  image: ghcr.io/modsetter/surfsense_backend:latest
  # 注释掉 'build' 行

frontend:
  image: ghcr.io/modsetter/surfsense_ui:latest
  # 注释掉 'build' 部分
```

### 3. 生产环境变量

更新您的生产环境 `.env` 文件：

```bash
# 使用强密码
POSTGRES_PASSWORD=strong_random_password_here
PGADMIN_DEFAULT_PASSWORD=another_strong_password

# 生产后端 URL（使用您的域名）
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://api.yourdomain.com

# 生产环境使用 GOOGLE OAuth（推荐）
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=GOOGLE
```

### 4. SSL/TLS 配置

对于生产环境，使用反向代理（nginx、Traefik 或 Caddy）处理 SSL：

**nginx 配置示例：**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. 持久化数据

确保定期备份 Docker 卷：

```bash
# 备份 PostgreSQL 数据
docker-compose exec -T db pg_dump -U postgres surfsense > backup.sql

# 从备份恢复
docker-compose exec -T db psql -U postgres surfsense < backup.sql
```

## 手动安装

有关详细的手动安装说明，请参阅官方文档：
https://www.surfsense.net/docs/manual-installation

基本步骤：

### 后端设置

```bash
cd surfsense_backend

# 使用 uv（推荐）或 pip 安装依赖
uv pip install -e .
# 或：pip install -e .

# 配置环境
cp .env.example .env
# 使用您的设置编辑 .env

# 运行数据库迁移
alembic upgrade head

# 启动后端
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 在单独的终端中启动 Celery worker：
celery -A app.celery_app worker --loglevel=info
celery -A app.celery_app beat --loglevel=info
```

### 前端设置

```bash
cd surfsense_web

# 安装依赖
npm install

# 配置环境
cp .env.example .env
# 使用您的设置编辑 .env

# 构建并启动
npm run build
npm start
```

## 环境配置

### 核心环境变量

#### 根目录 `.env` 文件

```bash
# 数据库
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# 服务
BACKEND_PORT=8000
FRONTEND_PORT=3000
PGADMIN_PORT=5050
FLOWER_PORT=5555

# 前端配置
NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING
```

#### 后端 `.env` 文件

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/surfsense

# Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# LLM 提供商
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_API_KEY=your_key

# 文件处理
ETL_SERVICE=DOCLING  # 或 UNSTRUCTURED 或 LLAMACLOUD
UNSTRUCTURED_API_KEY=your_key  # 如果使用 UNSTRUCTURED
LLAMA_CLOUD_API_KEY=your_key   # 如果使用 LLAMACLOUD

# 身份验证
SECRET_KEY=generate_a_random_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 搜索引擎（可选）
TAVILY_API_KEY=your_key
LINKUP_API_KEY=your_key
SEARXNG_URL=http://your-searxng-instance

# 外部集成（可选）
SLACK_BOT_TOKEN=your_token
NOTION_API_KEY=your_key
GITHUB_TOKEN=your_token
```

## PAL MCP 集成（可选）

为了增强多模型 AI 编排，您可以集成 PAL MCP（DASHI）：

```bash
# 克隆 DASHI 仓库（在 SurfSense 上一级）
cd ..
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/DASHI.git

# 返回 SurfSense 目录
cd yinghuogongfan

# 使用 PAL MCP 启动
docker-compose -f docker-compose.yml -f docker-compose.pal.yml up -d
```

详细设置说明请参见 [docs/PAL_MCP_INTEGRATION.md](docs/PAL_MCP_INTEGRATION.md)。

## 故障排除

### 常见问题

#### 1. 数据库连接失败

**问题**：后端无法连接到 PostgreSQL

**解决方案**：
```bash
# 检查 PostgreSQL 是否运行
docker-compose ps db

# 检查日志
docker-compose logs db

# 验证 .env 文件中的连接设置
# 确保 DATABASE_URL 使用正确的主机（Docker 使用 db，手动使用 localhost）
```

#### 2. 前端无法访问后端

**问题**：从前端发起的 API 调用失败

**解决方案**：
```bash
# 验证前端 .env 中的 NEXT_PUBLIC_FASTAPI_BACKEND_URL
# 对于 Docker：http://backend:8000（内部）或 http://localhost:8000（浏览器）
# 检查后端是否运行：
docker-compose logs backend
```

#### 3. 文件上传错误

**问题**：文件处理失败

**解决方案**：
```bash
# 验证 ETL 服务配置
# 如果使用 UNSTRUCTURED 或 LLAMACLOUD，检查 API 密钥
# 对于 DOCLING（默认），不需要密钥

# 检查 Celery worker 是否运行：
docker-compose logs backend | grep celery
```

#### 4. Celery 任务未处理

**问题**：后台任务卡住或未运行

**解决方案**：
```bash
# 检查 Redis 是否运行
docker-compose ps redis

# 检查后端日志中的 Celery worker
docker-compose logs backend | grep "celery worker"

# 对于生产环境，取消注释并启动单独的 celery_worker 服务
```

#### 5. 权限被拒绝错误

**问题**：Docker 卷权限问题

**解决方案**：
```bash
# 修复卷权限
sudo chown -R $USER:$USER postgres_data pgadmin_data redis_data

# 或重新创建卷
docker-compose down -v
docker-compose up -d
```

#### 6. 端口已被占用

**问题**：无法启动服务，端口冲突

**解决方案**：
```bash
# 在 .env 文件中更改端口
FRONTEND_PORT=3001
BACKEND_PORT=8001
POSTGRES_PORT=5433

# 然后重启服务
docker-compose down
docker-compose up -d
```

### 获取帮助

- **文档**：https://www.surfsense.net/docs
- **Discord 社区**：https://discord.gg/ejRNvftDp9
- **GitHub Issues**：https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues
- **路线图**：https://github.com/users/MODSetter/projects/2

### 健康检查

验证所有服务是否正常运行：

```bash
# 检查所有容器
docker-compose ps

# 检查后端健康状态
curl http://localhost:8000/health

# 检查前端
curl http://localhost:3000

# 查看所有服务的日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs backend
docker-compose logs frontend
```

## 下一步

1. **创建您的第一个空间**：登录并创建知识空间
2. **上传文档**：向您的知识库添加文档
3. **配置集成**：设置外部数据源（Slack、GitHub 等）
4. **自定义 LLM 设置**：配置您偏好的 AI 模型
5. **安装浏览器扩展**：将网页保存到您的知识库
6. **探索功能**：尝试研究助手、播客生成和聊天功能

详细功能文档请访问：https://www.surfsense.net/docs

---

**注意**：SurfSense 正在积极开发中。查看[路线图](https://github.com/users/MODSetter/projects/2)了解即将推出的功能和改进。
