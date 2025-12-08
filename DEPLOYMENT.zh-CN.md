# SurfSense 部署指南

本文档提供了 SurfSense 项目的完整部署和 Docker 镜像打包指南。

## 目录

- [快速开始](#快速开始)
- [Docker 镜像构建](#docker-镜像构建)
- [部署方式](#部署方式)
- [环境配置](#环境配置)
- [生产环境部署](#生产环境部署)
- [常见问题](#常见问题)

## 快速开始

### 前置要求

- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

### 使用 Docker Compose 快速部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
   cd yinghuogongfan
   ```

2. **配置环境变量**
   ```bash
   # 复制环境变量示例文件
   cp .env.example .env
   
   # 编辑 .env 文件，配置必要的参数
   vim .env
   ```

3. **配置后端环境变量**
   ```bash
   # 复制后端环境变量示例文件
   cp surfsense_backend/.env.example surfsense_backend/.env
   
   # 编辑后端 .env 文件，配置 API 密钥等
   vim surfsense_backend/.env
   ```

4. **配置前端环境变量**
   ```bash
   # 复制前端环境变量示例文件
   cp surfsense_web/.env.example surfsense_web/.env
   
   # 编辑前端 .env 文件
   vim surfsense_web/.env
   ```

5. **启动所有服务**
   ```bash
   docker-compose up -d
   ```

6. **查看服务状态**
   ```bash
   docker-compose ps
   ```

7. **访问应用**
   - 前端界面: http://localhost:3000
   - 后端 API: http://localhost:8000
   - API 文档: http://localhost:8000/docs
   - pgAdmin: http://localhost:5050

8. **查看日志**
   ```bash
   # 查看所有服务日志
   docker-compose logs -f
   
   # 查看特定服务日志
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

## Docker 镜像构建

### 使用构建脚本（推荐）

项目提供了便捷的构建脚本 `build-images.sh`，支持多种构建选项。

#### 基本用法

```bash
# 构建所有镜像（后端和前端）
./build-images.sh

# 仅构建后端镜像
./build-images.sh --backend-only

# 仅构建前端镜像
./build-images.sh --frontend-only

# 指定版本标签
./build-images.sh --tag v1.0.0

# 构建并推送到镜像仓库
./build-images.sh --tag v1.0.0 --push

# 不使用缓存构建
./build-images.sh --no-cache

# 为多平台构建（AMD64 和 ARM64）
./build-images.sh --platform linux/amd64,linux/arm64 --push
```

#### 构建选项说明

| 选项 | 说明 | 示例 |
|------|------|------|
| `--backend-only` | 仅构建后端镜像 | `./build-images.sh --backend-only` |
| `--frontend-only` | 仅构建前端镜像 | `./build-images.sh --frontend-only` |
| `--tag VERSION` | 指定镜像版本标签（默认: latest） | `./build-images.sh --tag v1.0.0` |
| `--registry REGISTRY` | 指定镜像仓库地址 | `./build-images.sh --registry your-registry.com/org` |
| `--push` | 构建后推送到镜像仓库 | `./build-images.sh --tag v1.0.0 --push` |
| `--no-cache` | 不使用缓存构建 | `./build-images.sh --no-cache` |
| `--platform PLATFORM` | 指定目标平台 | `./build-images.sh --platform linux/amd64,linux/arm64` |
| `--help` | 显示帮助信息 | `./build-images.sh --help` |

### 手动构建镜像

如果您更喜欢手动控制构建过程，可以直接使用 Docker 命令。

#### 构建后端镜像

```bash
docker build -t surfsense_backend:latest -f surfsense_backend/Dockerfile surfsense_backend/
```

#### 构建前端镜像

```bash
docker build \
  --build-arg NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000 \
  --build-arg NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL \
  --build-arg NEXT_PUBLIC_ETL_SERVICE=DOCLING \
  -t surfsense_ui:latest \
  -f surfsense_web/Dockerfile \
  surfsense_web/
```

#### 为多平台构建

```bash
# 创建 buildx 构建器
docker buildx create --name multiarch --use

# 构建多平台镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/horizion-technologie-ltd/surfsense_backend:latest \
  -f surfsense_backend/Dockerfile \
  --push \
  surfsense_backend/
```

## 部署方式

### 方式 1: 本地开发部署

使用 Docker Compose 在本地环境快速部署，适合开发和测试。

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f
```

### 方式 2: 生产环境部署

在生产环境中，建议分别部署各个服务以提高可扩展性和可维护性。

#### 2.1 使用自定义镜像

```bash
# 使用自己构建的镜像
docker-compose -f docker-compose.yml up -d

# 或者修改 docker-compose.yml 中的 image 字段
# 将 build 改为 image，例如：
# image: ghcr.io/horizion-technologie-ltd/surfsense_backend:v1.0.0
```

#### 2.2 启用 Celery 服务

在生产环境中，建议启用 Celery Worker、Beat 和 Flower 服务以处理异步任务。

编辑 `docker-compose.yml`，取消注释以下服务：
- `celery_worker`
- `celery_beat`
- `flower`

然后重新启动服务：

```bash
docker-compose up -d
```

#### 2.3 配置反向代理

推荐使用 Nginx 或 Caddy 作为反向代理：

**Nginx 配置示例：**

```nginx
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 方式 3: Kubernetes 部署

对于大规模生产环境，可以使用 Kubernetes 进行容器编排。

```yaml
# 示例 Kubernetes 部署配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: surfsense-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: surfsense-backend
  template:
    metadata:
      labels:
        app: surfsense-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/horizion-technologie-ltd/surfsense_backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: surfsense-secrets
              key: database-url
```

## 环境配置

### 必需的环境变量

#### 根目录 .env 文件

```env
# 数据库配置
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis 配置
REDIS_PORT=6379

# 后端配置
BACKEND_PORT=8000

# 前端配置
FRONTEND_PORT=3000
NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING

# pgAdmin 配置
PGADMIN_PORT=5050
PGADMIN_DEFAULT_EMAIL=admin@surfsense.com
PGADMIN_DEFAULT_PASSWORD=admin_password

# Celery 配置
FLOWER_PORT=5555
```

#### 后端 .env 文件 (surfsense_backend/.env)

请参考 `surfsense_backend/.env.example` 文件配置以下内容：

- **认证配置**: OAuth 密钥、JWT 密钥等
- **LLM 配置**: OpenAI、Anthropic、Google 等 API 密钥
- **ETL 服务配置**: Unstructured.io、LlamaCloud 或 Docling
- **搜索引擎配置**: Tavily、SearxNG 等
- **其他集成服务**: Slack、Jira、Gmail 等

#### 前端 .env 文件 (surfsense_web/.env)

请参考 `surfsense_web/.env.example` 文件配置。

## 生产环境部署

### 安全建议

1. **使用强密码**
   - 为所有服务（数据库、pgAdmin、认证等）设置强密码
   - 定期更换密码

2. **启用 HTTPS**
   - 使用 Let's Encrypt 获取免费 SSL 证书
   - 配置反向代理支持 HTTPS

3. **限制端口访问**
   - 仅暴露必要的端口（如 80、443）
   - 使用防火墙限制其他端口的访问

4. **数据备份**
   - 定期备份 PostgreSQL 数据库
   - 备份配置文件和环境变量

5. **监控和日志**
   - 配置日志聚合服务
   - 设置监控告警

### 性能优化

1. **数据库优化**
   ```sql
   -- 创建必要的索引
   -- 定期清理旧数据
   -- 配置连接池
   ```

2. **Redis 优化**
   - 配置持久化策略
   - 设置合适的内存限制

3. **应用优化**
   - 配置 Celery 并发数
   - 启用 CDN 加速静态资源
   - 使用负载均衡

### 扩展性

1. **水平扩展**
   - 增加后端服务实例
   - 增加 Celery Worker 实例
   - 使用负载均衡器分发请求

2. **垂直扩展**
   - 增加服务器资源（CPU、内存）
   - 优化数据库性能

## 镜像仓库

### GitHub Container Registry (GHCR)

项目使用 GitHub Container Registry 托管 Docker 镜像。

#### 登录 GHCR

```bash
# 使用 GitHub Personal Access Token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

#### 拉取镜像

```bash
# 拉取后端镜像
docker pull ghcr.io/horizion-technologie-ltd/surfsense_backend:latest

# 拉取前端镜像
docker pull ghcr.io/horizion-technologie-ltd/surfsense_ui:latest
```

#### 推送镜像

```bash
# 使用构建脚本推送
./build-images.sh --tag v1.0.0 --push

# 或手动推送
docker push ghcr.io/horizion-technologie-ltd/surfsense_backend:v1.0.0
```

### 使用其他镜像仓库

您也可以使用 Docker Hub、阿里云容器镜像服务等其他镜像仓库。

```bash
# 使用自定义仓库
./build-images.sh --registry your-registry.com/org --tag v1.0.0 --push
```

## GitHub Actions 自动化

项目包含 GitHub Actions 工作流，可以自动构建和发布 Docker 镜像。

### 触发构建

1. **手动触发**
   - 进入 GitHub 仓库的 Actions 页面
   - 选择 "Build and Push Docker Image" 工作流
   - 点击 "Run workflow"
   - 选择版本增量类型（patch、minor、major）
   - 点击运行

2. **自动触发**
   - 推送标签时自动构建
   - 合并到主分支时自动构建

### 工作流说明

项目包含两个主要的工作流：

1. **docker_build.yaml**: 构建并推送带版本标签的镜像
2. **docker-publish.yml**: 构建并推送基于 commit SHA 的镜像

## 常见问题

### 1. 镜像构建失败

**问题**: 构建过程中出现依赖安装错误

**解决方案**:
- 使用 `--no-cache` 选项重新构建
- 检查网络连接
- 确保 Docker 有足够的磁盘空间

```bash
./build-images.sh --no-cache
```

### 2. 容器无法启动

**问题**: 使用 docker-compose 启动时服务无法启动

**解决方案**:
- 查看日志: `docker-compose logs -f`
- 检查环境变量配置
- 确保端口没有被占用
- 检查数据库连接

### 3. 前端无法连接后端

**问题**: 前端页面报错无法连接到后端 API

**解决方案**:
- 检查 `NEXT_PUBLIC_FASTAPI_BACKEND_URL` 环境变量
- 确保后端服务正常运行: `docker-compose ps`
- 检查网络配置

### 4. 数据库连接失败

**问题**: 后端无法连接到 PostgreSQL 数据库

**解决方案**:
- 检查 `DATABASE_URL` 环境变量
- 确保数据库服务已启动: `docker-compose ps db`
- 检查数据库密码是否正确

### 5. 镜像体积过大

**问题**: 构建的 Docker 镜像体积过大

**解决方案**:
- 使用多阶段构建（已在 Dockerfile 中实现）
- 清理不必要的缓存和临时文件
- 使用 `.dockerignore` 排除不必要的文件

### 6. 跨平台构建问题

**问题**: 在 ARM64 架构上构建或运行镜像出现问题

**解决方案**:
```bash
# 为特定平台构建
./build-images.sh --platform linux/arm64

# 或为多平台构建
./build-images.sh --platform linux/amd64,linux/arm64 --push
```

## 维护和更新

### 更新镜像

```bash
# 拉取最新代码
git pull

# 重新构建镜像
./build-images.sh --no-cache

# 重启服务
docker-compose down
docker-compose up -d
```

### 数据库迁移

```bash
# 进入后端容器
docker-compose exec backend bash

# 运行数据库迁移
alembic upgrade head
```

### 清理旧镜像

```bash
# 删除未使用的镜像
docker image prune -a

# 清理所有未使用的资源
docker system prune -a --volumes
```

## 支持

如果您在部署过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues)
2. 加入 [Discord 社区](https://discord.gg/ejRNvftDp9)
3. 参考 [官方文档](https://www.surfsense.net/docs/)

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。
