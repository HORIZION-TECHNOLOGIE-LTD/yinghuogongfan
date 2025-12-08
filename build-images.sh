#!/bin/bash
# Docker 镜像构建脚本 (Docker Image Build Script)
# 
# 此脚本用于构建 SurfSense 项目的 Docker 镜像
# This script builds Docker images for the SurfSense project
#
# 使用方法 (Usage):
#   ./build-images.sh [options]
#
# 选项 (Options):
#   --backend-only     仅构建后端镜像 (Build backend image only)
#   --frontend-only    仅构建前端镜像 (Build frontend image only)
#   --tag VERSION      指定镜像版本标签 (Specify image version tag, default: latest)
#   --registry REGISTRY 指定镜像仓库地址 (Specify registry, default: ghcr.io/horizion-technologie-ltd)
#   --push             构建后推送到镜像仓库 (Push images to registry after build)
#   --no-cache         不使用缓存构建 (Build without cache)
#   --platform PLATFORM 指定目标平台 (Specify target platform, e.g., linux/amd64,linux/arm64)
#   --help             显示帮助信息 (Show this help message)

set -e

# 默认配置 (Default configuration)
BUILD_BACKEND=true
BUILD_FRONTEND=true
TAG="latest"
REGISTRY="ghcr.io/horizion-technologie-ltd"
PUSH=false
NO_CACHE=""
PLATFORM=""

# 颜色输出 (Color output)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数 (Logging functions)
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息 (Show help message)
show_help() {
    cat << EOF
Docker 镜像构建脚本 (Docker Image Build Script)

使用方法 (Usage):
  ./build-images.sh [options]

选项 (Options):
  --backend-only      仅构建后端镜像 (Build backend image only)
  --frontend-only     仅构建前端镜像 (Build frontend image only)
  --tag VERSION       指定镜像版本标签 (Specify image version tag, default: latest)
  --registry REGISTRY 指定镜像仓库地址 (Specify registry, default: ghcr.io/horizion-technologie-ltd)
  --push              构建后推送到镜像仓库 (Push images to registry after build)
  --no-cache          不使用缓存构建 (Build without cache)
  --platform PLATFORM 指定目标平台 (Specify target platform, e.g., linux/amd64,linux/arm64)
  --help              显示帮助信息 (Show this help message)

示例 (Examples):
  # 构建所有镜像 (Build all images)
  ./build-images.sh

  # 仅构建后端镜像 (Build backend only)
  ./build-images.sh --backend-only

  # 构建并推送镜像 (Build and push images)
  ./build-images.sh --tag v1.0.0 --push

  # 为多平台构建 (Build for multiple platforms)
  ./build-images.sh --platform linux/amd64,linux/arm64 --push

  # 不使用缓存构建 (Build without cache)
  ./build-images.sh --no-cache
EOF
}

# 解析命令行参数 (Parse command line arguments)
while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BUILD_BACKEND=true
            BUILD_FRONTEND=false
            shift
            ;;
        --frontend-only)
            BUILD_BACKEND=false
            BUILD_FRONTEND=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --platform)
            PLATFORM="--platform $2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知选项 (Unknown option): $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查 Docker 是否安装 (Check if Docker is installed)
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装。请先安装 Docker。(Docker is not installed. Please install Docker first.)"
    exit 1
fi

