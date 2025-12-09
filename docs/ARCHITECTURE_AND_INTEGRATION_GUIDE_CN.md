# SurfSense 技术架构分析与 DingAI 集成指南

## 项目概述

**SurfSense** 是一个基于全栈架构的 AI 研究助手平台，类似于 NotebookLM 和 Perplexity，但集成了个人知识库。

## 技术栈架构

### 前端架构 (surfsense_web)

#### 核心框架
- **Next.js 15.5.6** - React 全栈框架
  - App Router (新一代路由系统)
  - Server Components (服务端组件)
  - Turbopack (新一代打包工具)
  - 自动代码分割和优化

- **React 19.1.0** - UI 库
  - 最新版本，支持并发特性
  - Server Components 支持

- **TypeScript 5.8.3** - 类型安全
  - 静态类型检查
  - 提升开发体验

#### UI 组件库
- **Radix UI** - 无头组件库
  - Accordion, Dialog, Dropdown, Select 等
  - 完全可访问性支持
  - 高度可定制

- **Shadcn/ui** - 组件集合
  - 基于 Radix UI
  - 可复制粘贴的组件
  
- **Tailwind CSS 4.x** - 实用优先的 CSS 框架
  - PostCSS 集成
  - 自定义主题支持
  - 响应式设计

#### 状态管理与数据获取
- **Jotai 2.15.1** - 原子化状态管理
  - 轻量级
  - TypeScript 友好
  - React Suspense 集成

- **TanStack Query 5.90.7** - 数据获取与缓存
  - 服务器状态管理
  - 自动缓存和重新验证
  - DevTools 支持

#### AI 集成
- **Vercel AI SDK 4.3.19** (@ai-sdk/react)
  - 流式 AI 响应
  - UI 组件支持
  - 多 LLM 提供商支持

- **LlamaIndex Chat UI 0.5.17**
  - 聊天界面组件

#### 动画与交互
- **Framer Motion 12.23.22**
  - 声明式动画
  - 手势支持
  - 布局动画

#### 表单处理
- **React Hook Form 7.61.1**
  - 高性能表单
  - 验证集成

- **Zod 3.25.76**
  - Schema 验证
  - TypeScript 类型推导

#### 数据库 ORM (客户端)
- **Drizzle ORM 0.44.5**
  - TypeScript ORM
  - PostgreSQL 支持
  - 类型安全查询

#### 国际化
- **next-intl 3.26.5**
  - 多语言支持
  - 服务端和客户端

### 后端架构 (surfsense_backend)

#### 核心框架
- **FastAPI 0.115.8** - 现代 Python Web 框架
  - 自动 API 文档 (OpenAPI/Swagger)
  - 异步支持
  - 依赖注入
  - 数据验证 (Pydantic)

- **Python 3.12+** - 编程语言
  - 现代 Python 特性
  - 类型提示支持

#### 数据库与向量搜索
- **PostgreSQL** - 关系型数据库
  - 通过 asyncpg 异步访问
  
- **pgvector 0.3.6** - PostgreSQL 向量扩展
  - 向量相似度搜索
  - 高效的嵌入存储

- **SQLAlchemy** - Python ORM
  - 异步支持
  - 数据库迁移 (Alembic 1.13.0)

- **Elasticsearch 9.1.1** - 全文搜索引擎
  - 混合搜索支持
  - 日志和分析

#### AI/ML 框架
- **LangGraph 0.3.29** - AI Agent 框架
  - 状态图管理
  - 复杂工作流编排

- **LangChain 0.3.17** - AI 应用开发框架
  - LLM 链式调用
  - 工具集成
  - 向量存储

- **LiteLLM 1.77.5** - 统一 LLM 接口
  - 支持 100+ LLM 模型
  - OpenAI, Anthropic, Gemini 等
  - 成本追踪

#### 嵌入与重排
- **Sentence Transformers 3.4.1**
  - 6000+ 嵌入模型支持
  - 本地嵌入生成

- **Rerankers 0.7.1** (FlashRank)
  - 搜索结果重排序
  - 提高检索准确性

