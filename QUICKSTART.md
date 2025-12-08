# SurfSense 快速部署指南 / Quick Deployment Guide

[English](#english) | [中文](#中文)

---

## 中文

### 🚀 快速开始

#### 方式 1: 使用 Docker Compose（本地构建）

```bash
# 1. 克隆仓库
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# 2. 配置环境变量
cp .env.example .env
cp surfsense_backend/.env.example surfsense_backend/.env
cp surfsense_web/.env.example surfsense_web/.env

# 3. 编辑配置文件
vim .env
vim surfsense_backend/.env

# 4. 启动所有服务（会自动构建镜像）
docker-compose up -d

# 5. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

#### 方式 2: 使用预构建镜像（推荐生产环境）

```bash
# 1. 克隆仓库
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# 2. 配置环境变量
cp .env.example .env
cp surfsense_backend/.env.example surfsense_backend/.env

# 3. 使用预构建镜像启动
docker-compose -f docker-compose.prebuilt.yml up -d
```

#### 方式 3: 手动构建 Docker 镜像

```bash
# 构建所有镜像
./build-images.sh

# 仅构建后端
./build-images.sh --backend-only

# 仅构建前端
./build-images.sh --frontend-only

# 指定版本标签
./build-images.sh --tag v1.0.0

# 查看更多选项
./build-images.sh --help
```

### 📦 镜像打包

#### 本地打包

```bash
# 1. 构建镜像
./build-images.sh --tag v1.0.0

# 2. 查看构建的镜像
docker images | grep surfsense

# 3. 保存镜像为文件（可选）
docker save ghcr.io/horizion-technologie-ltd/surfsense_backend:v1.0.0 -o surfsense_backend_v1.0.0.tar
docker save ghcr.io/horizion-technologie-ltd/surfsense_ui:v1.0.0 -o surfsense_ui_v1.0.0.tar

# 4. 加载镜像文件（在其他机器上）
docker load -i surfsense_backend_v1.0.0.tar
docker load -i surfsense_ui_v1.0.0.tar
```

#### 推送到镜像仓库

```bash
# 1. 登录到 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. 构建并推送
./build-images.sh --tag v1.0.0 --push

# 或使用自定义仓库
./build-images.sh --registry your-registry.com/org --tag v1.0.0 --push
```

### 🔧 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v

# 更新镜像
docker-compose pull
docker-compose up -d
```

### 📚 详细文档

- **完整部署指南**: [DEPLOYMENT.zh-CN.md](DEPLOYMENT.zh-CN.md)
- **GitHub Actions 自动化**: 查看 `.github/workflows/` 目录
- **官方文档**: https://www.surfsense.net/docs/

---

## English

### 🚀 Quick Start

#### Option 1: Using Docker Compose (Build Locally)

```bash
# 1. Clone repository
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# 2. Configure environment variables
cp .env.example .env
cp surfsense_backend/.env.example surfsense_backend/.env
cp surfsense_web/.env.example surfsense_web/.env

# 3. Edit configuration files
vim .env
vim surfsense_backend/.env

# 4. Start all services (will build images automatically)
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Option 2: Using Pre-built Images (Recommended for Production)

```bash
# 1. Clone repository
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# 2. Configure environment variables
cp .env.example .env
cp surfsense_backend/.env.example surfsense_backend/.env

# 3. Start using pre-built images
docker-compose -f docker-compose.prebuilt.yml up -d
```

#### Option 3: Manual Docker Image Build

```bash
# Build all images
./build-images.sh

# Build backend only
./build-images.sh --backend-only

# Build frontend only
./build-images.sh --frontend-only

# Specify version tag
./build-images.sh --tag v1.0.0

# See more options
./build-images.sh --help
```

### 📦 Image Packaging

#### Local Packaging

```bash
# 1. Build images
./build-images.sh --tag v1.0.0

# 2. View built images
docker images | grep surfsense

# 3. Save images to files (optional)
docker save ghcr.io/horizion-technologie-ltd/surfsense_backend:v1.0.0 -o surfsense_backend_v1.0.0.tar
docker save ghcr.io/horizion-technologie-ltd/surfsense_ui:v1.0.0 -o surfsense_ui_v1.0.0.tar

# 4. Load image files (on other machines)
docker load -i surfsense_backend_v1.0.0.tar
docker load -i surfsense_ui_v1.0.0.tar
```

#### Push to Registry

```bash
# 1. Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 2. Build and push
./build-images.sh --tag v1.0.0 --push

# Or use custom registry
./build-images.sh --registry your-registry.com/org --tag v1.0.0 --push
```

### 🔧 Common Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# Update images
docker-compose pull
docker-compose up -d
```

### 📚 Detailed Documentation

- **Full Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Actions Automation**: See `.github/workflows/` directory
- **Official Documentation**: https://www.surfsense.net/docs/