# 显示构建配置 (Display build configuration)
log_info "================================"
log_info "Docker 镜像构建配置 (Build Configuration)"
log_info "================================"
log_info "构建后端 (Build Backend): $BUILD_BACKEND"
log_info "构建前端 (Build Frontend): $BUILD_FRONTEND"
log_info "版本标签 (Tag): $TAG"
log_info "镜像仓库 (Registry): $REGISTRY"
log_info "推送镜像 (Push): $PUSH"
log_info "不使用缓存 (No Cache): $([ -n "$NO_CACHE" ] && echo "是 (Yes)" || echo "否 (No)")"
log_info "目标平台 (Platform): $([ -n "$PLATFORM" ] && echo "${PLATFORM#--platform }" || echo "默认 (Default)")"
log_info "================================"
echo

# 加载环境变量 (Load environment variables)
if [ -f .env ]; then
    log_info "加载环境变量文件 .env (Loading environment variables from .env)"
    export $(cat .env | grep -v '^#' | xargs)
else
    log_warning "未找到 .env 文件，使用默认值 (No .env file found, using default values)"
fi

# 构建后端镜像 (Build backend image)
if [ "$BUILD_BACKEND" = true ]; then
    log_info "开始构建后端镜像 (Building backend image)..."
    BACKEND_IMAGE="${REGISTRY}/surfsense_backend:${TAG}"
    
    if docker build $NO_CACHE $PLATFORM \
        -t "$BACKEND_IMAGE" \
        -f ./surfsense_backend/Dockerfile \
        ./surfsense_backend; then
        log_success "后端镜像构建成功 (Backend image built successfully): $BACKEND_IMAGE"
        
        # 如果需要推送 (Push if requested)
        if [ "$PUSH" = true ]; then
            log_info "推送后端镜像到仓库 (Pushing backend image to registry)..."
            if docker push "$BACKEND_IMAGE"; then
                log_success "后端镜像推送成功 (Backend image pushed successfully)"
            else
                log_error "后端镜像推送失败 (Failed to push backend image)"
                exit 1
            fi
        fi
    else
        log_error "后端镜像构建失败 (Backend image build failed)"
        exit 1
    fi
    echo
fi

# 构建前端镜像 (Build frontend image)
if [ "$BUILD_FRONTEND" = true ]; then
    log_info "开始构建前端镜像 (Building frontend image)..."
    FRONTEND_IMAGE="${REGISTRY}/surfsense_ui:${TAG}"
    
    # 获取前端构建参数 (Get frontend build arguments)
    NEXT_PUBLIC_FASTAPI_BACKEND_URL=${NEXT_PUBLIC_FASTAPI_BACKEND_URL:-http://localhost:8000}
    NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=${NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE:-LOCAL}
    NEXT_PUBLIC_ETL_SERVICE=${NEXT_PUBLIC_ETL_SERVICE:-DOCLING}
    
    if docker build $NO_CACHE $PLATFORM \
        --build-arg NEXT_PUBLIC_FASTAPI_BACKEND_URL="$NEXT_PUBLIC_FASTAPI_BACKEND_URL" \
        --build-arg NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE="$NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE" \
        --build-arg NEXT_PUBLIC_ETL_SERVICE="$NEXT_PUBLIC_ETL_SERVICE" \
        -t "$FRONTEND_IMAGE" \
        -f ./surfsense_web/Dockerfile \
        ./surfsense_web; then
        log_success "前端镜像构建成功 (Frontend image built successfully): $FRONTEND_IMAGE"
        
        # 如果需要推送 (Push if requested)
        if [ "$PUSH" = true ]; then
            log_info "推送前端镜像到仓库 (Pushing frontend image to registry)..."
            if docker push "$FRONTEND_IMAGE"; then
                log_success "前端镜像推送成功 (Frontend image pushed successfully)"
            else
                log_error "前端镜像推送失败 (Failed to push frontend image)"
                exit 1
            fi
        fi
    else
        log_error "前端镜像构建失败 (Frontend image build failed)"
        exit 1
    fi
    echo
fi

# 显示构建的镜像 (Display built images)
log_info "================================"
log_info "构建完成的镜像 (Built Images)"
log_info "================================"
if [ "$BUILD_BACKEND" = true ]; then
    echo "后端 (Backend): ${REGISTRY}/surfsense_backend:${TAG}"
fi
if [ "$BUILD_FRONTEND" = true ]; then
    echo "前端 (Frontend): ${REGISTRY}/surfsense_ui:${TAG}"
fi
log_info "================================"
echo

# 显示后续步骤 (Display next steps)
log_info "后续步骤 (Next Steps):"
echo "1. 使用 docker-compose 启动服务 (Start services with docker-compose):"
echo "   docker-compose up -d"
echo
echo "2. 或者使用自定义镜像标签 (Or use custom image tags):"
if [ "$BUILD_BACKEND" = true ]; then
    echo "   docker run -d --name surfsense_backend ${REGISTRY}/surfsense_backend:${TAG}"
fi
if [ "$BUILD_FRONTEND" = true ]; then
    echo "   docker run -d --name surfsense_frontend ${REGISTRY}/surfsense_ui:${TAG}"
fi
echo
if [ "$PUSH" = false ]; then
    log_info "提示 (Tip): 使用 --push 选项可以自动推送镜像到仓库"
    log_info "Tip: Use --push option to automatically push images to registry"
fi

log_success "所有操作完成！(All operations completed!)"
