# Docker 部署指南

## 前提条件

- Docker 20.10+
- Docker Compose 2.0+

## 快速开始

### 1. 构建并启动服务

```bash
cd ai-drama-studio

# 构建镜像并启动
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 2. 访问服务

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:5000
- **API 健康检查**: http://localhost:5000/health

### 3. 停止服务

```bash
# 停止服务
docker compose down

# 停止并删除数据卷（谨慎使用）
docker compose down -v
```

## 服务配置

### 后端 (Flask)

| 配置项 | 值 |
|--------|-----|
| 端口 | 5000 |
| 工作目录 | /app |
| 数据卷 | backend_data:/app/data |

### 前端 (Vite + React)

| 配置项 | 值 |
|--------|-----|
| 端口 | 3000 |
| 工作目录 | /app |
| 依赖后端 | 是 |

## 环境变量

### 后端环境变量

```bash
# docker-compose.yml 中配置
FLASK_ENV=production
DATABASE_URL=sqlite:///data/drama_studio.db
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
```

### 前端环境变量

```bash
# docker-compose.yml 中配置
VITE_API_BASE_URL=http://localhost:5000/api
```

## 故障排查

### 后端无法启动

```bash
# 查看后端日志
docker compose logs backend

# 重启后端
docker compose restart backend
```

### 前端无法连接后端

检查前端环境变量 `VITE_API_BASE_URL` 是否正确配置。

### 数据库问题

```bash
# 删除数据卷重新创建（数据会丢失！）
docker compose down -v
docker compose up -d --build
```

## 生产部署

### 修改默认配置

1. 修改 `docker-compose.yml` 中的密钥：
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`

2. 配置反向代理（Nginx）

3. 配置 SSL 证书

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

---

**文档版本**: 1.0
**更新时间**: 2026-03-27
