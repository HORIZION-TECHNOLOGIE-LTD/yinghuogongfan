# 快速集成方案 - 推荐的开源项目和库

## 概述

基于功能差距分析，这里列出可以**快速集成**的开源项目和现成库，帮助快速实现缺失功能。

## 🚀 优先级 P0 - 立即可用的方案

### 1. AI 文案生成器（最快集成 - 1周）

#### 方案 A: 集成 LangChain Prompt Templates（推荐）
**已包含在项目中** - 只需扩展即可

```python
# surfsense_backend/app/agents/copywriter.py

from langchain.prompts import ChatPromptTemplate
from langchain_litellm import ChatLiteLLM

class CopywriterAgent:
    def __init__(self):
        self.llm = ChatLiteLLM(model="gpt-4")
    
    # 小红书文案模板
    XIAOHONGSHU_TEMPLATE = """
    产品名称: {product_name}
    产品特点: {features}
    目标人群: {target_audience}
    
    生成一篇小红书风格的产品推荐文案，包括：
    1. 吸睛标题（带emoji）
    2. 开头引起共鸣
    3. 3-5个产品亮点
    4. 购买理由
    5. 结尾call to action
    6. 相关话题标签
    
    语气：轻松活泼，真诚分享
    """
    
    async def generate_xiaohongshu(self, product_info: dict) -> str:
        prompt = ChatPromptTemplate.from_template(self.XIAOHONGSHU_TEMPLATE)
        chain = prompt | self.llm
        result = await chain.ainvoke(product_info)
        return result.content
```

**集成时间**: 2-3 天
**依赖**: 已安装（LangChain + LiteLLM）

#### 方案 B: 使用 Vercel AI SDK Templates
**已包含在项目中** (@ai-sdk/react)

```typescript
// surfsense_web/components/copywriter/CopywriterTool.tsx

import { useChat } from '@ai-sdk/react';

const COPYWRITING_PROMPTS = {
  xiaohongshu: `生成小红书风格文案...`,
  seo: `生成SEO优化文章...`,
  email: `生成营销邮件...`,
};

export function CopywriterTool() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/copywriter',
  });
  
  return (
    // UI 组件
  );
}
```

**集成时间**: 1-2 天
**依赖**: 已安装（@ai-sdk/react）

### 2. 模板库（最快 - 2-3天）

#### 开源模板集成

