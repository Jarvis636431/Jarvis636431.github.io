---
title: "详解 SSE"
description: "SSE 是用浏览器原生 EventSource 建立的单向持久 HTTP 连接，服务端以 text/event-stream 的文本流持续推送事件给客户端（服务端 → 客户端），支持自动重连、事件 id、简单事件类型。"
commentId: "blog-前端-浏览器与-web-api-详解-sse"
publishDate: "2025-06-01"
tags: [
  "Web API", "前端", "技术笔记", "浏览器"
]
draft: true
readingTime: 8
---


**SSE 是用浏览器原生 EventSource 建立的单向持久 HTTP 连接，服务端以 text/event-stream 的文本流持续推送事件给客户端（服务端 → 客户端），支持自动重连、事件 id、简单事件类型。**

适合通知、日志、AI token 流式输出等单向实时场景。

## 1) 协议与消息格式（必须记住的细节）

- **请求方式**：浏览器通过 GET 发起（EventSource 只能用 GET）。
- **响应 Content-Type**：Content-Type: text/event-stream。
- **消息组成**（纯文本，字段以 \n 分行，事件以空行结束）：
    - data: <payload> — 主体，可以有多行 data:（会被拼接为单条事件文本，每行之间保留 \n）。
    - event: <name> — 事件类型，可选，客户端用 addEventListener(name, ...) 监听。
    - id: <id> — 事件 ID，用于断线重连后从 Last-Event-ID 继续。
    - retry: <ms> — 指定客户端重连等待时间（毫秒）。
- **一条完整示例**：

```

id: 42
event: partial
data: hello
data:  world

event: done
data: finished

```

- （空行后事件结束；上面的 partial 事件的数据内容是 "hello\n world"）
    
- **断线重连**：浏览器自动重连，并在请求头带 Last-Event-ID: <id>（若服务端返回了 id）。
    

---

## 2) 浏览器端 API（EventSource）— 最常见用法

```

const es = new EventSource('/sse/stream?channel=abc');

es.onopen = () => console.log('连接建立');
es.onmessage = (e) => console.log('默认事件 data:', e.data); // event: data (no event字段时)
es.addEventListener('partial', (e) => console.log('partial', e.data));
es.addEventListener('done', () => es.close());

es.onerror = (e) => {
  console.log('error, 会自动重连，或在连接失败时触发');
};

```

- EventSource 自动处理重连（使用 retry 如果服务端提供）。
    
- es.close() 手动关闭。
    
- 浏览器会自动带 cookie，但如果用 Authorization header 发 Token，需要特殊处理（见安全一节）。
    

---

## 3) 服务端实现要点（示例：Node/Express、Python/FastAPI、Go）

  

### **Node (Express)**

```

app.get('/sse/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('retry: 3000\n\n'); // 建议的重连间隔
  let id = 0;

  const interval = setInterval(() => {
    id++;
    res.write(`id: ${id}\n`);
    res.write(`event: partial\n`);
    res.write(`data: ${new Date().toISOString()}\n\n`);
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

```

注意：要确保 res.flush()（或使用支持 flush 的中间件）在需要的环境下调用，避免 buffering。

  

### **Python (FastAPI)**

```

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
app = FastAPI()

def event_generator():
    yield "retry: 3000\n\n"
    i = 0
    while True:
        i += 1
        yield f"id: {i}\ndata: hello {i}\n\n"
        time.sleep(1)

@app.get("/sse/stream")
def stream():
    return StreamingResponse(event_generator(), media_type="text/event-stream")

```

### **Go (net/http)**

```

func sseHandler(w http.ResponseWriter, r *http.Request) {
    flusher, ok := w.(http.Flusher)
    if !ok { http.Error(w, "Streaming unsupported", http.StatusInternalServerError); return }
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")

    for i := 0; i < 10; i++ {
        fmt.Fprintf(w, "id: %d\n", i)
        fmt.Fprintf(w, "data: %s\n\n", time.Now())
        flusher.Flush()
        time.Sleep(1 * time.Second)
    }
}

```

**要点**：服务端必须 flush（把缓冲推送到 TCP），否则客户端直到缓冲满或连接关闭才会收到。

---

## 4) 代理 / Nginx / 负载均衡常见配置（工程关键）

  

很多问题不是代码问题，而是代理把流缓冲了。常见 Nginx 配置要点（location 段）：

