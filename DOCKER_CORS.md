# Docker 跨域问题说明

## 当前架构分析

### 1. 访问方式

- **前端容器**：运行在 `localhost:8000`（映射自容器内的 3000 端口）
- **后端服务**：运行在宿主机的 `localhost:8080`
- **容器内访问**：使用 `host.docker.internal:8080` 访问宿主机

### 2. 跨域问题分析

**好消息：不会存在跨域问题！**

原因：
1. **使用了 Next.js Rewrites**：所有 API 请求都通过 Next.js 服务器端代理
2. **相对路径调用**：前端代码使用 `/api/platforms` 等相对路径
3. **服务器端转发**：请求流程是：
   ```
   浏览器 → Next.js 服务器 (localhost:8000) 
         → Next.js rewrites 代理 
         → 后端 API (host.docker.internal:8080)
   ```

由于请求是从 Next.js **服务器端**发起的，而不是从浏览器直接发起，所以**不存在 CORS 跨域问题**。

## host.docker.internal 兼容性

### Windows 和 macOS
✅ **默认支持**：`host.docker.internal` 可以直接使用

### Linux 系统
⚠️ **需要额外配置**：Linux 上默认不支持 `host.docker.internal`

#### Linux 解决方案

**方案 1：使用 extra_hosts（推荐）**

在 `docker-compose.yml` 中添加：

```yaml
services:
  prompt-web:
    # ... 其他配置
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

**方案 2：使用宿主机 IP**

```yaml
services:
  prompt-web:
    environment:
      - API_BASE_URL=http://172.17.0.1:8080  # Docker 默认网关 IP
```

**方案 3：使用网络模式**

```yaml
services:
  prompt-web:
    network_mode: "host"  # 使用宿主机网络（不推荐，安全性较低）
```

## 推荐配置

### 方案 A：Linux 兼容配置（推荐）

```yaml
version: '3.8'

services:
  prompt-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: prompt-web
    ports:
      - "8000:3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=${API_BASE_URL:-http://host.docker.internal:8080}
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Linux 兼容
    restart: unless-stopped
    networks:
      - prompt-network

networks:
  prompt-network:
    driver: bridge
```

### 方案 B：将后端也加入 Docker Compose（最佳实践）

如果后端也在 Docker 中运行，建议使用服务名访问：

```yaml
version: '3.8'

services:
  backend:
    image: your-backend-image
    container_name: prompt-backend
    ports:
      - "8080:8080"
    networks:
      - prompt-network

  prompt-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: prompt-web
    ports:
      - "8000:3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=http://backend:8080  # 使用服务名
    depends_on:
      - backend
    networks:
      - prompt-network

networks:
  prompt-network:
    driver: bridge
```

## 验证配置

### 1. 检查容器内网络连接

```bash
# 进入容器
docker-compose exec prompt-web sh

# 测试连接宿主机
ping host.docker.internal

# 测试 API 连接
wget -O- http://host.docker.internal:8080/api/platforms
```

### 2. 检查 Next.js Rewrites

访问 `http://localhost:8000/api/platforms`，应该能正常返回数据。

### 3. 查看 Next.js 日志

```bash
docker-compose logs -f prompt-web
```

## 常见问题

### Q1: 为什么浏览器控制台没有跨域错误？

**A**: 因为使用了 Next.js rewrites，所有请求都通过服务器端代理，浏览器只看到同源的请求。

### Q2: Linux 上 `host.docker.internal` 无法解析？

**A**: 添加 `extra_hosts: - "host.docker.internal:host-gateway"` 配置。

### Q3: 如何确认请求是否真的通过代理？

**A**: 查看 Next.js 服务器日志，应该能看到代理转发的请求。

### Q4: 生产环境应该怎么配置？

**A**: 
- 如果后端在独立服务器：使用完整 URL，如 `http://api.example.com`
- 如果后端在同一 Docker 网络：使用服务名，如 `http://backend:8080`
- 如果后端在宿主机：使用 `host.docker.internal`（需要配置 extra_hosts）

## 总结

✅ **不会跨域**：因为使用了 Next.js rewrites 服务器端代理  
✅ **配置正确**：当前配置在 Windows/macOS 上可以直接使用  
⚠️ **Linux 注意**：需要添加 `extra_hosts` 配置  
💡 **最佳实践**：将后端也加入 Docker Compose，使用服务名访问

