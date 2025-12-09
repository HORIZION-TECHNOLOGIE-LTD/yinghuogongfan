# Azure ARM 模板部署指南

## 概述

用户提供的 ARM 模板用于快速部署 Azure Database for PostgreSQL 灵活服务器。本指南说明如何使用该模板部署数据库并集成到 SurfSense。

## ARM 模板分析

### 核心资源

模板创建以下资源：
1. **PostgreSQL 灵活服务器** - 主数据库实例
2. **Azure AD 管理员**（可选）- 身份验证集成
3. **防火墙规则** - 网络访问控制

### 关键参数

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `serverName` | 服务器名称 | `surfsense-db` |
| `location` | Azure 区域 | `East Asia` 或 `Southeast Asia` |
| `administratorLogin` | 管理员用户名 | `surfsenseadmin` |
| `administratorLoginPassword` | 管理员密码 | 强密码（16+字符） |
| `version` | PostgreSQL 版本 | `14` 或 `15` |
| `vmName` | 实例规格 | `Standard_B1ms`（免费层） |
| `serverEdition` | 服务器层级 | `Burstable` |
| `storageSizeGB` | 存储大小 | `32`（免费额度） |
| `backupRetentionDays` | 备份保留天数 | `7` |
| `geoRedundantBackup` | 异地备份 | `Disabled` |

## 快速部署步骤

### 方法 1: Azure Portal（推荐）

**步骤 1: 创建参数文件**

创建 `parameters.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "serverName": {
      "value": "surfsense-db"
    },
    "administratorLogin": {
      "value": "surfsenseadmin"
    },
    "administratorLoginPassword": {
      "value": "YourStrongPassword123!@#"
    },
    "location": {
      "value": "East Asia"
    },
    "version": {
      "value": "15"
    },
    "vmName": {
      "value": "Standard_B1ms"
    },
    "serverEdition": {
      "value": "Burstable"
    },
    "storageSizeGB": {
      "value": 32
    },
    "backupRetentionDays": {
      "value": 7
    },
    "geoRedundantBackup": {
      "value": "Disabled"
    },
    "firewallRules": {
      "value": {
        "rules": [
          {
            "name": "AllowAllAzureServices",
            "startIPAddress": "0.0.0.0",
            "endIPAddress": "0.0.0.0"
          }
        ]
      }
    }
  }
}
```

> ⚠️ **重要**: 替换 `administratorLoginPassword` 为强密码（16+字符，包含大小写字母、数字、特殊字符）

**步骤 2: 在 Azure Portal 部署**

1. 登录 Azure Portal: https://portal.azure.com
2. 搜索 "Deploy a custom template"
3. 点击 "Build your own template in the editor"
4. 粘贴 ARM 模板内容
5. 点击 "Save"
6. 选择资源组（或创建新的）
7. 填写参数或上传 `parameters.json`
8. 点击 "Review + create"
9. 点击 "Create"

**部署时间**: 约 5-10 分钟

### 方法 2: Azure CLI

**前提条件**:
```bash
# 安装 Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 登录
az login

# 创建资源组（如果不存在）
az group create --name surfsense-rg --location eastasia
```

**部署命令**:
```bash
# 使用模板和参数文件部署
az deployment group create \
  --resource-group surfsense-rg \
  --template-file template.json \
  --parameters @parameters.json

# 或直接指定参数
az deployment group create \
  --resource-group surfsense-rg \
  --template-file template.json \
  --parameters \
    serverName=surfsense-db \
    administratorLogin=surfsenseadmin \
    administratorLoginPassword='YourStrongPassword123!@#' \
    location=eastasia \
    version=15 \
    vmName=Standard_B1ms \
    serverEdition=Burstable \
    storageSizeGB=32 \
    backupRetentionDays=7 \
    geoRedundantBackup=Disabled
```

### 方法 3: Azure PowerShell

```powershell
# 登录
Connect-AzAccount

# 创建资源组
New-AzResourceGroup -Name surfsense-rg -Location eastasia

# 部署模板
New-AzResourceGroupDeployment `
  -ResourceGroupName surfsense-rg `
  -TemplateFile template.json `
  -TemplateParameterFile parameters.json
```

## 部署后配置

### 1. 获取连接信息

**在 Azure Portal**:
1. 导航到 PostgreSQL 服务器
2. 在 "Overview" 页面找到 "Server name"
3. 复制完整的服务器名称（如：`surfsense-db.postgres.database.azure.com`）

**使用 Azure CLI**:
```bash
az postgres flexible-server show \
  --resource-group surfsense-rg \
  --name surfsense-db \
  --query "fullyQualifiedDomainName" \
  --output tsv