```

location /sse/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";         # 避免“Connection: keep-alive”与后端冲突
    proxy_buffering off;                    # 关键：关闭代理缓冲，允许实时传输
    proxy_cache off;
    gzip off;                               # gzip 会导致缓冲/等待块完成
}

```

- proxy_buffering off 非常重要，否则 Nginx 会把小 chunk 聚合后再发，破坏实时性。
    
- 如果用 HTTP/2，代理也可能做内部优化/缓冲，需测试并调整。
    

---

## 5) 限制与注意事项（面试常问）

- **单向**：客户端不能直接通过 SSE 发消息到服务端（只接收）。
    
- **不支持二进制**：只有文本（可以 base64 编码二进制）。
    
- **浏览器并发连接限制**：同域名下浏览器对并发持久连接（包括 SSE）通常有限制（例如 ~6），注意域名/子域划分或使用负载策略。
    
- **代理/缓存**：中间代理（NGINX、Cloudflare、CDN）默认可能缓冲或断开长连接，需要额外配置或使用不走 CDN 的子域。
    
- **连接数与扩展**：大量并发连接会压后端（每个连接占用 file descriptor、内存），需用专门的事件驱动服务器或连接代理（如 Nginx、Caddy、专业推送服务），或使用推送网关（SSE 网关/长连接服务）。
    
- **断连/顺序**：如果客户端断线并重连，Last-Event-ID 用于恢复，但你需要在后端保存可重放的历史或能根据 id 计算差异。
    

---

## 6) 安全和认证

- **Cookie/TLS**：如果用浏览器 cookie，EventSource 会自动带上（只要同域/有正确的 CORS）。使用 HTTPS 强制 TLS。
    
- **Authorization header**：EventSource 无法自定义请求头（浏览器限制）。若需要 Bearer token，可：
    
    - 把 token 放到查询参数（/stream?token=...）——比较常见但有泄露风险（日志、Referer）。
        
    - 或用短期 cookie/session 在登录时设置（更安全）。
        
    - 或先 POST 交换得到 stream id，再用 EventSource('/stream?id=...')。
        
    
- **CORS**：后端需要允许 text/event-stream 的 Content-Type，设置 Access-Control-Allow-Origin、Access-Control-Allow-Credentials 等（如果跨域并用 cookie）。
    

---

## 7) 与其他技术对比（面试必问）

- **SSE vs WebSocket**
    
    - SSE：单向、简单、浏览器原生、自动重连、文本。适合：通知、日志、AI 输出。
        
    - WebSocket：双向、二进制支持、需要心跳/重连逻辑。适合：聊天、协同编辑、游戏。
        
    
- **SSE vs Polling / Long Polling**
    
    - Polling：请求/响应开销大，延迟高。
        
    - Long Polling：模拟推送但有频繁重建连接成本。
        
    - SSE：更轻量、推送持续、效率更高（相比 polling）。
        
    
- **SSE vs HTTP Streaming via fetch**
    
    - fetch 可以读取 Response.body 的可读流（ReadableStream）并手动解析 chunk，但 fetch 不实现 SSE 的语义（自动重连、id、event），所以用 fetch 你要自己实现解析和重连策略。适合自定义协议或非标准流（例如 OpenAI 的 text-stream）。
        
    

---

## 8) 在工程中如何用 SSE 做 AI 打字机效果（完整实践建议）

  

目标：服务端逐 token 或分片推送，前端无闪烁、流畅渲染。

  

工程化要点：

1. **后端聚合策略（不要每 token 发一次）**
    
    - Token 级别会很频繁（高开销、网络压力）——推荐以 **小批次**（例如每 20–50 tokens 或按标点/空格）flush 一次。
        
    - 可发送两种事件：
        
        - event: partial（中间片段）data: 里放增量
            
        - event: done（完成）
            
        
    
2. **事件 id 与恢复**
    
    - 每个 flush 带递增 id，便于断线重连续传。
        
    
3. **服务端实现**
    
    - 在生成 loop 中 yield 按需 data: 并 flush。
        
    - 提供 retry: <ms>（可选）。
        
    
4. **前端渲染**
    
    - EventSource 回调里不要直接频繁操作 DOM。做如下：
        
        - 维护一个内存 buffer（string）。
            
        - 每次 partial 收到就 buffer += chunk。
            
        - 用 requestAnimationFrame 或每 16ms 批量写一次 DOM（或每 50ms）以避免重排次数过高。
            
        - 对 Markdown/HTML 渲染做“增量解析”而不是每次全部 parse。
            
        
    