- **Chonkie 1.4.0**
  - 高级文档分块
  - 自动嵌入优化

#### 文档处理 ETL
- **Unstructured 0.16.25**
  - 支持 34+ 文档格式
  - PDF, Word, Excel 等

- **Docling 2.15.0**
  - 本地文档处理
  - 无需 API 密钥

- **LlamaCloud 0.6.25**
  - 增强解析
  - 支持 50+ 格式

#### 语音处理
- **Faster Whisper 1.1.0**
  - 语音转文本
  - 优化的 Whisper 模型

- **Kokoro 0.9.4**
  - 本地 TTS (文本转语音)
  - Podcast 生成

#### 任务队列
- **Celery 5.5.3**
  - 分布式任务队列
  - 异步文档处理
  - Podcast 生成

- **Redis 5.2.1**
  - Celery 消息代理
  - 结果后端
  - 缓存

- **Flower 2.0.1**
  - Celery 监控和管理

#### 外部集成
- **Slack SDK 3.34.0** - Slack 集成
- **Discord.py 2.5.2** - Discord 集成
- **Notion Client 2.3.0** - Notion 集成
- **GitHub3.py 4.0.1** - GitHub 集成
- **Google API Client 2.156.0** - Google 服务
- **Tavily Python 0.3.2** - 搜索引擎
- **LinkUp SDK 0.2.4** - 搜索服务
- **Firecrawl 1.12.0** - 网页抓取

#### 认证授权
- **FastAPI Users 14.0.1**
  - JWT 认证
  - OAuth 支持
  - 用户管理

### DevOps 与部署

#### 容器化
- **Docker** - 容器平台
  - Dockerfile 配置
  - 多阶段构建

- **Docker Compose** - 多容器编排
  - PostgreSQL + pgvector
  - Redis
  - Backend (FastAPI)
  - Frontend (Next.js)
  - pgAdmin (数据库管理)

#### 代码质量
- **Biome 2.1.2** - JavaScript/TypeScript 格式化和 Linting
- **Ruff 0.12.5** - Python Linting 和格式化

## 项目结构

```
yinghuogongfan/
├── surfsense_web/                 # Next.js 前端
│   ├── app/                       # App Router 页面
│   │   ├── (home)/               # 公开页面
│   │   ├── dashboard/            # 仪表板
│   │   └── api/                  # API 路由
│   ├── components/               # React 组件
│   │   ├── backgrounds/          # 背景片段组件 (新增)
│   │   ├── ui/                   # UI 组件
│   │   ├── chat/                 # 聊天组件
│   │   └── ...
│   ├── lib/                      # 工具库
│   ├── hooks/                    # React Hooks
│   ├── atoms/                    # Jotai 状态
│   └── contexts/                 # React Context
├── surfsense_backend/            # FastAPI 后端
│   ├── app/
│   │   ├── agents/              # AI Agent 逻辑
│   │   ├── routes/              # API 路由
│   │   ├── services/            # 业务逻辑
│   │   ├── connectors/          # 外部集成
│   │   ├── tasks/               # Celery 任务
│   │   └── db.py                # 数据库配置
│   ├── alembic/                 # 数据库迁移
│   └── pyproject.toml           # Python 依赖
├── surfsense_browser_extension/ # 浏览器扩展
├── docs/                        # 文档
└── docker-compose.yml           # Docker 编排
```

## API 架构

### RESTful API (FastAPI)
- **基础 URL**: `http://localhost:8000/api/v1`
- **认证**: JWT Bearer Token
- **文档**: `/docs` (Swagger UI)

### 主要端点
```
POST   /api/v1/documents/fileupload     # 文件上传
GET    /api/v1/documents/                # 获取文档列表
POST   /api/v1/chat/                     # 聊天接口
GET    /api/v1/search/                   # 搜索
POST   /api/v1/podcast/generate          # 生成播客
```

## 数据流架构

