# AI Drama Studio - 部署指南

## 快速开始

### 方法一：Docker 部署（推荐）

#### 前提条件

- Docker 20.10+
- Docker Compose 2.0+

#### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/TheMrxk/ai-drama-studio.git
cd ai-drama-studio

# 2. 启动服务
docker compose up -d --build

# 3. 查看状态
docker compose ps

# 4. 查看日志
docker compose logs -f
```

#### 访问服务

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 API | http://localhost:5000 |
| 健康检查 | http://localhost:5000/health |

---

### 方法二：手动部署

#### 后端部署

```bash
cd backend

# 1. 创建 Python 虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 2. 安装依赖
pip install -r requirements.txt

# 3. 复制环境配置
cp .env.example .env

# 4. 编辑 .env 文件，修改密钥
# SECRET_KEY=<生成新密钥>
# JWT_SECRET_KEY=<生成新密钥>

# 5. 创建数据目录
mkdir -p data

# 6. 启动服务
python run.py
```

#### 前端部署

```bash
cd frontend

# 1. 安装依赖
npm install

# 2. 创建环境配置
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env

# 3. 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
```

---

## 配置说明

### 后端配置 (.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SECRET_KEY` | Flask 密钥（必须修改） | - |
| `JWT_SECRET_KEY` | JWT 密钥（必须修改） | - |
| `DATABASE_URL` | 数据库连接 | sqlite:///data/drama_studio.db |
| `FLASK_ENV` | 运行环境 | production |
| `PORT` | 服务端口 | 5000 |

#### 生成安全密钥

```bash
# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 前端配置 (.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | http://localhost:5000/api |

---

## 常见问题

### 1. 端口被占用

**错误**: `Address already in use`

**解决**:
```bash
# 查看占用端口的进程
lsof -i :5000  # 后端
lsof -i :3000  # 前端

# 终止进程
kill -9 <PID>
```

### 2. 数据库连接失败

**错误**: `unable to open database file`

**解决**:
```bash
# 确保 data 目录存在并有写权限
mkdir -p backend/data
chmod 755 backend/data
```

### 3. 前端无法连接后端

**错误**: `Network Error` 或 `CORS error`

**解决**:
1. 检查后端是否启动：`curl http://localhost:5000/health`
2. 检查前端 `.env` 配置是否正确
3. 检查 CORS 配置

### 4. Docker 卷权限问题

**错误**: `Permission denied`

**解决**:
```bash
# 删除卷重新创建
docker compose down -v
docker compose up -d --build
```

### 5. 内存不足

**错误**: Docker 容器频繁重启

**解决**:
```bash
# 在 docker-compose.yml 中限制资源
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## 生产部署

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL 配置

```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

---

## 服务管理

### Docker 命令

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 重启
docker compose restart

# 查看日志
docker compose logs -f

# 重新构建
docker compose build --no-cache

# 清理
docker compose down -v  # 删除数据卷（谨慎！）
```

### 健康检查

```bash
# 后端健康检查
curl http://localhost:5000/health

# 前端健康检查
curl http://localhost:3000
```

---

## 数据备份

### 备份数据库

```bash
# Docker 环境
docker compose exec backend cp /app/data/drama_studio.db /tmp/backup.db
docker compose cp backend:/tmp/backup.db ./backup.db

# 手动部署环境
cp backend/data/drama_studio.db ./backup.db
```

### 恢复数据库

```bash
# Docker 环境
docker compose cp ./backup.db backend:/app/data/drama_studio.db
docker compose restart backend
```

---

## 版本信息

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.1 | 2026-03-28 | 修复部署问题，添加健康检查 |
| v1.0.0 | 2026-03-27 | 首次发布 |

---

**支持**: https://github.com/TheMrxk/ai-drama-studio/issues
