# **一、什么是 nextTick**

**nextTick = 等待当前同步代码执行完，并在下一轮微任务（或宏任务）中执行回调。**
它不是魔法，不是异步 API，本质是： 

> **利用事件循环，把任务延迟到 DOM 更新完成后再执行。**
# **二、为什么 Vue 需要 nextTick**

因为 Vue 的数据更新和 DOM 更新不是同步完成的：

```javascript
this.count++  // 数据立即改变（同步）
→ Vue 收集更新并放入 queue（异步）
→ 下一轮事件循环 flush → DOM 更新
```

所以如果你在数据更新后立即访问 DOM：

```javascript
this.count++
console.log(this.$refs.box.innerText) // 旧 DOM
```

Vue 必须给你一个方式等待 DOM 更新完成：

```javascript
this.count++
await nextTick()
console.log(this.$refs.box.innerText) // 新 DOM
```
# **三、如何实现 nextTick **

## **1. Vue 会维护一个“更新队列”**

每次修改响应式数据后：

```
依赖 → watcher → 把更新推入队列 → 不立刻执行
```

等到当前同步任务执行完后，再 flush 执行所有更新。
## **2. nextTick 的关键：利用微任务（优先）或宏任务**

Vue 内部做的事大约是：

```javascript
callbacks.push(cb)
scheduleFlush()
```

scheduleFlush() 会：
### **优先使用微任务**

- Promise.then
- queueMicrotask
- MutationObserver（Vue2 fallback）
### **如果微任务不能用 → 使用宏任务**

- setTimeout
- setImmediate
- MessageChannel

所以 nextTick 本质上是在事件循环中插入任务：

```
同步代码
↓
微任务(Promise) —— Vue flush DOM
↓
nextTick 回调执行
↓
渲染
```

因此 nextTick 才能保证回调永远发生在 DOM 更新之后。
# **四、nextTick 执行顺序精确图示**

假设代码是：

```javascript
this.count++
nextTick(() => console.log("A"))
console.log("B")
```

事件循环执行顺序是：

```
1. B（同步）
2. Vue flush watchers → 更新 DOM（微任务）
3. A（微任务回调）
4. 浏览器渲染
```
# **五、nextTick 解决的两个问题**

## **① DOM 获取滞后**

```
this.count++
console.log(this.$refs.box.innerHTML) // 拿不到新 DOM
```

用 nextTick 等 DOM 更新：

```
await nextTick()
console.log(this.$refs.box.innerHTML) // 正确
```
## **② 多个 state 更新时的合并**

this.count++ 改 10 次不会触发 10 次 DOM 更新，因为 Vue 会批处理：

```
同步修改 10 次
↓
watcher queue 只 push 一次
↓
nextTick flush 一次 DOM
```

nextTick 是整个合并机制的关键。
# **六、nextTick 与事件循环的关系**

  

> **nextTick = 用事件循环的微任务机制来等待 DOM 更新后的 hook。**

它“不是事件循环”，但“建立在事件循环之上”。

# **七、React 为什么没有 nextTick**

因为 React Fiber 的更新不是基于事件循环 tick 的概念，而是：

```
setState → Fiber 调度 → commit → useEffect
```

React 不允许你“等下一次 tick 再访问 DOM”。
它只允许你在 **useEffect** 中访问 DOM，这里 DOM 保证已更新。

所以：

- Vue：需要 nextTick（tick-based flush）
- React：不需要 nextTick（Fiber schedule-based flush）