```
用户界面 (Next.js)
    ↓
API 路由 (Next.js API Routes / FastAPI)
    ↓
业务逻辑 (FastAPI Services)
    ↓
┌─────────────┬─────────────┬─────────────┐
│   数据库     │  向量存储    │  外部 API    │
│ PostgreSQL  │  pgvector   │  OpenAI等    │
└─────────────┴─────────────┴─────────────┘
    ↓
后台任务 (Celery)
    ↓
Redis (消息队列/缓存)
```

## 与 DingAI 集成方案

### 集成方式 1: API 集成

#### 前端集成 (推荐)
```typescript
// 在 surfsense_web 中创建 DingAI 连接器
// components/connectors/DingAIConnector.tsx

import { useState } from "react";

interface DingAIConfig {
  apiKey: string;
  endpoint: string;
}

export function DingAIIntegration() {
  const [config, setConfig] = useState<DingAIConfig>();
  
  const connectDingAI = async (apiKey: string) => {
    // 调用 DingAI API
    const response = await fetch('https://ding.ai/api/v1/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // 配置信息
      })
    });
    
    return response.json();
  };
  
  const sendToChat = async (message: string) => {
    // 发送消息到 DingAI
    const response = await fetch(`${config?.endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config?.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    return response.json();
  };
  
  return (
    // UI 组件
  );
}
```

#### 后端集成
```python
# surfsense_backend/app/connectors/dingai.py

from typing import Optional
import httpx
from app.config import get_settings