```

### 2. 安装 pgvector 扩展

**连接到数据库**:
```bash
psql "host=surfsense-db.postgres.database.azure.com port=5432 dbname=postgres user=surfsenseadmin password=YourPassword sslmode=require"
```

**安装扩展**:
```sql
-- 创建数据库
CREATE DATABASE surfsense;

-- 连接到 surfsense 数据库
\c surfsense

-- 安装 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 验证安装
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 3. 配置防火墙规则

**允许你的 IP 地址访问**:

```bash
# 获取你的公网 IP
MY_IP=$(curl -s https://ifconfig.me)

# 添加防火墙规则
az postgres flexible-server firewall-rule create \
  --resource-group surfsense-rg \
  --name surfsense-db \
  --rule-name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP
```

**允许 Azure 服务访问**（已在模板中配置）:
- 规则名称: `AllowAllAzureServices`
- IP 范围: `0.0.0.0` - `0.0.0.0`（特殊值）

### 4. 更新 SurfSense 配置

**后端环境变量** (`surfsense_backend/.env`):
```bash
# 原来的配置
# DATABASE_URL=postgresql://user:password@localhost:5432/surfsense

# 新的 Azure PostgreSQL 配置
DATABASE_URL=postgresql://surfsenseadmin:YourPassword@surfsense-db.postgres.database.azure.com:5432/surfsense?sslmode=require

# 重要: 添加 ?sslmode=require 启用 SSL
```

⚠️ **安全提示**: 
- 不要将密码提交到 Git
- 使用 Azure Key Vault 或环境变量管理密码
- 定期轮换密码

### 5. 运行数据库迁移

```bash
cd surfsense_backend

# 安装依赖（如果还没有）
uv sync

# 运行迁移
uv run alembic upgrade head
```

### 6. 测试连接

**测试脚本**:
```python
# test_connection.py
import asyncpg
import asyncio

async def test_connection():
    conn = await asyncpg.connect(
        host="surfsense-db.postgres.database.azure.com",
        port=5432,
        user="surfsenseadmin",
        password="YourPassword",
        database="surfsense",
        ssl="require"
    )
    
    # 测试查询
    version = await conn.fetchval("SELECT version()")
    print(f"✅ Connected! PostgreSQL version: {version}")
    
    # 测试 pgvector
    result = await conn.fetchval("SELECT extname FROM pg_extension WHERE extname = 'vector'")
    if result:
        print(f"✅ pgvector extension installed")
    else:
        print(f"❌ pgvector extension not found")
    
    await conn.close()

asyncio.run(test_connection())
```

运行测试:
```bash
uv run python test_connection.py
```

## ARM 模板特性说明

### 1. 高可用性配置

模板支持高可用性（HA），但默认禁用以节省成本：

```json
"haEnabled": {
  "defaultValue": "Disabled",
  "type": "String"
}
```

**启用 HA**（需要额外费用）:
```json
{
  "haEnabled": {
    "value": "ZoneRedundant"
  },
  "standbyAvailabilityZone": {
    "value": "2"
  }
}
```

### 2. 自动备份

模板配置了自动备份：
- 保留天数: 7 天（可调整 1-35 天）
- 异地备份: 禁用（免费层限制）

### 3. 存储自动增长

默认禁用，可启用：
```json
{
  "storageAutogrow": {
    "value": "Enabled"
  }
}
```

### 4. Azure AD 认证

模板支持 Azure AD 集成（可选）：

```json
{
  "aadEnabled": {
    "value": true
  },
  "aadData": {
    "value": {
      "objectId": "your-aad-object-id",
      "principalName": "user@domain.com",
      "principalType": "User",
      "tenantId": "your-tenant-id"
    }
  }
}
```

### 5. 私有网络集成

模板支持 VNet 集成（高级配置）：

```json
{
  "network": {
    "value": {
      "delegatedSubnetResourceId": "/subscriptions/.../subnets/...",
      "privateDnsZoneResourceId": "/subscriptions/.../privateDnsZones/..."
    }
  }
}
```

## 成本估算

### 免费层（12个月）

使用以下配置享受免费层：
- 实例: `Standard_B1ms`
- 存储: 32GB
- 备份: 32GB
- 时间: 750 小时/月

**费用**: $0/月（前12个月）

### 付费后成本

**Standard_B1ms**（1 vCore, 2 GiB RAM）:
- 计算: ~$12-15/月
- 存储（32GB）: ~$3/月
- 备份（32GB）: ~$1/月
- **总计**: ~$16-19/月

**扩展选项**:
- Standard_B2s（2 vCore, 4 GiB）: ~$30/月
- Standard_D2s_v3（2 vCore, 8 GiB）: ~$130/月

