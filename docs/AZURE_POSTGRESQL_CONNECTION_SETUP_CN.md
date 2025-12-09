# Azure PostgreSQL 连接配置指南

## 📋 您的数据库实例信息

根据您提供的连接信息，您已经成功创建了 Azure PostgreSQL 实例：

```bash
Host: chi393.postgres.database.azure.com
User: YonggangZhen
Port: 5432
Database: postgres
```

## 🔧 环境变量配置

### 方法 1: 直接设置环境变量（临时）

在终端中运行以下命令（**仅当前会话有效**）：

```bash
export PGHOST=chi393.postgres.database.azure.com
export PGUSER=YonggangZhen
export PGPORT=5432
export PGDATABASE=postgres
export PGPASSWORD="your-actual-password-here"
```

⚠️ **重要**: 将 `your-actual-password-here` 替换为您的实际密码！

### 方法 2: 配置 SurfSense 后端（推荐）

#### 步骤 1: 创建 `.env` 文件

在 `surfsense_backend` 目录下创建或编辑 `.env` 文件：

```bash
cd /home/runner/work/yinghuogongfan/yinghuogongfan/surfsense_backend
```

创建 `.env` 文件内容：

```bash
# Azure PostgreSQL 连接配置
DATABASE_URL=postgresql://YonggangZhen:YOUR_PASSWORD@chi393.postgres.database.azure.com:5432/postgres?sslmode=require

# 或者分开配置
POSTGRES_HOST=chi393.postgres.database.azure.com
POSTGRES_PORT=5432
POSTGRES_USER=YonggangZhen
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=postgres
POSTGRES_SSLMODE=require

# 其他配置保持不变
```

⚠️ **安全提示**: 
- 将 `YOUR_PASSWORD` 替换为您的实际密码
- 确保 `.env` 文件在 `.gitignore` 中，不要提交到 Git！

#### 步骤 2: 验证 `.gitignore`

确保 `.env` 文件不会被提交：

```bash
# 检查 .gitignore
cat surfsense_backend/.gitignore | grep .env

# 如果没有，添加：
echo ".env" >> surfsense_backend/.gitignore
```

### 方法 3: 使用完整连接字符串

```bash
# 在 .env 文件中
DATABASE_URL="postgresql://YonggangZhen:YOUR_PASSWORD@chi393.postgres.database.azure.com:5432/postgres?sslmode=require"
```

## 🚀 初始化数据库

### 步骤 1: 安装 pgvector 扩展

首先连接到数据库并安装 pgvector：

```bash
# 使用 psql 连接
PGPASSWORD="YOUR_PASSWORD" psql -h chi393.postgres.database.azure.com \
  -U YonggangZhen -d postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

或者使用 Python 脚本：

```python
# 创建文件: surfsense_backend/install_pgvector.py
import psycopg2

conn = psycopg2.connect(
    host="chi393.postgres.database.azure.com",
    port=5432,
    user="YonggangZhen",
    password="YOUR_PASSWORD",  # 替换为实际密码
    database="postgres",
    sslmode="require"
)

cursor = conn.cursor()
cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
conn.commit()
print("✅ pgvector 扩展安装成功！")
cursor.close()
conn.close()
```

运行脚本：

```bash
cd surfsense_backend
uv run python install_pgvector.py
```

### 步骤 2: 运行数据库迁移

```bash
cd surfsense_backend

# 运行 Alembic 迁移
uv run alembic upgrade head
```

### 步骤 3: 验证连接

创建测试脚本 `surfsense_backend/test_connection.py`：

```python
import psycopg2
from psycopg2.extras import RealDictCursor

def test_connection():
    """测试 Azure PostgreSQL 连接"""
    try:
        # 连接配置
        conn = psycopg2.connect(
            host="chi393.postgres.database.azure.com",
            port=5432,
            user="YonggangZhen",
            password="YOUR_PASSWORD",  # 替换为实际密码
            database="postgres",
            sslmode="require"
        )
        
        print("✅ 成功连接到 Azure PostgreSQL!")
        
        # 测试查询
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 检查 pgvector 扩展
        cursor.execute("SELECT * FROM pg_extension WHERE extname = 'vector';")
        result = cursor.fetchone()
        
        if result:
            print("✅ pgvector 扩展已安装")
        else:
            print("❌ pgvector 扩展未安装，请先运行安装脚本")
        
        # 检查数据库版本
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 PostgreSQL 版本: {version['version']}")
        
        # 检查连接信息
        cursor.execute("SELECT current_database(), current_user;")
        info = cursor.fetchone()
        print(f"📊 当前数据库: {info['current_database']}")
        print(f"📊 当前用户: {info['current_user']}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 所有检查通过！数据库配置正确。")
        return True
        
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return False

if __name__ == "__main__":
    test_connection()
```

运行测试：

```bash
cd surfsense_backend
uv run python test_connection.py
```

## 🔒 安全配置

### 1. 配置防火墙规则

在 Azure Portal 中为您的 IP 地址添加防火墙规则：

```bash
# 使用 Azure CLI 添加防火墙规则
az postgres flexible-server firewall-rule create \
  --resource-group surfsense-rg \
  --name chi393 \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### 2. 使用 Azure Key Vault（推荐生产环境）