class DingAIConnector:
    """DingAI 集成连接器"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://ding.ai/api/v1"
        self.client = httpx.AsyncClient()
    
    async def send_message(self, message: str) -> dict:
        """发送消息到 DingAI"""
        response = await self.client.post(
            f"{self.base_url}/chat",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={"message": message}
        )
        return response.json()
    
    async def sync_knowledge_base(self, documents: list) -> dict:
        """同步知识库到 DingAI"""
        response = await self.client.post(
            f"{self.base_url}/knowledge",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={"documents": documents}
        )
        return response.json()

# API 路由
# surfsense_backend/app/routes/dingai.py

from fastapi import APIRouter, Depends
from app.connectors.dingai import DingAIConnector

router = APIRouter(prefix="/dingai", tags=["DingAI"])

@router.post("/connect")
async def connect_dingai(api_key: str):
    """连接到 DingAI"""
    connector = DingAIConnector(api_key)
    # 保存连接信息
    return {"status": "connected"}

@router.post("/sync")
async def sync_to_dingai(document_ids: list[str]):
    """同步文档到 DingAI"""
    # 获取文档并同步
    return {"status": "synced", "count": len(document_ids)}
```

### 集成方式 2: Webhook 集成

```python
# 在 DingAI 中配置 Webhook 指向 SurfSense
# surfsense_backend/app/routes/webhooks.py

from fastapi import APIRouter, Request
from app.services.webhook_handler import WebhookHandler

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/dingai")
async def dingai_webhook(request: Request):
    """接收来自 DingAI 的 Webhook"""
    payload = await request.json()
    
    # 处理不同类型的事件
    if payload["event"] == "message.received":
        # 处理新消息
        pass
    elif payload["event"] == "document.created":
        # 处理新文档
        pass
    
    return {"status": "processed"}
```

### 集成方式 3: OAuth 认证集成

```python
# surfsense_backend/app/routes/oauth.py

from fastapi import APIRouter
from authlib.integrations.starlette_client import OAuth

router = APIRouter(prefix="/oauth", tags=["OAuth"])

oauth = OAuth()
oauth.register(
    name='dingai',
    client_id='YOUR_CLIENT_ID',
    client_secret='YOUR_CLIENT_SECRET',
    authorize_url='https://ding.ai/oauth/authorize',
    access_token_url='https://ding.ai/oauth/token',
)

@router.get("/dingai/login")
async def dingai_login():
    """发起 DingAI OAuth 登录"""
    redirect_uri = "http://localhost:3000/oauth/callback"
    return await oauth.dingai.authorize_redirect(redirect_uri)

@router.get("/dingai/callback")
async def dingai_callback(code: str):
    """处理 DingAI OAuth 回调"""
    token = await oauth.dingai.authorize_access_token()
    # 保存 token 并创建用户会话
    return {"access_token": token["access_token"]}
```

### 集成方式 4: 共享数据库集成

如果 DingAI 支持外部数据库连接：

```python
# 配置额外的数据库连接
# surfsense_backend/app/config.py

class Settings:
    # 现有 PostgreSQL
    DATABASE_URL: str
    
    # DingAI 数据库连接
    DINGAI_DATABASE_URL: str = "postgresql://..."
    
settings = get_settings()
```

### 集成方式 5: LangChain 工具集成

```python
# surfsense_backend/app/agents/tools/dingai_tool.py

from langchain.tools import BaseTool
from typing import Optional
from pydantic import Field

class DingAITool(BaseTool):
    """DingAI 集成工具"""
    
    name: str = "dingai_query"
    description: str = "查询 DingAI 获取信息"
    api_key: str = Field(..., description="DingAI API Key")
    
    def _run(self, query: str) -> str:
        """执行 DingAI 查询"""
        # 调用 DingAI API
        response = self._call_dingai_api(query)
        return response
    
    async def _arun(self, query: str) -> str:
        """异步执行"""
        return self._run(query)
    
    def _call_dingai_api(self, query: str) -> str:
        # 实现 API 调用
        pass

# 在 LangGraph Agent 中使用
from langgraph.prebuilt import create_react_agent

tools = [DingAITool(api_key="your_key")]
agent = create_react_agent(llm, tools)
```

## 部署方式

### Docker 部署 (推荐)
```bash
# 克隆仓库
git clone https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan.git
cd yinghuogongfan

# 配置环境变量
cp surfsense_backend/.env.example surfsense_backend/.env
cp surfsense_web/.env.example surfsense_web/.env

# 启动服务
docker-compose up -d

# 访问
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 手动部署

#### 后端
```bash
cd surfsense_backend

# 安装 uv (快速 Python 包管理器)
pip install uv

# 安装依赖
uv sync

# 运行数据库迁移
uv run alembic upgrade head

# 启动后端
uv run uvicorn main:app --reload
```

#### 前端
```bash
cd surfsense_web

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 可能的 DingAI 集成点

### 1. 知识库同步
- SurfSense 的文档可以同步到 DingAI
- 使用 API 或 Webhook 实现双向同步

### 2. AI 能力增强
- DingAI 作为额外的 LLM 提供商
- 通过 LiteLLM 统一接口集成

### 3. 协作功能
- 团队成员可以在两个平台间共享知识
- 实时协作和同步

### 4. 智能路由
- 根据查询类型路由到 SurfSense 或 DingAI
- 结合两个系统的优势

### 5. 数据分析
- DingAI 分析 SurfSense 的数据
- 提供洞察和建议

## 建议的集成步骤

1. **调研 DingAI API**
   - 了解 DingAI 的 API 文档
   - 确定支持的集成方式

2. **创建连接器**
   - 在后端实现 DingAI 连接器
   - 封装 API 调用逻辑

3. **添加 UI**
   - 在前端添加 DingAI 配置页面
   - 提供连接和管理界面

4. **实现同步逻辑**
   - 文档同步
   - 用户数据同步
   - 聊天历史同步

5. **测试集成**
   - 单元测试
   - 集成测试
   - 端到端测试

6. **部署上线**
   - 逐步发布
   - 监控和优化

## 总结

**SurfSense 是一个现代化的全栈 AI 应用**:

### 前端特点
- Next.js 15 + React 19 最新技术栈
- TypeScript 类型安全
- 优秀的 UI/UX (Radix + Tailwind)
- 强大的状态管理 (Jotai + TanStack Query)

### 后端特点
- FastAPI 高性能异步框架
- LangGraph/LangChain AI Agent 系统
- pgvector 向量搜索
- 支持 100+ LLM 模型
- 丰富的外部集成

### 集成 DingAI 的优势
- 两个系统可以互补
- 共享知识库和 AI 能力
- 提供更全面的解决方案
- 增强用户体验

**推荐的集成方式**: 通过 API 集成，使用后端连接器模式，前端提供配置界面。这样可以保持系统独立性，同时实现数据和功能的互通。