5. **退化与兼容**
    
    - 如果环境不支持 EventSource（老浏览器或某些 webview），fallback 到 fetch 流或短轮询（先 POST 获取 task_id，再用 fetch stream）。
        
    
6. **例子（前端伪代码）**
    

```

const es = new EventSource(`/ai/stream?task=${taskId}`);
let buffer = '';
let scheduled = false;

es.addEventListener('partial', e => {
  buffer += e.data;
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      // 这里把 buffer 批量写入 DOM
      appendToChat(buffer);
      buffer = '';
      scheduled = false;
    });
  }
});

es.addEventListener('done', e => {
  // 完成逻辑
  es.close();
});

```

---

## 9) 性能 / 伸缩建议（系统设计层面）

- **每个连接资源占用**：每个 SSE 连接会占 FD、内存、事件循环资源。对于几十万并发连接，传统单机服务不够，用专门推送层或网关。
    
- **推送网关**：把 SSE 连接放在专门的进程/服务（使用 event-driven server 如 Nginx/Caddy 或专有推送服务），后端通过内部协议下发消息给网关（MQ、Redis pub/sub、专用通道）。
    
- **水平扩展**：使用 sticky session 或在连接层做消息路由（根据用户 id）。或使用消息队列集中广播到所有相关 worker。
    
- **心跳 / 空闲连接回收**：为了检测死连接，服务端可以周期性发送注入空事件或心跳行（如 data: \n\n 或 : keepalive\n\n 注：以 : 开头的注释行不会触发事件，但能维持连接），并在超过一定时间无响应则关闭。
    

---

## 10) 常见坑与排查方法（实战派）

- **客户端看不到事件**：检查 Response header 是否 Content-Type: text/event-stream 且连接未被代理缓冲。用 curl -N 测试（-N 表示不缓冲）。
    
- **Nginx/Cloudflare 缓冲/断连**：确认 proxy_buffering off; gzip off;，或直接绕过 CDN。Cloudflare 默认对长连接有超时限制。
    
- **EventSource 无法带 Authorization header**：常见误判；用 cookie/session 或先交换 token。
    
- **中文/多行被截断/乱码**：确保服务端 Content-Type 有正确 charset（通常 text/event-stream; charset=utf-8），并正确使用 \n 而非 \r\n 换行也要兼容。
    
- **fetch 误用**：用 fetch 读流时不要误以为它是 SSE；需要手写解析 data: 行并实现重连策略。
    
- **过度频繁 DOM 操作**：当数据高频来时，务必把渲染合并到 requestAnimationFrame 或节流逻辑。
    

---

## 11) 调试与测试小技巧

- curl -N http://localhost:3000/sse/stream（-N 禁用 buffering，实时打印）
    
- 浏览器 DevTools → Network → 选择 /stream，查看响应是否是 chunked、实时到达。
    
- 在后端打印每次 flush 的时间戳，确保没有被阻塞。
    
- 使用 tcpdump/wireshark 确认数据是否被代理/中间层吞滞或重传。
    

---

## 12) 什么时候用 SSE（决策树）

- 如果需求是 **只需服务器推送（单向）**、并且要**浏览器原生支持**并且**消息为文本** → 用 SSE。
    
- 如果需要 **双向交互、二进制或极低延迟双向交互** → 用 WebSocket 或 WebRTC DataChannel。
    
- 如果是 **移动/IoT 设备**（受网络或 NAT 限制），考虑 MQTT 或 gRPC streaming。
    
- 若要全球分发并用 CDN，请确认 CDN 支不支持持久长连接（很多 CDN 对长连接有限制），可能需设计短生命周期推送或使用专门推送服务。
    

---

## 13) 扩展话题（面试可能追问）

- **SSE 在 HTTP/2 上能否工作？**
    
    SSE 可以在 HTTP/2 上工作（因为 HTTP/2 支持流式响应），但中间代理或负载均衡器可能会以不同方式处理流和缓冲，实际工程中需要验证并根据代理调整配置。
    
- **如何做大规模（百万级）在线推送？**
    
    使用专门的长连接基础设施（边缘网关、长连接服务）、消息总线（Kafka/Redis）与连接层拆分、以及合理的分片与推送策略。
    
- **Last-Event-ID 的实现**：需要后端保存事件历史（或能通过 id 重建差异），或保证消息幂等/可重放。
    