```bash
# 创建 Key Vault
az keyvault create \
  --name surfsense-kv \
  --resource-group surfsense-rg \
  --location eastasia

# 存储数据库密码
az keyvault secret set \
  --vault-name surfsense-kv \
  --name db-password \
  --value "YOUR_PASSWORD"

# 获取密码
az keyvault secret show \
  --vault-name surfsense-kv \
  --name db-password \
  --query value -o tsv
```

## 📝 完整配置示例

### `.env` 文件完整示例

```bash
# ==============================================
# Azure PostgreSQL 配置
# ==============================================
DATABASE_URL=postgresql://YonggangZhen:YOUR_PASSWORD@chi393.postgres.database.azure.com:5432/postgres?sslmode=require

# ==============================================
# 应用配置
# ==============================================
APP_ENV=production
APP_NAME=SurfSense
SECRET_KEY=your-secret-key-here

# ==============================================
# LLM 配置
# ==============================================
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# ==============================================
# Redis 配置（如果使用）
# ==============================================
REDIS_URL=redis://localhost:6379

# ==============================================
# 日志配置
# ==============================================
LOG_LEVEL=INFO
```

## 🧪 完整测试流程

### 一键测试脚本

创建 `surfsense_backend/setup_azure_db.sh`：

```bash
#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 开始配置 Azure PostgreSQL..."

# 1. 检查环境变量
echo -e "\n${YELLOW}步骤 1: 检查环境变量${NC}"
if [ -z "$PGPASSWORD" ]; then
    echo -e "${RED}❌ PGPASSWORD 未设置${NC}"
    echo "请运行: export PGPASSWORD='your-password'"
    exit 1
fi
echo -e "${GREEN}✅ 环境变量已设置${NC}"

# 2. 测试连接
echo -e "\n${YELLOW}步骤 2: 测试数据库连接${NC}"
if psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres -c "\q" 2>/dev/null; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo "请检查密码和网络连接"
    exit 1
fi

# 3. 安装 pgvector
echo -e "\n${YELLOW}步骤 3: 安装 pgvector 扩展${NC}"
psql -h chi393.postgres.database.azure.com -U YonggangZhen -d postgres \
  -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null
echo -e "${GREEN}✅ pgvector 扩展已安装${NC}"

# 4. 运行迁移
echo -e "\n${YELLOW}步骤 4: 运行数据库迁移${NC}"
cd surfsense_backend
uv run alembic upgrade head
echo -e "${GREEN}✅ 数据库迁移完成${NC}"

# 5. 运行测试
echo -e "\n${YELLOW}步骤 5: 运行连接测试${NC}"
uv run python test_connection.py

echo -e "\n${GREEN}🎉 Azure PostgreSQL 配置完成！${NC}"
```

运行脚本：

```bash
chmod +x surfsense_backend/setup_azure_db.sh
export PGPASSWORD="YOUR_PASSWORD"
./surfsense_backend/setup_azure_db.sh
```

## 📊 监控和维护

### 查看服务器状态

```bash
az postgres flexible-server show \
  --resource-group surfsense-rg \
  --name chi393
```

### 查看连接数

```sql
-- 连接到数据库后运行
SELECT count(*) FROM pg_stat_activity;
```

### 查看数据库大小

```sql
SELECT pg_size_pretty(pg_database_size('postgres'));
```

## 🆘 常见问题

### 问题 1: 连接超时

**原因**: 防火墙规则未配置

**解决方案**:
```bash
az postgres flexible-server firewall-rule create \
  --resource-group surfsense-rg \
  --name chi393 \
  --rule-name AllowAll \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### 问题 2: SSL 连接错误

**原因**: 未启用 SSL

**解决方案**: 确保连接字符串包含 `sslmode=require`

```bash
DATABASE_URL=postgresql://YonggangZhen:PASSWORD@chi393.postgres.database.azure.com:5432/postgres?sslmode=require
```

### 问题 3: 密码认证失败

**原因**: 密码包含特殊字符

**解决方案**: URL 编码密码中的特殊字符

```python
from urllib.parse import quote_plus
password = quote_plus("your-password-with-special-chars")
url = f"postgresql://YonggangZhen:{password}@chi393.postgres.database.azure.com:5432/postgres?sslmode=require"
```

## 📚 下一步

✅ 数据库配置完成后，可以开始：

1. **开发 AI 文案生成器**（2-3天）
   - 参考: `docs/QUICK_INTEGRATION_GUIDE_CN.md` 第102行

2. **开发 GrapesJS 网站生成器**（3-4周）
   - 参考: `docs/GRAPESJS_INTEGRATION_GUIDE_CN.md`

3. **添加其他功能**
   - 参考: `docs/IMPLEMENTATION_PROGRESS_TRACKER.md`

---

**提示**: 记得将实际密码保存在安全的地方，不要提交到 Git 仓库！
