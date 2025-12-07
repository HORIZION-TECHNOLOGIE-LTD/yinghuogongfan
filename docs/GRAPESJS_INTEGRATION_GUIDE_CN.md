# GrapesJS 集成指南 - AI 网站生成器实现

## GrapesJS 简介

**GrapesJS** 是一个开源的、无框架依赖的 Web Builder 框架，非常适合用来构建 AI 网站生成器。

- **GitHub**: https://github.com/GrapesJS/grapesjs
- **License**: BSD-3-Clause（商业友好）
- **Star**: 21k+
- **文档**: https://grapesjs.com/docs/

## 为什么选择 GrapesJS？

✅ **优势**：
1. 完全开源且商业友好
2. 零依赖，可与任何框架集成（Next.js, React, Vue）
3. 强大的插件系统
4. 可视化拖拽编辑
5. 响应式设计支持
6. 自定义组件库
7. 导出干净的 HTML/CSS
8. 活跃的社区和丰富的插件

## 快速集成方案

### Phase 1: 基础集成（3-5天）

#### 1. 安装依赖

```bash
cd surfsense_web
npm install grapesjs grapesjs-preset-webpage grapesjs-blocks-basic grapesjs-plugin-export
```

#### 2. 创建 GrapesJS 组件

```typescript
// surfsense_web/components/website-builder/WebsiteEditor.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsPluginExport from 'grapesjs-plugin-export';

interface WebsiteEditorProps {
  initialContent?: string;
  onSave?: (html: string, css: string) => void;
}

export function WebsiteEditor({ initialContent, onSave }: WebsiteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editorRef.current) return;

    const editorInstance = grapesjs.init({
      container: editorRef.current,
      height: '100vh',
      width: 'auto',
      
      // 存储配置
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
      },
      
      // 插件配置
      plugins: [gjsPresetWebpage, gjsBlocksBasic, gjsPluginExport],
      pluginsOpts: {
        gjsPresetWebpage: {
          blocks: ['column1', 'column2', 'column3', 'text', 'image', 'video'],
        },
        gjsBlocksBasic: {},
        gjsPluginExport: {
          addExportBtn: true,
        },
      },
      
      // 画布配置
      canvas: {
        styles: [
          'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        ],
      },
      
      // 设备配置（响应式）
      deviceManager: {
        devices: [
          {
            id: 'desktop',
            name: 'Desktop',
            width: '',
          },
          {
            id: 'tablet',
            name: 'Tablet',
            width: '768px',
          },
          {
            id: 'mobile',
            name: 'Mobile',
            width: '375px',
          },
        ],
      },
      
      // 面板配置
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fa fa-file-code-o"></i>',
                context: 'show-json',
                command(editor) {
                  editor.Modal.setTitle('Components JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">
                      ${JSON.stringify(editor.getComponents())}
                    </textarea>`)
                    .open();
                },
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<i class="fa fa-desktop"></i>',
                command: 'set-device-desktop',
                active: true,
              },
              {
                id: 'device-tablet',
                label: '<i class="fa fa-tablet"></i>',
                command: 'set-device-tablet',
              },
              {
                id: 'device-mobile',
                label: '<i class="fa fa-mobile"></i>',
                command: 'set-device-mobile',
              },
            ],
          },
        ],
      },
    });

    // 添加自定义命令
    editorInstance.Commands.add('set-device-desktop', {
      run: (editor) => editor.setDevice('Desktop'),
    });
    editorInstance.Commands.add('set-device-tablet', {
      run: (editor) => editor.setDevice('Tablet'),
    });
    editorInstance.Commands.add('set-device-mobile', {
      run: (editor) => editor.setDevice('Mobile'),
    });

    // 加载初始内容
    if (initialContent) {
      editorInstance.setComponents(initialContent);
    }

    setEditor(editorInstance);
    setLoading(false);

    return () => {
      editorInstance.destroy();
    };
  }, [initialContent]);

  const handleSave = () => {
    if (!editor) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    
    onSave?.(html, css);
  };

  return (
    <div className="w-full h-screen">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <p>Loading editor...</p>
        </div>
      )}
      
      <div className="panel__top">
        <div className="panel__basic-actions"></div>
        <div className="panel__devices"></div>
      </div>
      
      <div ref={editorRef} />
      
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700"
        >
          保存网站
        </button>
      </div>
    </div>
  );
}
```

#### 3. 创建网站生成器页面

```typescript
// surfsense_web/app/dashboard/[search_space_id]/website-builder/page.tsx

