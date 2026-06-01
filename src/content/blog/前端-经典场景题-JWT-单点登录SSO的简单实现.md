---
title: "JWT 单点登录(SSO)的简单实现"
description: "1. JWT 是什么"
commentId: "blog-前端-经典场景题-jwt-单点登录sso的简单实现"
publishDate: "2025-06-01"
tags: [
  "前端", "场景题", "技术笔记"
]
draft: true
readingTime: 5
---

## 1. JWT 是什么
JWT（JSON Web Token）是：
- 一段 **Base64 字符串**
- 包含 **用户身份信息**
- 由服务器 **私钥签名**
- 客户端每次携带它访问资源
结构：

```

header.payload.signature

```

比如：

```

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhcGkifQ.xxxxx

```

 **追问：JWT 为什么不能被伪造？**
因为 signature = HMACSHA256(header + payload, secret)，secret 是加密算法的必要参数**没有 secret 就无法伪造。**
## 2. 单点登录（SSO）是什么
SSO 指的是用户在系统 A 登录后，访问系统 B、系统 C **不需要再次登录**。多个系统共享一次登录态。
## 3. 用 JWT 如何实现 SSO

核心就是：**多个子系统共享同一个“授权中心”的 JWT**
流程：

```

用户访问业务系统 → 重定向到 认证中心（Auth Server）
               → 登录成功 → Auth Server 颁发 JWT
               → 用户携带 JWT 访问各业务系统
               → 每个系统都能验证 JWT（使用同一套 secret/public key）

```

## 为什么这么可以实现 SSO
- 你只在 Auth Server 登录一次 → 得到 JWT
- 所有业务系统只需要能 **校验同一个 JWT**
- 就能识别你的身份，无需再次登录
因此就实现了跨系统单点登录。
## 4. SSO 的常见架构方式（三种）
## **方式 1：多个子系统共享同一个 cookie domain（最简单）**

```

cookie domain=.company.com

```

所有系统使用：

```

a.company.com
b.company.com
c.company.com

```

JWT 写入 cookie（HttpOnly）
这样每个系统天然携带 JWT。
## **方式 2：多个子系统通过 HTTP Header 携带 token（最通用）**
前端登录：

```

localStorage.setItem("token", jwt)

```

之后每次请求业务系统：

```

Authorization: Bearer <jwt>

```

每个系统都使用相同公钥/私钥验证 token。
## **方式 3：OAuth2 + JWT（企业级）**
企业内部：
- SSO Server = OAuth2 授权中心
- 各业务系统 = Resource Server
- 颁发 JWT Access Token
是最正规的一套。
## 5. JWT + SSO 必须注意的安全问题

## **① Token 会泄露怎么办？（最核心问题）**
因为 JWT 是 Stateless，泄露后无法立即失效。
解决：
- token 设计为 **短有效期**（比如 30 min）
- 搭配 **Refresh Token**（HttpOnly Cookie）
- 服务端维护 **黑名单（token revoke）**
- Token 签名密钥必须保密
## **② Token 放哪里最安全？**
最安全顺序：
1. **HttpOnly Cookie**（不能被 JS 读）
2. localStorage（会被 XSS 攻击）
3. sessionStorage（稍微好一点）
企业一般这样做：
- **Access Token** 放 localStorage（用于请求鉴权）
- **Refresh Token** 放 HttpOnly Cookie（用于续期）
## **③ 如何防止跨域 + SSO 失败？**
需要：

```

Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://xxx.com

```

否则 Cookie 的 JWT 会传不过去。
## 6. SSO 登录流程（带刷新机制）
### **用户访问业务系统 A**

```

未登录 → 跳转 Auth Server → 用户输入账号密码
             ↓
认证成功 → 颁发 Access Token + Refresh Token
             ↓
业务系统写入 localStorage 或 cookie

```

访问业务系统 B：

```

浏览器携带 Access Token → B 校验签名成功 → 登录成功

```

**不用再次登录，就是 SSO。**
## 7. 面试官常问：JWT 与 Session 的区别？

|**特性**|**JWT**|**Session**|
|---|---|---|
|是否无状态|✔ 无状态|❌ 有状态|
|是否需要 server 存储|❌ 无需|✔ 需要|
|适合 SSO 吗|✔ 非常适合|❌ 跨系统困难|
|登出是否能立即失效|❌ 不好实现|✔ 删除 session 即可|
|安全性|易泄露|更安全|

结论：
**JWT 擅长 SSO、微服务、跨域场景**
**Session 擅长需要立即失效的登录管理**

# JWT SSO的原理
多个系统只要能验证同一个 JWT 的签名，就能信任同一个用户身份，因此用户只需要登录一次。
JWT 的 _signature_ 让“身份”变成了可携带、可验证、不可伪造的凭证。这就是它实现 SSO 的本质。

JWT 本质上就是：**认证中心签名的身份声明。**
任何系统拿到 JWT，都可以离线验证：
- 这个 token 是认证中心签发的吗？
- 有被篡改吗？
- 有没有过期？
验证成功 → 信任该用户，不再需要重新登录。
## 核心原理 1：可离线验证的数字签名
JWT 的签名：

```

signature = HMACSHA256(header + payload, secret)

```

或非对称：

```

signature = RSA_SIGN(private_key, header + payload)

```

业务系统要做的：

```

VALID = RSA_VERIFY(public_key, payload, signature)

```

只要签名能验证通过 → 该 JWT 必然来自认证中心 → 用户身份可信。
因此每个子系统**不需要连接认证中心**，就能独立判断用户是否已登录。

这就是 SSO 的关键：
**身份可离线验证 → 多系统可共享。**
## 核心原理 2：JWT 中携带了必要的身份信息 payload
JWT payload 里会包含：

```

{
  "userId": 123,
  "name": "Jarvis",
  "role": "admin",
  "exp": 1712345678
}

```

有了这些数据，子系统就知道：

- 你是谁
- 你的权限是什么
- 是否过期
不需要再次问认证中心。
## 核心原理 3：JWT 是无状态的，因此可跨系统共享
Session 是 **服务端有状态**：

```

用户访问 → server 创建 sessionId → 保存 session 数据

```

于是：

- 系统 A 的 session 无法被系统 B 访问
- 无法跨域共享
- 得集中做 session 共享，麻烦
JWT 是 **无状态的**：

```

用户信息就在 token 里

```

任何系统只要能验证签名，就能识别用户。因此多个系统共享“登录态”变得非常简单。
## 核心原理 4：多个系统共享同一个密钥（或公钥）
实现 SSO 的前提：

- 如果使用 HMAC：所有系统共享同一份 **secret**
- 如果使用 RSA/ECDSA：
    - 认证中心有私钥（签名）
    - 所有系统有公钥（验证）
这样每个系统都能独立验证 token。这也是 SSO 能成立的关键。 
### 核心中的核心就在这里，即为什么可以通过 token 直接验证用户的身份，而不需要再请求一下登录中心来获取 token
原因如下： jwt 本身是无状态的，而且他有一个 payload 组成部分，可以直接负载用户的信息等，然后核心在于 jwt 有一个 signature 签名的字段，使用非对称加密，所有系统都有一个公钥来解密用户中心的私钥签名，来验证即可
