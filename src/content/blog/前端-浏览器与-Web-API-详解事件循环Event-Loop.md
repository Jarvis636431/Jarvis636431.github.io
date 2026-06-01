---
title: "详解事件循环(Event Loop)"
description: "事件循环（Event Loop）是浏览器或 Node.js 为 JavaScript 提供的一种任务调度机制，负责决定异步代码何时执行。"
commentId: "blog-前端-浏览器与-web-api-详解事件循环event-loop"
publishDate: "2025-06-01"
tags: [
  "Event Loop", "Web API", "前端", "技术笔记", "浏览器"
]
draft: true
readingTime: 4
---

# 什么是事件循环机制  

> **事件循环（Event Loop）是浏览器或 Node.js 为 JavaScript 提供的一种任务调度机制，负责决定异步代码何时执行。
> 同步任务是直接执行的，不参与事件循环**

因为 JavaScript 是单线程的，只能一次执行一个任务，所以需要一个调度机制来处理这些异步任务：

- setTimeout
- fetch
- DOM 事件
- Promise.then
- async/await
- 微任务
- 宏任务

事件循环负责安排它们的执行顺序。

### 简要概括

JS 是单线程，通过 **事件循环** 来处理异步：
1. **同步任务**直接执行。
2. 异步任务分为两类：
    - **微任务**（microtask）：
        - Promise.then
        - queueMicrotask
        - MutationObserver
    - **宏任务**（macrotask）：
        - setTimeout
        - setInterval
        - I/O
3. 执行顺序：

```

先执行同步 → 执行所有微任务 → 取出一个宏任务 → 执行微任务 → 再取宏任务……

```

核心：
- 微任务优先度高于宏任务。
- Promise.then 一定比 setTimeout 更早执行
## JavaScript 运行环境模型

搞清楚事件循环，就必须搞清楚谁负责什么。
## **（1）JavaScript 引擎（V8）**

负责：
- 解释 / 执行同步 JS 代码
- 管理堆、栈
- 执行 **微任务（microtask）**：Promise.then、queueMicrotask

不负责：
- setTimeout
- DOM
- AJAX
- I/O
- 网络请求
- timer 容器

👉 这些是环境提供的！

## **（2）浏览器提供的 Web API**

这些 API 是事件循环的基础，包括：
- setTimeout / setInterval
- DOM 事件（click、scroll）
- fetch / AJAX
- requestAnimationFrame
- MessageChannel
- Storage API（localStorage）
- WebSocket
这些都属于浏览器，不属于 JS。

## **（3）事件循环 Event Loop（浏览器提供）**

负责在：
- **宏任务队列（macrotask queue）**
- **微任务队列（microtask queue）**
之间协调执行顺序。
事件循环本身也不是 JS，而是浏览器 / Node 环境提供的。

## 三、任务类型：宏任务 & 微任务
## **宏任务（Macrotask）**

每完成一个宏任务，页面可以重新渲染。
宏任务包括：

- script（整体代码）
- setTimeout
- setInterval
- setImmediate（Node）
- I/O
- MessageChannel
- UI render
## **微任务（Microtask）**

微任务在 **当前宏任务执行结束后立即执行**，并且 **在下一个宏任务开始前执行完所有微任务**。

微任务包括：
- Promise.then
- queueMicrotask
- MutationObserver
- process.nextTick（Node 独有）
## 事件循环的执行顺序

浏览器事件循环的流程如下：
1. 执行一个宏任务（如 script）
2. 执行所有微任务（Promise.then 等）
3. 如果需要，渲染页面（repaint）
4. 取下一个宏任务
5. 回到第 2 步继续循环**

⚠️ 注意：“执行所有微任务” 是关键！！

执行微任务不会被打断，直到队列清空。
## 结合 Web API 看一个经典例子

```javascript
console.log("script start");

setTimeout(() => {
  console.log("timeout");
});

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("script end");

```

执行顺序：
1. 执行 script 宏任务
    - 打印：script start
    - 注册 setTimeout → 放入宏任务队列
    - 注册 Promise.then → 放入微任务队列
    - 打印：script end
2. 清空微任务队列
    - 执行 Promise.then：打印 promise
3. 下一次事件循环，取宏任务 setTimeout
    - 打印 timeout

注意：为什么会先输出纯 console.log()呢：

是因为这整个代码文件 script 算作了一个宏任务，浏览器先执行的是这个宏任务，而 start 和 end 两个输出属于这个宏任务里的同步代码，同步代码会直接执行，
事件循环主要针对的是 Promise 和 setTimeout 这种异步任务的执行顺序，同步任务不加入事件循环队列，此处的输出脚本本身是一个宏任务在事件循环队列里

```

script 宏任务本体
├── 同步代码（直接执行）
└── 遇到异步任务 → 交给 Web API

```

最终顺序：

```

script start
script end
promise
timeout

```

## 为什么 Promise 比 setTimeout 先执行？
原因：

- Promise.then 属于 **微任务**
- setTimeout 属于 **宏任务**
- 事件循环规则：
    **一个宏任务 → 执行所有微任务 → 下一个宏任务**
所以 Promise.then 一定比 setTimeout 早。

## 加入 async/await 时的事件循环

```

async function foo() {
  console.log("foo start");
  await Promise.resolve();
  console.log("foo end");
}

console.log("script start");
foo();
console.log("script end");

```

执行顺序：

```

script start
foo start
script end
foo end

```

### **原因：**
- await 会把后续代码放入微任务队列
- 所以 foo end 是微任务
## Node.js 的事件循环（额外）
Node 和浏览器不一样，因为 Node 有 libuv。
Node 的宏任务阶段有：
1. timers（setTimeout）
2. I/O callbacks
3. idle / prepare
4. poll（I/O 阶段）
5. check（setImmediate）
6. close callbacks
并且 Node 有特殊微任务
- process.nextTick（比微任务还快）

