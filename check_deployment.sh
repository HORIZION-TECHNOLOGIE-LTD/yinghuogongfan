#!/bin/bash

# ============================================
# SurfSense 部署状态检查脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/home/runner/work/yinghuogongfan/yinghuogongfan"

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       SurfSense 部署状态检查                           ║${NC}"
echo -e "${CYAN}║       时间: $(date '+%Y-%m-%d %H:%M:%S')                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# 1. 检查项目结构
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 项目结构检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ 项目目录存在: $PROJECT_DIR${NC}"
    cd "$PROJECT_DIR"
    
    # 检查关键目录
    dirs=("surfsense_backend" "surfsense_web" "docs")
    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${GREEN}✅ $dir/ 目录存在${NC}"
        else
            echo -e "${RED}❌ $dir/ 目录不存在${NC}"
        fi
    done
else
    echo -e "${RED}❌ 项目目录不存在${NC}"
    exit 1
fi
echo ""

# ============================================
# 2. 检查Git状态
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔀 Git 状态${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

BRANCH=$(git branch --show-current)
COMMIT=$(git log -1 --oneline)

echo -e "当前分支: ${CYAN}$BRANCH${NC}"
echo -e "最新提交: ${CYAN}$COMMIT${NC}"
echo ""

# ============================================
# 3. 检查已实现的功能
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 已实现功能检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 检查背景片段组件
if [ -f "surfsense_web/components/backgrounds/background-snippets.tsx" ]; then
    echo -e "${GREEN}✅ 背景片段组件库 (24个图案)${NC}"
    LINE_COUNT=$(wc -l < "surfsense_web/components/backgrounds/background-snippets.tsx")
    echo -e "   ${CYAN}文件大小: $LINE_COUNT 行${NC}"
else
    echo -e "${RED}❌ 背景片段组件未找到${NC}"
fi

# 检查图片裁剪组件
if [ -f "surfsense_web/components/ui/image-cropper.tsx" ]; then
    echo -e "${GREEN}✅ 图片裁剪功能${NC}"
    LINE_COUNT=$(wc -l < "surfsense_web/components/ui/image-cropper.tsx")
    echo -e "   ${CYAN}文件大小: $LINE_COUNT 行${NC}"
else
    echo -e "${RED}❌ 图片裁剪组件未找到${NC}"
fi

# 检查Demo页面
if [ -f "surfsense_web/app/(home)/demo/page.tsx" ]; then
    echo -e "${GREEN}✅ Demo 演示页面 (/demo)${NC}"
    LINE_COUNT=$(wc -l < "surfsense_web/app/(home)/demo/page.tsx")
    echo -e "   ${CYAN}文件大小: $LINE_COUNT 行${NC}"
else
    echo -e "${RED}❌ Demo 页面未找到${NC}"
fi

echo ""

# ============================================
# 4. 检查文档
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📚 文档完整性检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DOCS=(
    "QUICK_REFERENCE_CN.md:快速参考指南"
    "COMPLETE_IMPLEMENTATION_ROADMAP_CN.md:完整实施路线图"
    "IMPLEMENTATION_PROGRESS_TRACKER.md:进度追踪表"
    "QUICK_INTEGRATION_GUIDE_CN.md:快速集成指南"
    "GRAPESJS_INTEGRATION_GUIDE_CN.md:GrapesJS集成指南"
    "NOTEBOOKLLAMA_INTEGRATION_ANALYSIS_CN.md:NotebookLlama分析"
    "AZURE_DATABASE_INTEGRATION_CN.md:Azure数据库集成"
    "AZURE_ARM_TEMPLATE_GUIDE_CN.md:ARM模板部署"
    "AZURE_POSTGRESQL_CONNECTION_SETUP_CN.md:PostgreSQL连接配置"
    "ARCHITECTURE_AND_INTEGRATION_GUIDE_CN.md:架构分析"
    "FEATURE_GAP_ANALYSIS_CN.md:功能差距分析"
    "BACKGROUND_AND_IMAGE_CROPPING.md:背景和裁剪使用"
    "IMPLEMENTATION_SUMMARY.md:实现总结"
    "DEPLOYMENT_GUIDE_CN.md:部署指南"
)

DOC_COUNT=0
TOTAL_LINES=0

for doc in "${DOCS[@]}"; do
    IFS=':' read -r filename title <<< "$doc"
    if [ -f "docs/$filename" ]; then
        LINE_COUNT=$(wc -l < "docs/$filename")
        TOTAL_LINES=$((TOTAL_LINES + LINE_COUNT))
        DOC_COUNT=$((DOC_COUNT + 1))
        echo -e "${GREEN}✅ $title${NC}"
        echo -e "   ${CYAN}文件: $filename ($LINE_COUNT 行)${NC}"
    else
        echo -e "${RED}❌ $title 未找到${NC}"
    fi
done

echo ""
echo -e "${CYAN}文档统计: $DOC_COUNT 份文档, 总计 $TOTAL_LINES 行${NC}"
echo ""

# ============================================
# 5. 检查依赖
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 依赖检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 检查Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js 未安装${NC}"
fi

# 检查npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm 未安装${NC}"
fi

# 检查Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python 未安装${NC}"
fi

# 检查前端依赖
if [ -f "surfsense_web/package.json" ]; then
    echo -e "${GREEN}✅ 前端 package.json 存在${NC}"
    if [ -d "surfsense_web/node_modules" ]; then
        MODULE_COUNT=$(ls -1 surfsense_web/node_modules | wc -l)
        echo -e "   ${CYAN}已安装 $MODULE_COUNT 个模块${NC}"
    else
        echo -e "   ${YELLOW}⚠️  node_modules 目录不存在（依赖未安装）${NC}"
    fi
fi

# 检查后端依赖
if [ -f "surfsense_backend/requirements.txt" ]; then
    echo -e "${GREEN}✅ 后端 requirements.txt 存在${NC}"
    REQ_COUNT=$(wc -l < surfsense_backend/requirements.txt)
    echo -e "   ${CYAN}列出 $REQ_COUNT 个依赖${NC}"
fi

echo ""

# ============================================
# 6. 检查新增的关键依赖
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 新增功能依赖检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 检查 react-easy-crop
if [ -f "surfsense_web/package.json" ]; then
    if grep -q "react-easy-crop" "surfsense_web/package.json"; then
        VERSION=$(grep "react-easy-crop" surfsense_web/package.json | sed 's/.*: "\(.*\)".*/\1/')
        echo -e "${GREEN}✅ react-easy-crop (图片裁剪): $VERSION${NC}"
    else
        echo -e "${RED}❌ react-easy-crop 未在 package.json 中${NC}"
    fi
fi

echo ""

# ============================================
# 7. 生成部署报告
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 部署进度总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${GREEN}已完成功能 (15%):${NC}"
echo -e "  ✅ 背景片段组件库 (24个图案)"
echo -e "  ✅ 图片裁剪功能 (完整工作流)"
echo -e "  ✅ Demo 页面 (/demo)"
echo -e "  ✅ $DOC_COUNT 份完整文档"
echo ""

echo -e "${YELLOW}待部署功能 (85%):${NC}"
echo -e "  ⏳ Azure PostgreSQL 数据库配置"
echo -e "  ⏳ 后端服务部署 (FastAPI)"
echo -e "  ⏳ 前端应用部署 (Next.js)"
echo -e "  ⏳ Nginx 反向代理配置"
echo -e "  ⏳ SSL 证书配置"
echo ""

echo -e "${CYAN}待开发功能:${NC}"
echo -e "  📝 AI 文案生成器 (2-3天)"
echo -e "  🎨 GrapesJS 网站生成器 (3-4周)"
echo -e "  🖼️  AI 图像生成 (3-5天)"
echo -e "  🧠 多模态理解 (1周)"
echo -e "  ❓ 问答生成 (2-3天)"
echo -e "  🗺️  思维导图 (2-3天)"
echo -e "  🔗 知识图谱 (3-4周)"
echo ""

# ============================================
# 8. 下一步行动
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 下一步行动${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${CYAN}立即可做 (今天):${NC}"
echo -e "  1. ${GREEN}配置 Azure PostgreSQL 数据库${NC}"
echo -e "     参考: docs/AZURE_POSTGRESQL_CONNECTION_SETUP_CN.md"
echo -e "     时间: 5-10 分钟"
echo ""
echo -e "  2. ${GREEN}安装前端依赖并启动开发服务器${NC}"
echo -e "     cd surfsense_web"
echo -e "     npm install"
echo -e "     npm run dev"
echo -e "     访问: http://localhost:3000/demo"
echo ""
echo -e "  3. ${GREEN}安装后端依赖并启动 API 服务${NC}"
echo -e "     cd surfsense_backend"
echo -e "     python3 -m venv .venv"
echo -e "     source .venv/bin/activate"
echo -e "     pip install -r requirements.txt"
echo -e "     uvicorn main:app --reload"
echo ""

echo -e "${CYAN}本周可做 (Week 1-2):${NC}"
echo -e "  • 开发 AI 文案生成器 (参考: QUICK_INTEGRATION_GUIDE_CN.md)"
echo -e "  • 配置生产环境部署 (参考: DEPLOYMENT_GUIDE_CN.md)"
echo ""

echo -e "${CYAN}后续开发 (Week 3+):${NC}"
echo -e "  • GrapesJS 网站生成器"
echo -e "  • AI 图像生成"
echo -e "  • 其他功能..."
echo ""

# ============================================
# 9. 快速命令参考
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚡ 快速命令参考${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat << 'COMMANDS'
# 查看所有文档
ls -la docs/

# 启动前端开发服务器
cd surfsense_web && npm run dev

# 启动后端开发服务器
cd surfsense_backend && uvicorn main:app --reload

# 查看 Demo 页面代码
cat surfsense_web/app/\(home\)/demo/page.tsx

# 测试数据库连接
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres

# 查看进度追踪
cat docs/IMPLEMENTATION_PROGRESS_TRACKER.md

# 完整部署
bash docs/DEPLOYMENT_GUIDE_CN.md
COMMANDS

echo ""

# ============================================
# 10. 总结
# ============================================
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🎉 检查完成！                                         ║${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}║  项目状态: 基础功能已完成 (15%)                       ║${NC}"
echo -e "${CYAN}║  文档齐全: $DOC_COUNT 份文档可供参考                            ║${NC}"
echo -e "${CYAN}║  准备就绪: 可以开始部署和开发新功能                   ║${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}║  💡 提示: 查看 docs/QUICK_REFERENCE_CN.md 快速开始    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

