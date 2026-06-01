---
title: "PC 端扫码登录的实现"
description: "用户用 手机 App（已登录） 扫描网页上的二维码，实现网页自动登录。"
commentId: "blog-前端-经典场景题-pc-端扫码登录的实现"
publishDate: "2025-06-01"
tags: [
  "前端", "场景题", "技术笔记"
]
draft: true
readingTime: 3
---

## 概念

用户用 **手机 App（已登录）** 扫描网页上的二维码，实现网页自动登录。
重点：**不需要在网页输入账号密码**，靠的是手机已登录状态完成认证。
## 核心原理

1. **网页生成一个“登录会话 ID (login_session_id)” →**
2. **手机扫码告诉登录服务器“我同意让这个 session 登录” →**
3. **网页轮询或 SSE/WebSocket 等方式等待结果 →**
4. **一旦确认，服务器给网页发真正的登录 Token（JWT）。**
## 完整流程

## **步骤 1：PC 页面向服务器请求生成二维码**

PC 请求：

```

GET /qr-login/create

```

服务端生成一个临时的随机 ID（UUID）：

```

login_session_id = "xyz-123"
status = "pending"
expire = 120s

```

然后后端返回二维码数据：

```

{
  "qr_url": "https://example.com/qr-login/xyz-123"
}

```

PC 把这个生成二维码展示出来。
## **步骤 2：PC 启动轮询 / SSE / WebSocket 等待结果**
前端轮询例子：

```

setInterval(() => {
  fetch(`/qr-login/status?session=xyz-123`)
}, 2000);

```

后端返回：

```

status: pending | scanned | confirmed | expired

```

## **步骤 3：用户用手机 App 扫码**
二维码本质就是一个 URL，例如：

```

https://example.com/qr-login/xyz-123

```

手机访问后：

1. App 拿到 session_id
2. App 已登录 → 携带自己的用户 Token
3. App 调用后端确认：

```

POST /qr-login/scan
body: {
   session_id: "xyz-123",
   user_token: xxx
}

```

服务器记录：

```

session_id=xyz-123:
   status = scanned
   user = user123

```

## **步骤 4：手机上弹出“是否确认登录本设备”**
这是安全必备环节。
用户点击 **确认**：

```

POST /qr-login/confirm
{
   session_id: "xyz-123",
   user_id: 123
}

```

服务器更新状态：

```

session_id=xyz-123:
   status = confirmed
   user_id = 123

```

## **步骤 5：PC 端轮询到 confirmed → 获取最终登录 Token**
PC 轮询请求得到：

```

{ "status": "confirmed", "user_id": 123 }

```

于是 PC 调用：

```

POST /qr-login/get-token
{
  session_id: "xyz-123"
}

```

服务器给 PC 返回浏览器登录所需 JWT：

```

{
  "jwt": "...."
}

```

PC 拿到 JWT → 存 Cookie / LocalStorage → 登录完成。
## 扫码登录为什么不担心被别人截获
因为二维码里只是一个 **随机 session_id**，不包含用户信息。
如果有人用自己的手机扫到你的二维码，最后一步“确认登录”会弹在他的手机上，但：
- 他没有你的账号
- 他不会确认
- 他的确认也不会登录你的账号
除非你自己点击确认（手机端），否则 PC 无法登录。
## 扫码登录 vs OAuth（微信扫码就是 OAuth）

微信扫码登录流程本质上是：
1. PC 向微信申请一个临时二维码 ticket
2. 用户手机微信扫描
3. 手机微信 → 微信服务器 → 回调你的网站
4. PC 通过 ticket 换取 access_token / openid
5. 你的网站用它登录/注册
它比“自建扫码系统”多了一层**OAuth 授权（你授权网站使用你的微信身份）**。

> 扫码登录的核心是 PC 页面先生成一个临时的 login_session_id 并轮询它的状态，
> 手机上扫码后，使用已登录状态向服务器把这个 session_id 标记为已确认，
> PC 看到确认状态后，就向服务器换取自己的登录 Token（比如 JWT），
> 整个过程手机无法直接获取 PC 的会话信息，PC 也无法伪造登录，全程由服务器保证安全性。”

  