## 监控和维护

### 查看服务器状态

```bash
az postgres flexible-server show \
  --resource-group surfsense-rg \
  --name surfsense-db
```

### 查看指标

在 Azure Portal:
1. 导航到 PostgreSQL 服务器
2. 点击 "Metrics"
3. 查看 CPU、内存、存储、连接数等指标

### 查看日志

```bash
az postgres flexible-server server-logs list \
  --resource-group surfsense-rg \
  --server-name surfsense-db
```

### 备份和恢复

**查看备份**:
```bash
az postgres flexible-server backup list \
  --resource-group surfsense-rg \
  --server-name surfsense-db
```

**恢复到新服务器**:
```bash
az postgres flexible-server restore \
  --resource-group surfsense-rg \
  --name surfsense-db-restored \
  --source-server surfsense-db \
  --restore-time "2024-12-07T10:00:00Z"
```

## 故障排查

### 问题 1: 无法连接

**检查防火墙规则**:
```bash
az postgres flexible-server firewall-rule list \
  --resource-group surfsense-rg \
  --server-name surfsense-db
```

**添加你的 IP**:
```bash
az postgres flexible-server firewall-rule create \
  --resource-group surfsense-rg \
  --name surfsense-db \
  --rule-name MyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### 问题 2: SSL 连接错误

确保连接字符串包含 `sslmode=require`:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### 问题 3: pgvector 扩展未找到

```sql
-- 检查可用扩展
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- 如果可用，安装它
CREATE EXTENSION vector;
```

### 问题 4: 权限错误

```sql
-- 授予数据库权限
GRANT ALL PRIVILEGES ON DATABASE surfsense TO surfsenseadmin;

-- 授予架构权限
GRANT ALL PRIVILEGES ON SCHEMA public TO surfsenseadmin;
```

## 安全最佳实践

### 1. 密码管理

**使用 Azure Key Vault**:
```bash
# 创建 Key Vault
az keyvault create \
  --resource-group surfsense-rg \
  --name surfsense-kv

# 存储密码
az keyvault secret set \
  --vault-name surfsense-kv \
  --name db-password \
  --value 'YourStrongPassword123!@#'

# 在应用中读取
az keyvault secret show \
  --vault-name surfsense-kv \
  --name db-password \
  --query value \
  --output tsv
```

### 2. 网络安全

- ✅ 始终使用 SSL/TLS 连接
- ✅ 限制防火墙规则到特定 IP
- ✅ 考虑使用 VNet 集成（生产环境）
- ✅ 启用 Azure Private Link（高级）

### 3. 认证

- ✅ 使用 Azure AD 认证（推荐）
- ✅ 定期轮换密码
- ✅ 使用强密码策略
- ✅ 限制管理员账户使用

### 4. 审计

启用审计日志:
```bash
az postgres flexible-server parameter set \
  --resource-group surfsense-rg \
  --server-name surfsense-db \
  --name pgaudit.log \
  --value 'WRITE,DDL'
```

## 迁移数据

### 从本地迁移到 Azure

**方法 1: pg_dump/pg_restore**

```bash
# 导出本地数据库
pg_dump -h localhost -U postgres -d surfsense -Fc -f surfsense_backup.dump

# 导入到 Azure
pg_restore -h surfsense-db.postgres.database.azure.com \
  -U surfsenseadmin \
  -d surfsense \
  --no-owner \
  --no-acl \
  surfsense_backup.dump
```

**方法 2: Azure Database Migration Service**

适用于大型数据库和最小停机时间迁移。

## 总结

### ✅ 优势

1. **快速部署** - ARM 模板 5 分钟完成
2. **完全托管** - 无需维护服务器
3. **自动备份** - 数据安全有保障
4. **可扩展** - 按需升级
5. **免费12个月** - 降低初期成本

### 📋 检查清单

部署完成后检查：
- [ ] PostgreSQL 服务器运行正常
- [ ] pgvector 扩展已安装
- [ ] 防火墙规则已配置
- [ ] 连接字符串已更新
- [ ] 数据库迁移已完成
- [ ] 应用连接测试通过
- [ ] 备份策略已确认

### 📚 相关文档

- Azure PostgreSQL 文档: `AZURE_DATABASE_INTEGRATION_CN.md`
- 快速集成指南: `QUICK_INTEGRATION_GUIDE_CN.md`
- 完整路线图: `COMPLETE_IMPLEMENTATION_ROADMAP_CN.md`

### 🚀 下一步

数据库迁移完成后，开始开发新功能：
1. AI 文案生成器（2-3天）
2. GrapesJS 网站生成器（3-4周）
3. AI 图像生成（3-5天）

所有实现代码在对应的技术文档中！
