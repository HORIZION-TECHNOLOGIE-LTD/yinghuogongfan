# SurfSense 集成指南（中文版）

本指南说明如何将 SurfSense 集成到现有网站或应用程序中，例如 BuildingAI。

## 📚 文档文件

### 核心文档
- **[INTEGRATION.md](INTEGRATION.md)** - 完整的集成指南（英文），涵盖所有部署方法
  - 子域部署
  - 子路径部署
  - iframe 嵌入
  - API 集成
  - 组件库使用

### 配置文件

#### Nginx 配置 (`nginx/`)
- **surfsense-subdomain.conf** - 在子域上部署（例如 `surfsense.buildingai.com`）
- **surfsense-subpath.conf** - 在子路径下部署（例如 `buildingai.com/surfsense`）
- **surfsense-iframe.conf** - 配置 iframe 嵌入，包含适当的 CORS/CSP 头

### 示例文件 (`examples/`)

#### HTML 示例
- **integration-example.html** - 通过 iframe 嵌入 SurfSense 的完整页面示例
  - 中文界面
  - 演示 iframe 集成
  - 包含父页面和 iframe 之间的消息传递
  
- **api-integration-example.html** - API 集成演示
  - 展示如何使用 SurfSense REST API
  - 包括身份验证、研究查询、文档上传
  - 可作为独立测试工具使用

## 🚀 快速集成指南

### 方案 1：子域部署（推荐）

**适用于：** 生产环境部署，您希望 SurfSense 成为一级服务

1. 使用 Docker 部署 SurfSense：
   ```bash
   docker-compose up -d
   ```

2. 使用 `nginx/surfsense-subdomain.conf` 配置 nginx

3. 设置 DNS：
   ```
   surfsense.buildingai.com → 您的服务器 IP
   ```

4. 从主站链接：
   ```html
   <a href="https://surfsense.buildingai.com">AI 研究助手</a>
   ```

### 方案 2：iframe 嵌入

**适用于：** 将 SurfSense UI 直接集成到现有页面中

1. 在子域上部署 SurfSense

2. 使用 `nginx/surfsense-iframe.conf` 配置 CORS

3. 在页面中嵌入：
   ```html
   <iframe 
     src="https://surfsense.buildingai.com"
     width="100%" 
     height="800px"
     allow="clipboard-read; clipboard-write"
   ></iframe>
   ```

查看 `examples/integration-example.html` 获取完整的工作示例。

### 方案 3：API 集成

**适用于：** 构建自定义 UI，同时利用 SurfSense 后端

1. 部署 SurfSense 后端

2. 使用 REST API：
   ```javascript
   // 登录
   const response = await fetch('https://surfsense.buildingai.com/auth/jwt/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     body: new URLSearchParams({ username: email, password: password })
   });
   const { access_token } = await response.json();

   // 聊天查询
   const chat = await fetch('https://surfsense.buildingai.com/api/v1/chat', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${access_token}`
     },
     body: JSON.stringify({ 
       messages: [{ role: 'user', content: "您的问题" }] 
     })
   });
   ```

查看 `examples/api-integration-example.html` 获取完整的 API 测试界面。

## 🔧 配置指南

### 环境变量

在根目录创建 `.env` 文件：

```bash
# 前端
FRONTEND_PORT=3000
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://surfsense.buildingai.com/api
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING

# 后端
BACKEND_PORT=8000

# 数据库
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=surfsense
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379
```

### 安全配置

对于 iframe 嵌入，更新 `surfsense_web/next.config.ts`：

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://buildingai.com",
          },
        ],
      },
    ];
  },
};
```

## 📖 API 端点参考

### 身份验证
- `POST /auth/register` - 注册新用户
- `POST /auth/jwt/login` - 登录并获取访问令牌

### 研究与聊天
- `POST /api/v1/chat` - AI 聊天流式响应
- `GET /api/v1/searchspaces` - 列出知识空间

### 文档
- `POST /api/v1/documents/fileupload` - 上传文档
- `GET /api/v1/documents` - 列出文档
- `DELETE /api/v1/documents/{id}` - 删除文档

### 播客
- `POST /api/v1/podcasts/generate` - 生成播客
- `GET /api/v1/podcasts` - 列出播客

## 🔐 身份验证方法

### 本地身份验证（默认）
用户使用电子邮件/密码注册和登录。

### OAuth 集成
在后端 `.env` 中配置 OAuth：
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

### SSO 集成
在 BuildingAI 和 SurfSense 之间共享 JWT 令牌：
1. 在两个应用程序中使用相同的 SECRET_KEY
2. 正确配置 CORS 设置
3. 在相同域下共享 cookies

## 🎨 自定义

### 品牌定制
为 BuildingAI 品牌定制 SurfSense：

1. 更新 `surfsense_web/app/layout.tsx` 元数据
2. 替换 `surfsense_web/public/` 中的 logo
3. 修改 `surfsense_web/tailwind.config.js` 中的色彩方案

### 自定义功能
添加 BuildingAI 特定功能：
1. 在 `surfsense_backend/app/api/` 中创建自定义 API 端点
2. 在 `surfsense_web/components/` 中添加自定义组件

## 📊 监控

### 健康检查
- 前端：`https://surfsense.buildingai.com/`
- 后端：`https://surfsense.buildingai.com/api/health`

### 日志
查看日志：
```bash
# 前端日志
docker logs surfsense-frontend

# 后端日志
docker logs surfsense-backend

# 数据库日志
docker logs surfsense-db
```

### Celery 监控
在 `docker-compose.yml` 中启用 Flower 并访问：
```
https://surfsense.buildingai.com/flower
```

## 🐛 故障排除

### CORS 问题
如果看到 CORS 错误：
1. 检查 nginx 配置包含正确的 CORS 头
2. 验证 `NEXT_PUBLIC_FASTAPI_BACKEND_URL` 正确
3. 确保 cookies 具有正确的 `SameSite` 设置

### 身份验证问题
如果登录失败：
1. 验证后端设置了 `SECRET_KEY`
2. 检查令牌过期设置
3. 审查 CORS 凭据设置

### 性能问题
如果性能慢：
1. 启用 Redis 缓存
2. 配置 pgvector 索引
3. 优化 nginx 缓存设置

## 📝 支持

如有问题和疑问：
- GitHub Issues: https://github.com/HORIZION-TECHNOLOGIE-LTD/yinghuogongfan/issues
- Discord: https://discord.gg/ejRNvftDp9
- 文档: https://www.surfsense.net/docs

## 📜 许可证

请参阅仓库根目录中的主 [LICENSE](../LICENSE) 文件。