**网站模板**:
- [Free Tailwind Templates](https://github.com/tailwindtoolbox/Tailwind-Toolbox) - MIT License
- [Cruip Templates](https://github.com/cruip/tailwind-landing-page-template) - MIT License
- [TailwindUI Free Components](https://tailwindui.com/components)

**文案模板**:
```typescript
// surfsense_web/lib/templates/copywriting-templates.ts

export const COPYWRITING_TEMPLATES = {
  xiaohongshu: {
    name: '小红书种草文',
    prompt: '...',
    example: '...',
    tags: ['社交媒体', '电商']
  },
  product_description: {
    name: '产品描述',
    prompt: '...',
    example: '...',
    tags: ['电商', 'SEO']
  },
  // ... 更多模板
};
```

**集成时间**: 2-3 天
**依赖**: 无需新增

## 🔥 优先级 P0 - 需要开发但有现成库

### 3. AI 图像生成（2周）

#### 方案 A: Replicate API（推荐 - 最简单）

```bash
pip install replicate
```

```python
# surfsense_backend/app/agents/image_generator.py

import replicate
import os

class ImageGeneratorAgent:
    def __init__(self):
        self.client = replicate.Client(api_token=os.environ["REPLICATE_API_TOKEN"])
    
    async def text_to_image(
        self,
        prompt: str,
        model: str = "stability-ai/sdxl:latest"
    ) -> str:
        """文生图 - 使用 Stable Diffusion XL"""
        output = self.client.run(
            model,
            input={
                "prompt": prompt,
                "width": 1024,
                "height": 1024,
                "num_outputs": 1
            }
        )
        return output[0]  # 返回图片 URL
    
    async def image_to_image(
        self,
        image_url: str,
        prompt: str,
        strength: float = 0.8
    ) -> str:
        """图生图"""
        output = self.client.run(
            "stability-ai/sdxl:latest",
            input={
                "image": image_url,
                "prompt": prompt,
                "strength": strength
            }
        )
        return output[0]
    
    async def remove_background(self, image_url: str) -> str:
        """背景移除"""
        output = self.client.run(
            "cjwbw/rembg:latest",
            input={"image": image_url}
        )
        return output
```

**集成时间**: 3-5 天
**费用**: 按使用量付费（$0.01-0.1 per image）
**优势**: 无需 GPU，API 简单

#### 方案 B: 自托管 Stable Diffusion（免费但复杂）

```bash
pip install diffusers transformers accelerate
```

```python
from diffusers import StableDiffusionPipeline
import torch

class LocalImageGenerator:
    def __init__(self):
        self.pipe = StableDiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch.float16
        ).to("cuda")
    
    async def generate(self, prompt: str) -> bytes:
        image = self.pipe(prompt).images[0]
        # 转换为 bytes
        return image
```

**集成时间**: 1-2 周（需要 GPU 配置）
**费用**: GPU 服务器成本
**优势**: 完全自主控制

#### 推荐方案: Replicate API
- ✅ 快速集成（3-5天）
- ✅ 无需 GPU
- ✅ 稳定可靠
- ✅ 支持多种模型

### 4. 多模态理解增强（2周）

#### 方案: 集成 Gemini 1.5 Pro（推荐）

```bash
pip install google-generativeai
```

```python
# surfsense_backend/app/agents/multimodal.py

import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

class MultimodalAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    async def analyze_image(self, image_path: str, prompt: str = None) -> dict:
        """分析图片"""
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        if not prompt:
            prompt = "详细描述这张图片的内容，包括物体、场景、颜色、情感等"
        
        response = self.model.generate_content([prompt, image_data])
        return {
            "description": response.text,
            "model": "gemini-1.5-pro"
        }
    
    async def analyze_video(self, video_path: str) -> dict:
        """分析视频"""
        video_file = genai.upload_file(video_path)
        
        prompt = """
        分析这个视频，提供：
        1. 内容总结
        2. 关键场景
        3. 主要对象
        4. 情感基调
        """
        
        response = self.model.generate_content([prompt, video_file])
        return {
            "summary": response.text,
            "model": "gemini-1.5-pro"
        }
    
    async def extract_pdf_content(self, pdf_path: str) -> dict:
        """提取 PDF 内容（包括图表）"""
        pdf_file = genai.upload_file(pdf_path)
        
        prompt = "提取这个 PDF 的所有内容，包括文字、图表、表格"
        
        response = self.model.generate_content([prompt, pdf_file])
        return {
            "content": response.text,
            "has_images": True
        }
```

**集成时间**: 1 周
**费用**: Google Cloud 按使用量付费
**优势**: 
- ✅ 最强多模态能力
- ✅ 支持超长上下文（2M tokens）
- ✅ 原生支持图片、视频、PDF

## 🔶 优先级 P1 - 需要更多开发

### 5. AI 网站生成器（3-4周）

#### 方案 A: 基于模板 + LLM 生成

**推荐开源项目**:
1. **[v0.dev](https://v0.dev) 的开源替代**:
   - [GPT Engineer](https://github.com/gpt-engineer-org/gpt-engineer)
   - [Screenshot to Code](https://github.com/abi/screenshot-to-code)

2. **Web Builder 库**:
   - [GrapesJS](https://github.com/GrapesJS/grapesjs) - 可视化编辑器
   - [Craft.js](https://github.com/prevwong/craft.js) - React 页面构建器

**集成方案**:

```typescript
// surfsense_web/components/website-builder/WebsiteGenerator.tsx

import { useChat } from '@ai-sdk/react';
import GrapesJS from 'grapesjs';

export function WebsiteGenerator() {
  const generateWebsite = async (content: string) => {
    // 1. 使用 LLM 分析内容结构
    const structure = await analyzeContent(content);
    
    // 2. 选择模板
    const template = selectTemplate(structure.type);
    
    // 3. 生成页面组件
    const components = await generateComponents(structure, template);
    
    // 4. 渲染到 GrapesJS
    editor.setComponents(components);
    
    return editor.getHtml();
  };
  
  return (
    // UI 组件
  );
}
```

**依赖安装**:
```bash
npm install grapesjs grapesjs-blocks-basic
```

**集成时间**: 3-4 周
**难度**: 中等

#### 方案 B: 集成 AI 代码生成（更快）

使用现有的 AI 代码生成服务:
- **OpenAI Codex** - 通过 API
- **GitHub Copilot API** - 如果可用
- **Anthropic Claude** - 代码生成能力强

```python
# surfsense_backend/app/agents/website_builder.py

from langchain_litellm import ChatLiteLLM

class WebsiteBuilderAgent:
    def __init__(self):
        self.llm = ChatLiteLLM(model="claude-3-5-sonnet-20241022")
    
    async def generate_website_code(
        self,
        content: str,
        template: str = "landing_page"
    ) -> dict:
        """生成网站代码"""
        
        prompt = f"""
        基于以下内容生成一个完整的网站：
        
        内容: {content}
        模板类型: {template}
        
        要求：
        1. 使用 Next.js 15 + TypeScript
        2. 使用 Tailwind CSS 4
        3. 响应式设计
        4. SEO 优化
        5. 包含完整的 HTML 结构
        
        生成以下文件：
        - page.tsx
        - layout.tsx
        - globals.css
        
        使用 JSON 格式返回，key 为文件名，value 为代码
        """
        
        response = await self.llm.ainvoke(prompt)
        return parse_code_response(response.content)
```

**集成时间**: 2-3 周
**难度**: 中等

### 6. 知识图谱（3-4周）

#### 推荐开源项目

1. **[LlamaIndex KnowledgeGraph](https://docs.llamaindex.ai/en/stable/examples/index_structs/knowledge_graph/)** - 已在项目中

```python
# surfsense_backend/app/agents/knowledge_graph.py

from llama_index.core import KnowledgeGraphIndex
from llama_index.core.graph_stores import SimpleGraphStore
from llama_index.llms.litellm import LiteLLM

class KnowledgeGraphAgent:
    def __init__(self):
        self.graph_store = SimpleGraphStore()
        self.llm = LiteLLM(model="gpt-4")
    
    async def build_graph(self, documents: list) -> KnowledgeGraphIndex:
        """构建知识图谱"""
        index = KnowledgeGraphIndex.from_documents(
            documents,
            storage_context=self.graph_store,
            llm=self.llm,
            max_triplets_per_chunk=2
        )
        return index
    
    async def query_graph(self, query: str) -> dict:
        """查询知识图谱"""
        query_engine = self.index.as_query_engine(
            include_text=True,
            response_mode="tree_summarize"
        )
        response = query_engine.query(query)
        return {
            "answer": response.response,
            "source_nodes": response.source_nodes
        }
```

**集成时间**: 2-3 周
**依赖**: 已安装（llama-index）

2. **[Neo4j](https://neo4j.com/)** - 图数据库（更强大）

```bash
pip install neo4j langchain-neo4j
```

```python
from langchain_neo4j import Neo4jGraph

graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)
```

**集成时间**: 3-4 周
**需要**: Neo4j 数据库服务器

## 📦 推荐的集成顺序

### Week 1-2: 快速见效
1. ✅ **AI 文案生成器** - 使用现有的 LangChain + LiteLLM
   - 添加提示词模板
   - 创建前端 UI
   - 集成到现有对话系统

2. ✅ **模板库** - 使用开源模板
   - 集成 Tailwind 模板
   - 添加文案模板
   - 创建模板选择界面

### Week 3-4: 图像能力
3. ✅ **AI 图像生成** - 集成 Replicate API
   - 文生图功能
   - 背景移除
   - 简单的图片编辑

### Week 5-6: 多模态
4. ✅ **多模态理解** - 集成 Gemini 1.5 Pro
   - 图像理解
   - 视频分析
   - PDF 深度解析

### Week 7-10: 核心功能
5. ✅ **AI 网站生成器** - GrapesJS + LLM
   - 模板系统
   - 代码生成
   - 预览和编辑
   - 部署集成

### Week 11-14: 高级功能
6. ✅ **知识图谱** - LlamaIndex KnowledgeGraph
   - 实体关系提取
   - 图谱可视化
   - 智能推荐

## 🛠️ 技术选型建议

### 必须使用（已在项目中）
- ✅ LangChain + LangGraph - Agent 框架
- ✅ LiteLLM - 统一 LLM 接口
- ✅ FastAPI - 后端 API
- ✅ Next.js 15 - 前端框架
- ✅ PostgreSQL + pgvector - 数据库

### 推荐新增
- 🔥 **Replicate** - AI 模型 API（图像生成）
- 🔥 **Google Gemini** - 多模态理解
- 🔥 **GrapesJS** - 可视化网站编辑器
- 🔷 Neo4j - 图数据库（可选）

### 避免使用
- ❌ 复杂的自托管 GPU 方案（初期）
- ❌ 从零开发网站编辑器
- ❌ 过度复杂的架构

## 💰 成本估算

### API 费用（月度估算 - 1000 用户）
- **OpenAI GPT-4**: ~$500-1000
- **Replicate (图像)**: ~$300-500
- **Google Gemini**: ~$200-400
- **总计**: ~$1000-2000/月

### 开发成本（人月）
- AI 文案生成器: 0.5 人月
- 模板库: 0.5 人月
- AI 图像生成: 1 人月
- 多模态理解: 1 人月
- AI 网站生成器: 2 人月
- 知识图谱: 1.5 人月
- **总计**: 6.5 人月

## 📝 快速启动代码

### 1. AI 文案生成器（立即可用）

```python
# surfsense_backend/app/routes/copywriter.py

from fastapi import APIRouter, HTTPException
from app.agents.copywriter import CopywriterAgent

router = APIRouter(prefix="/api/v1/copywriter", tags=["Copywriter"])

@router.post("/generate")
async def generate_copy(
    type: str,  # "xiaohongshu", "seo", "email"
    product_info: dict
):
    agent = CopywriterAgent()
    
    if type == "xiaohongshu":
        result = await agent.generate_xiaohongshu(product_info)
    elif type == "seo":
        result = await agent.generate_seo_content(product_info)
    # ... 更多类型
    
    return {"content": result}
```

### 2. 图像生成 API

```python
# surfsense_backend/app/routes/image_generation.py

from fastapi import APIRouter, UploadFile
from app.agents.image_generator import ImageGeneratorAgent

router = APIRouter(prefix="/api/v1/images", tags=["Images"])

@router.post("/generate")
async def generate_image(prompt: str, style: str = "realistic"):
    agent = ImageGeneratorAgent()
    image_url = await agent.text_to_image(prompt, style)
    return {"image_url": image_url}

@router.post("/remove-background")
async def remove_background(file: UploadFile):
    agent = ImageGeneratorAgent()
    # 上传到临时存储
    temp_url = await upload_temp(file)
    result_url = await agent.remove_background(temp_url)
    return {"image_url": result_url}
```

### 3. 前端集成

```typescript
// surfsense_web/app/dashboard/[search_space_id]/copywriter/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CopywriterPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCopy = async (type: string) => {
    setLoading(true);
    const response = await fetch('/api/copywriter/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        product_info: { description: prompt }
      })
    });
    const data = await response.json();
    setResult(data.content);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI 文案生成器</h1>
      
      <Textarea
        placeholder="输入产品信息..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
      />
      
      <div className="flex gap-4 mt-4">
        <Button onClick={() => generateCopy('xiaohongshu')}>
          小红书文案
        </Button>
        <Button onClick={() => generateCopy('seo')}>
          SEO 文章
        </Button>
        <Button onClick={() => generateCopy('email')}>
          营销邮件
        </Button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">生成结果：</h3>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
```

## 🎯 总结

### 最快集成方案（1-2周）
1. **AI 文案生成器** - 使用现有 LangChain + 提示词模板
2. **模板库** - 集成开源 Tailwind 模板
3. **基础 UI** - 使用现有 Shadcn 组件

### 中等难度（3-4周）
4. **AI 图像生成** - Replicate API 集成
5. **多模态理解** - Google Gemini 集成

### 复杂功能（2-3月）
6. **AI 网站生成器** - GrapesJS + LLM
7. **知识图谱** - LlamaIndex + Neo4j

**推荐**: 从 AI 文案生成器开始，因为它最容易集成且能立即产生价值！
