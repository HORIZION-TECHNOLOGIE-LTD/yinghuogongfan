# Surfsense Backend (demo)

这是一个用于快速本地开发的后端 demo（FastAPI + RQ worker + MinIO + Postgres），目的是为 surfsense_web 提供生成任务队列、存储与基本 API。

主要文件
- app/main.py - FastAPI 应用（含 /api/v1/generate/image, /api/v1/tasks, /api/v1/notes 示例）
- app/tasks.py - RQ worker 任务（演示用 Pillow 生成图片）
- app/storage.py - MinIO 上传与预签名 URL 工具
- worker.py - RQ worker 启动脚本
- Dockerfile / docker-compose.backend.yml - 本地一键启动

快速启动
1. 将文件放到仓库根目录（与 surfsense_web 同级）：
   - backend/...
   - docker-compose.backend.yml
2. 启动：
   docker compose -f docker-compose.backend.yml up --build

示例流程
- POST /api/v1/generate/image {"prompt":"hello world"} -> 返回 task_id
- GET /api/v1/tasks/{task_id} -> 查询任务状态并最终获得 result URL

后续替换模型
- 将 app/tasks.enqueue_generate_image 中的 Pillow 部分替换为真实 AI 模型调用（OpenAI/Replicate/HF API 或调用自托管模型容器）
- 保持最终产物上传到 MinIO 的逻辑不变，前端通过 presigned URL 获取结果

注意
- 目前示例没有加入用户/权限，生产环境需要加入认证、配额控制与安全限制。