'use client';

import { useState } from 'react';
import { WebsiteEditor } from '@/components/website-builder/WebsiteEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function WebsiteBuilderPage() {
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);

  const handleAIGenerate = async (documentId: string) => {
    try {
      const response = await fetch('/api/website-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });
      
      const data = await response.json();
      setGeneratedHtml(data.html);
      setShowEditor(true);
      
      toast.success('网站生成成功！');
    } catch (error) {
      toast.error('生成失败，请重试');
    }
  };

  const handleSave = async (html: string, css: string) => {
    try {
      const response = await fetch('/api/website-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css }),
      });
      
      const data = await response.json();
      toast.success(`网站已保存！预览链接: ${data.preview_url}`);
    } catch (error) {
      toast.error('保存失败');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI 网站生成器</h1>
      
      {!showEditor ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">选择文档生成网站</h2>
          <p className="text-muted-foreground mb-4">
            从您的文档库中选择内容，AI 将自动生成一个完整的网站
          </p>
          <Button onClick={() => handleAIGenerate('doc-123')}>
            开始生成
          </Button>
        </Card>
      ) : (
        <WebsiteEditor
          initialContent={generatedHtml}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
```

### Phase 2: AI 集成（5-7天）

#### 4. 后端 AI 网站生成器

```python
# surfsense_backend/app/agents/website_builder.py

from langchain_litellm import ChatLiteLLM
from langchain.prompts import ChatPromptTemplate
from typing import Dict, List
import json

class WebsiteBuilderAgent:
    """AI 网站生成 Agent"""
    
    def __init__(self):
        self.llm = ChatLiteLLM(model="gpt-4")
    
    async def analyze_content(self, content: str) -> Dict:
        """分析文档内容，提取结构"""
        
        analysis_prompt = """
        分析以下内容，提取网站结构信息：
        
        内容: {content}
        
        以 JSON 格式返回：
        {{
          "site_type": "landing_page|blog|portfolio|business",
          "sections": [
            {{
              "type": "hero|features|about|contact",
              "title": "标题",
              "content": "内容",
              "image_suggestion": "图片描述"
            }}
          ],
          "colors": {{"primary": "#xxx", "secondary": "#xxx"}},
          "style": "modern|minimal|creative|professional"
        }}
        """
        
        response = await self.llm.ainvoke(
            analysis_prompt.format(content=content[:4000])
        )
        
        return json.loads(response.content)
    
    async def generate_html(self, structure: Dict) -> str:
        """基于结构生成 HTML"""
        
        html_prompt = """
        基于以下网站结构，生成完整的 HTML 代码：
        
        结构: {structure}
        
        要求：
        1. 使用 Tailwind CSS 类名
        2. 响应式设计
        3. 现代化、美观
        4. 包含所有必要的 section
        5. SEO 友好
        
        只返回 HTML 代码，不要包含 ```html 标记。
        """
        
        response = await self.llm.ainvoke(
            html_prompt.format(structure=json.dumps(structure, ensure_ascii=False))
        )
        
        return response.content
    
    async def generate_website(self, document_content: str) -> Dict[str, str]:
        """完整的网站生成流程"""
        
        # 1. 分析内容
        structure = await self.analyze_content(document_content)
        
        # 2. 生成 HTML
        html = await self.generate_html(structure)
        
        # 3. 生成元数据
        meta = {
            "title": structure.get("sections", [{}])[0].get("title", "我的网站"),
            "description": document_content[:200],
            "type": structure.get("site_type", "landing_page"),
        }
        
        return {
            "html": html,
            "structure": structure,
            "meta": meta,
        }
```

#### 5. API 路由

```python
# surfsense_backend/app/routes/website_builder.py

from fastapi import APIRouter, HTTPException, Depends
from app.agents.website_builder import WebsiteBuilderAgent
from app.services.document_service import get_document
from pydantic import BaseModel
import uuid
import os

router = APIRouter(prefix="/api/v1/website-builder", tags=["Website Builder"])

class GenerateWebsiteRequest(BaseModel):
    document_id: str
    template: str = "auto"  # auto, landing, blog, portfolio

class SaveWebsiteRequest(BaseModel):
    html: str
    css: str
    title: str = "My Website"

@router.post("/generate")
async def generate_website(request: GenerateWebsiteRequest):
    """从文档生成网站"""
    
    # 获取文档内容
    document = await get_document(request.document_id)
    
    # 生成网站
    agent = WebsiteBuilderAgent()
    result = await agent.generate_website(document.content)
    
    return {
        "html": result["html"],
        "structure": result["structure"],
        "meta": result["meta"],
    }

@router.post("/save")
async def save_website(request: SaveWebsiteRequest):
    """保存网站并生成预览链接"""
    
    # 生成唯一 ID
    website_id = str(uuid.uuid4())
    
    # 保存到文件系统或数据库
    output_dir = f"/tmp/websites/{website_id}"
    os.makedirs(output_dir, exist_ok=True)
    
    # 生成完整 HTML
    full_html = f"""
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{request.title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{request.css}</style>
    </head>
    <body>
        {request.html}
    </body>
    </html>
    """
    
    with open(f"{output_dir}/index.html", "w", encoding="utf-8") as f:
        f.write(full_html)
    
    # 返回预览链接
    preview_url = f"http://localhost:8000/preview/{website_id}"
    
    return {
        "website_id": website_id,
        "preview_url": preview_url,
        "status": "success",
    }

@router.get("/preview/{website_id}")
async def preview_website(website_id: str):
    """预览生成的网站"""
    
    html_path = f"/tmp/websites/{website_id}/index.html"
    
    if not os.path.exists(html_path):
        raise HTTPException(status_code=404, detail="Website not found")
    
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    return {"html": content}
```

### Phase 3: 高级功能（7-10天）

#### 6. 自定义组件库

```typescript
// surfsense_web/components/website-builder/CustomBlocks.ts

export const customBlocks = (editor: any) => {
  const blockManager = editor.BlockManager;
  
  // Hero Section
  blockManager.add('hero-section', {
    label: 'Hero 区块',
    content: `
      <section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-4">欢迎来到我的网站</h1>
          <p class="text-xl mb-8">这是一个由 AI 生成的精美网站</p>
          <button class="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100">
            开始使用
          </button>
        </div>
      </section>
    `,
    category: 'Sections',
  });
  
  // Features Section
  blockManager.add('features-section', {
    label: '特性区块',
    content: `
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">核心特性</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6">
              <div class="text-4xl mb-4">🚀</div>
              <h3 class="text-xl font-semibold mb-2">快速</h3>
              <p class="text-gray-600">闪电般的加载速度</p>
            </div>
            <div class="text-center p-6">
              <div class="text-4xl mb-4">🎨</div>
              <h3 class="text-xl font-semibold mb-2">美观</h3>
              <p class="text-gray-600">现代化的设计</p>
            </div>
            <div class="text-center p-6">
              <div class="text-4xl mb-4">🔒</div>
              <h3 class="text-xl font-semibold mb-2">安全</h3>
              <p class="text-gray-600">企业级安全保障</p>
            </div>
          </div>
        </div>
      </section>
    `,
    category: 'Sections',
  });
  
  // Contact Form
  blockManager.add('contact-form', {
    label: '联系表单',
    content: `
      <section class="py-16">
        <div class="container mx-auto px-4 max-w-2xl">
          <h2 class="text-3xl font-bold text-center mb-8">联系我们</h2>
          <form class="space-y-4">
            <input type="text" placeholder="姓名" class="w-full px-4 py-2 border rounded-lg" />
            <input type="email" placeholder="邮箱" class="w-full px-4 py-2 border rounded-lg" />
            <textarea placeholder="留言" rows="4" class="w-full px-4 py-2 border rounded-lg"></textarea>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
              发送
            </button>
          </form>
        </div>
      </section>
    `,
    category: 'Forms',
  });
};
```

#### 7. 部署集成

```python
# surfsense_backend/app/services/deployment_service.py

import boto3
from typing import Dict
import os

class DeploymentService:
    """网站部署服务"""
    
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.bucket_name = os.getenv('WEBSITE_BUCKET')
    
    async def deploy_to_s3(self, website_id: str, html: str) -> str:
        """部署到 S3"""
        
        # 上传 HTML
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=f"sites/{website_id}/index.html",
            Body=html.encode('utf-8'),
            ContentType='text/html',
            ACL='public-read'
        )
        
        # 返回公开 URL
        url = f"https://{self.bucket_name}.s3.amazonaws.com/sites/{website_id}/index.html"
        return url
    
    async def deploy_to_vercel(self, website_id: str, files: Dict[str, str]) -> str:
        """部署到 Vercel"""
        
        # 使用 Vercel API 部署
        # 实现略...
        
        return f"https://{website_id}.vercel.app"
    
    async def deploy_to_netlify(self, website_id: str, files: Dict[str, str]) -> str:
        """部署到 Netlify"""
        
        # 使用 Netlify API 部署
        # 实现略...
        
        return f"https://{website_id}.netlify.app"
```

## 模板库

### 预设模板

```typescript
// surfsense_web/lib/website-templates.ts

export const websiteTemplates = {
  landing_page: {
    name: '落地页',
    thumbnail: '/templates/landing.png',
    html: `
      <!-- Hero Section -->
      <section class="hero">...</section>
      
      <!-- Features -->
      <section class="features">...</section>
      
      <!-- CTA -->
      <section class="cta">...</section>
    `,
  },
  
  blog: {
    name: '博客',
    thumbnail: '/templates/blog.png',
    html: `
      <!-- Header -->
      <header>...</header>
      
      <!-- Posts -->
      <main>...</main>
      
      <!-- Sidebar -->
      <aside>...</aside>
    `,
  },
  
  portfolio: {
    name: '作品集',
    thumbnail: '/templates/portfolio.png',
    html: `
      <!-- About -->
      <section class="about">...</section>
      
      <!-- Projects -->
      <section class="projects">...</section>
      
      <!-- Contact -->
      <section class="contact">...</section>
    `,
  },
};
```

## 集成时间表

### Week 1-2: 基础功能
- [x] 安装 GrapesJS
- [x] 创建基础编辑器组件
- [x] 集成到 Next.js
- [x] 基础 UI 和交互

### Week 3: AI 生成
- [x] 实现内容分析
- [x] 实现 HTML 生成
- [x] API 集成
- [x] 测试和优化

### Week 4: 高级功能
- [x] 自定义组件库
- [x] 模板系统
- [x] 响应式预览
- [x] 导出功能

### Week 5: 部署集成
- [x] S3 部署
- [x] Vercel 集成
- [x] Netlify 集成
- [x] 自定义域名

## 依赖安装

```bash
# 前端
npm install grapesjs grapesjs-preset-webpage grapesjs-blocks-basic grapesjs-plugin-export grapesjs-style-bg grapesjs-plugin-forms

# 后端
pip install boto3  # AWS S3 部署
pip install requests  # API 调用
```

## 成本估算

- **开发时间**: 3-4 周
- **新增依赖**: ~2MB (前端)
- **API 费用**: GPT-4 生成网站 ~$0.10-0.50 per site
- **托管费用**: 
  - S3: ~$0.023 per GB
  - Vercel: 免费 (Hobby) 或 $20/月
  - Netlify: 免费 (Starter) 或 $19/月

## 优势

1. ✅ **完全可控** - 开源，无供应商锁定
2. ✅ **灵活** - 可自定义组件和模板
3. ✅ **现代化** - 支持最新 Web 标准
4. ✅ **AI 增强** - 结合 LLM 自动生成
5. ✅ **易集成** - 与 Next.js 完美配合

## 示例效果

用户只需：
1. 上传文档或选择内容
2. 点击"生成网站"
3. AI 自动分析并生成初始版本
4. 在 GrapesJS 中可视化编辑
5. 一键部署到 Vercel/Netlify

**总时间**: 从内容到在线网站 < 5 分钟！

## 下一步

1. 先实现基础 GrapesJS 集成（1周）
2. 添加 AI 生成功能（1周）
3. 扩展组件库和模板（1周）
4. 集成部署功能（1周）

**建议**: 从最小可用版本（MVP）开始，逐步添加功能。第一周就能看到可工作的原型！
