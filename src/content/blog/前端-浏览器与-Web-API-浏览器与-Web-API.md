---
title: "浏览器与 Web API"
description: "1. localStorage / sessionStorage 有什么区别？有什么使用场景？"
commentId: "blog-前端-浏览器与-web-api-浏览器与-web-api"
publishDate: "2025-06-01"
tags: [
  "Web API", "前端", "技术笔记", "浏览器"
]
draft: true
readingTime: 3
---

## 1. localStorage / sessionStorage 有什么区别？有什么使用场景？

### **答案：**

**共同点：**

- 都是 Web Storage API
- 都是浏览器提供的键值对存储
- 大小一般约 5MB 左右
- 只能存字符串（需要手动 JSON 序列化）
**区别：**

| **特性** | **localStorage** | **sessionStorage** |
| ------ | ---------------- | ------------------ |
| 生命周期   | 永久存储             | 页面会话结束即清空          |
| 作用范围   | 同源共享             | 仅在当前标签页有效          |
| 浏览器关闭  | 仍然存在             | 关闭标签页后消失           |
| 跨标签页   | 可以               | 不可以                |

**使用场景：**

- localStorage：长期配置、主题色、本地缓存、登录 token（不安全，不推荐）
- sessionStorage：表单临时数据、单页面跳转状态
##  **2. Cookie、localStorage、sessionStorage、IndexedDB 的区别？**

- **Cookie**
    - 每次请求自动携带    
    - 4KB 限制   
    - 常用于登录状态维持、Session ID   
    - 不安全（容易被 XSS 注入）   
- **localStorage / sessionStorage**
    - 不会自动随请求发送
    - 5MB 左右
    - 不适合敏感数据
- **IndexedDB**
    - 非关系型数据库
    - 容量大（几十 MB～几百 MB）
    - 异步、事务型
    - 适合离线应用、大数据缓存
## **3. fetch 与 XMLHttpRequest 的区别？为什么说 fetch 更现代？**

|**维度**|**fetch**|**XHR**|
|---|---|---|
|API 风格|Promise|回调|
|可读性|更简洁|比较繁琐|
|流式读取|支持|不支持|
|取消请求|需 AbortController|内置 abort()|
|上传进度监听|❌ 无法监听|✔ 支持|
|错误处理|必须手动检查 res.ok|状态码直接可用|

**fetch 更现代的原因：**

- 基于 Promise，支持 async/await
- 支持 Stream API
- 与 Service Worker 配合
- API 语义更明确

**为什么 fetch 没有上传进度？**
因为 fetch 基于 Streams API，不会暴露底层进度事件。

# 6. Service Worker

Service Worker 是浏览器提供的“可编程代理层”，作用包括：

- 离线缓存（PWA）
- 静态资源缓存策略（Cache API）
- 拦截 fetch 请求
- 后台同步（Background Sync）
- 推送通知（Push Notification）
  
**工作流程：**
1. 注册（register）
2. 安装（install）
3. 激活（activate）
4. 拦截 fetch / push 事件
5. 与页面通信（postMessage）
  
它运行在独立线程，不阻塞主线程。

## 为什么 localStorage 是同步 API，而 IndexedDB 是异步 API

**原因：性能 + 线程阻塞。**

localStorage 操作很轻量，设计之初（2008 年左右）用于小数据，允许同步。
但 IndexedDB 可能读取几十 MB 数据，如果同步会卡死主线程，因此必须是异步 API。

## **EventSource（SSE）和 WebSocket 有什么区别？**

|**特性**|**SSE（EventSource）**|**WebSocket**|
|---|---|---|
|通信方向|单向（服务器 → 客户端）|双向|
|协议|HTTP|WS|
|连接数量|多|少|
|使用场景|新闻推送、日志流|聊天、实时协作|
|重连|自动|手动实现|
|复杂度|简单|较高|

SSE 背后仍然是 HTTP，是纯文本流，更轻量。
## 10. Clipboard API 是什么？与 document.execCommand 有什么区别？

### **答案：**

**Clipboard API：**

- 现代异步复制/粘贴 API
- 支持图片、复杂类型
- 安全性更高
- 需要 HTTPS

```

navigator.clipboard.writeText("hello");

```

**execCommand 已废弃，不推荐使用。**

---

