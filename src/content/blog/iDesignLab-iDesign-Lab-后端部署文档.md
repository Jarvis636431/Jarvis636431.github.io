---
title: "iDesign Lab 后端部署文档"
description: "一、Nginx 配置 HTTPS"
commentId: "blog-idesignlab-idesign-lab-后端部署文档"
publishDate: "2025-06-01"
tags: [
  "iDesignLab", "项目文档"
]
series: "iDesignLab 工程文档"
seriesOrder: 4
draft: true
readingTime: 2
---

## **一、Nginx 配置 HTTPS**

1. **准备证书**
    - 已有：/etc/nginx/ssl/tju.edu.cn_cert_chain.pem（证书）
    - 已有：/etc/nginx/ssl/tju.edu.cn_key.key（私钥）
2. **创建配置文件**
    路径：/etc/nginx/conf.d/idesign.tju.edu.cn.conf

```nginx
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name idesign.tju.edu.cn;
    return 301 https://$host$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name idesign.tju.edu.cn;

    ssl_certificate     /etc/nginx/ssl/tju.edu.cn_cert_chain.pem;
    ssl_certificate_key /etc/nginx/ssl/tju.edu.cn_key.key;

    add_header X-Frame-Options SAMEORIGIN;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;

    # 反向代理到后端服务
    location /api/ {
        proxy_pass http://127.0.0.1:6364;
    }

    # 健康检查
    location /healthz {
        proxy_pass http://127.0.0.1:6364/healthz;
    }

    # Swagger（可选）
    location /swagger/ {
        proxy_pass http://127.0.0.1:6364/swagger/;
    }
}

```

3. **检查并重载配置**

```

sudo nginx -t
sudo systemctl reload nginx

```

3. **验证**

```

curl -I https://idesign.tju.edu.cn/healthz

```

4. 预期：200 OK。
## **二、后端部署**

1. **编译 Go 程序**
    在本地：

```

CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o idesignLab ./main.go

```

1. 上传到服务器 /root/idesignLab/ 目录。
2. **目录结构**

```

/root/idesignLab/
 ├── idesignLab      # 编译后的二进制
 ├── .env            # 环境变量配置
 └── uploads/        # 静态文件目录（如果有）

```

2. **环境变量配置 .env**

```

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=idesigner
DB_PASSWORD=idesign1895
DB_NAME=idesignlab

SERVER_PORT=6364

```

3. **启动服务**

```

cd /root/idesignLab
./idesignLab &

```

4. **测试后端直连**

```

curl -I http://127.0.0.1:6364/healthz

```

5. 预期：200 OK。
## **三、数据库配置（MariaDB）**

1. **登录数据库**

```

mysql -u root -p

```

1. **创建数据库**

```

CREATE DATABASE idesignlab DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

```

2. **创建用户并授权**

```

CREATE USER 'idesigner'@'127.0.0.1' IDENTIFIED BY 'idesign1895';
GRANT ALL PRIVILEGES ON idesignlab.* TO 'idesigner'@'127.0.0.1';
FLUSH PRIVILEGES;

```

3. **测试账号**

```

mysql -u idesigner -p -h127.0.0.1 -D idesignlab

```

4. **Gorm 自动迁移**
    - 在 Go 代码里 database.InitDB() 调用 db.AutoMigrate(...)。
    - 首次启动后会在 idesignlab 数据库里创建对应的表。
## **四、验证全链路**

1. **直连后端**

```

curl -I http://127.0.0.1:6364/healthz

```

  
2. **通过 Nginx（本地测试）**

```

curl -I --resolve idesign.tju.edu.cn:443:127.0.0.1 \
  https://idesign.tju.edu.cn/healthz

```

3. **数据库表检查**

```

mysql -uidesigner -p -h127.0.0.1 -D idesignlab -e "SHOW TABLES;"

```

## **五、优化建议**

1. **进程管理**
    - 用 systemd 托管后端，支持开机自启、自动拉起、统一日志。
    - /etc/systemd/system/idesign-backend.service 示例：

```

[Unit]
Description=iDesign Lab Backend
After=network.target

[Service]
WorkingDirectory=/root/idesignLab
ExecStart=/root/idesignLab/idesignLab
Restart=always
EnvironmentFile=/root/idesignLab/.env

[Install]
WantedBy=multi-user.target

```

1. **安全**
    - 确保防火墙只开放 80/443，关闭 3306 外网访问。
    - 数据库用户最小权限原则。
    - .env 里存放敏感信息，权限设为 600。
    
2. **日志**
    
    - 后端日志输出到文件（如 /var/log/idesignLab.log），配合 logrotate 切割。
    - Nginx 日志：/var/log/nginx/access.log、/var/log/nginx/error.log。
    
3. **更新流程**
    
    - 新版本二进制上传后 → systemctl restart idesign-backend。
    - 保留上一个版本的备份，便于快速回滚。
4. **监控**
    
    - /healthz 可接入监控平台（如 Prometheus / UptimeRobot）        
    - 数据库监控连接数、慢查询。
5. **Swagger**
    - 修改注解：

```

// @host     idesign.tju.edu.cn
// @BasePath /api
// @schemes  https

```

6. 
    - 生产可考虑加权限保护。
### 注意

当前已修改静态文件的存储路径，由 env 里的变量控制，在生产环境上是存储在绝对路径下
/var/www/idesignLab/uploads/photos 下，在开发环境则存储在相对路径额 uploads 目录下

因为部署方式是直接部署交叉编译后的 go 二进制文件，部署在 root 路径下，而外部链接访问的时候是直接访问/uploads，经过 nginx 代理后到达文件存储路径，而 nginx没有直接访问 root 路径的权限，所以必须修改部署路径为一个不需要权限的路径/nginx可以访问的路径
