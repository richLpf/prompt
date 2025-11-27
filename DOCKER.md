# Docker 部署指南

本项目支持使用 Docker 和 Docker Compose 进行部署。

## 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0

## 快速开始

### 1. 生产环境部署

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 2. 开发环境部署

```bash
# 使用开发配置启动
docker-compose -f docker-compose.dev.yml up

# 后台运行
docker-compose -f docker-compose.dev.yml up -d
```

## 环境变量配置

创建 `.env` 文件（可选）：

```env
# API 基础 URL
# 如果后端 API 在宿主机上运行，使用 host.docker.internal:8080
# 如果后端 API 在 Docker 网络中，使用服务名和端口
API_BASE_URL=http://host.docker.internal:8080

# 前端 API 基础 URL（可选）
NEXT_PUBLIC_API_BASE_URL=
```

## 配置说明

### API_BASE_URL

- **宿主机上的后端 API**：使用 `http://host.docker.internal:8080`
- **Docker 网络中的后端 API**：使用服务名，如 `http://backend:8080`
- **外部 API**：使用完整 URL，如 `http://api.example.com`

### 端口配置

默认端口为 `3000`，如需修改，编辑 `docker-compose.yml`：

```yaml
ports:
  - "8080:3000"  # 将容器内的 3000 端口映射到宿主机的 8080 端口
```

## 常用命令

```bash
# 构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f prompt-web

# 进入容器
docker-compose exec prompt-web sh

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v
```

## 与后端 API 集成

如果后端 API 也在 Docker 中运行，可以在同一个 `docker-compose.yml` 中定义多个服务：

```yaml
version: '3.8'

services:
  backend:
    # 后端服务配置
    ...
  
  prompt-web:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - API_BASE_URL=http://backend:8080
    depends_on:
      - backend
    ...
```

## 故障排查

### 1. 无法连接到后端 API

- 检查 `API_BASE_URL` 环境变量是否正确
- 如果后端在宿主机，确保使用 `host.docker.internal`
- 检查网络连接和防火墙设置

### 2. 构建失败

- 确保 Docker 有足够的内存（建议至少 2GB）
- 清理 Docker 缓存：`docker system prune -a`

### 3. 端口冲突

- 检查端口 3000 是否被占用
- 修改 `docker-compose.yml` 中的端口映射

## 生产环境建议

1. **使用环境变量文件**：创建 `.env.production` 并设置正确的 API 地址
2. **启用 HTTPS**：使用 Nginx 反向代理并配置 SSL
3. **资源限制**：在 `docker-compose.yml` 中添加资源限制
4. **日志管理**：配置日志驱动和日志轮转
5. **健康检查**：添加健康检查配置

示例生产配置：

```yaml
services:
  prompt-web:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

