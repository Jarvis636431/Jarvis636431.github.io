---
title: "Promise"
description: "1.  Promise 并发控制（面试超高频）"
commentId: "blog-前端-经典手写题-promise"
publishDate: "2025-06-01"
tags: [
  "Promise", "前端", "手写题", "技术笔记"
]
draft: true
readingTime: 2
---

## 1. Promise 并发控制（面试超高频）

> 实现一个 limitLoad(tasks, limit)，要求最多同时执行 limit 个请求，所有任务执行完后返回结果。
### **核心思路：任务队列 + next 递归**

```javascript
function limitLoad(tasks, limit) {
  let index = 0;
  const results = [];
  let activeCount = 0;

  return new Promise((resolve, reject) => {
    function next() {
      if (index === tasks.length && activeCount === 0) {
        resolve(results);
        return;
      }
      while (activeCount < limit && index < tasks.length) {
        const cur = index++;
        activeCount++;

        tasks[cur]().then(res => {
          results[cur] = res;
        }).catch(reject).finally(() => {
          activeCount--;
          next();
        });
      }
    }
    next();
  });
}

```

- 控制并发必须维护 **队列** 和 **activeCount**
- 必须按任务顺序返回结果

# **##** 

## 2. 手写 Promise.retry

> 实现一个 retry(fn, count)，失败后自动重试，直到成功或次数耗尽。

```javascript
function retry(fn, count) {
  return new Promise((resolve, reject) => {
    function attempt() {
      fn()
        .then(resolve)
        .catch(err => {
          if (count === 0) reject(err);
          else {
            count--;
            attempt();
          }
        });
    }
    attempt();
  });
}

```

### **📌考点说明**

- 需要递归
- return 一个新的 Promise
- 必须在失败时继续 retry
## 3. 手写 Promise.all

> 按顺序返回结果，任意一个失败就 reject。

```javascript
function myAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let finished = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(res => {
          results[i] = res;
          finished++;

          if (finished === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

```

- 必须按顺序返回结果
- Promise.resolve 处理非 Promise 值
- 一个报错立刻 reject
## 4. 手写 Promise.race

```javascript
function myRace(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
}

```

- 只要有一个先 settle 就返回
- resolve 和 reject 都要监听

---

# **##** 

## 5. 手写 Promise.allSettled

```

function myAllSettled(promises) {
  return new Promise(resolve => {
    const results = [];
    let finished = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(
          value => results[i] = { status: "fulfilled", value },
          reason => results[i] = { status: "rejected", reason }
        )
        .finally(() => {
          finished++;
          if (finished === promises.length) {
            resolve(results);
          }
        });
    });
  });
}

```

### **📌考点说明**

- 所有的都要执行完
    
- 每个项有 status 字段
    

---

# **##** 

## 6. 手写 Promise.any

> 只要一个成功就 resolve，全部失败才 reject（AggregateError）

```javascript
function myAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let rejectedCount = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(resolve)
        .catch(err => {
          errors[i] = err;
          rejectedCount++;

          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors));
          }
        });
    });
  });
}

```

### **📌考点说明**

- 必须用 AggregateError
- 所有都失败才 reject
## 7. 手写一个简单的 Promise（极简版）

  

面试中不要求完整 A+ 实现，但至少写出下面这个版本。

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.value = value;

      this.callbacks.forEach(cb => cb.onFulfilled(value));
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;

      this.callbacks.forEach(cb => cb.onRejected(reason));
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = {
        onFulfilled: (value) => {
          try { resolve(onFulfilled(value)); }
          catch (err) { reject(err); }
        },
        onRejected: (reason) => {
          try { reject(onRejected(reason)); }
          catch (err) { reject(err); }
        }
      };

      if (this.state === 'pending') {
        this.callbacks.push(handler);
      } else if (this.state === 'fulfilled') {
        handler.onFulfilled(this.value);
      } else {
        handler.onRejected(this.value);
      }
    });
  }
}

```

### **📌考点说明**

- 只能由 pending → fulfilled/rejected
- then 必须返回新的 Promise
- 回调要排进微任务（完整版本才需要）
  
在真正面试时，只要能写出这个中等难度版本就够过了。

## 8. 手写 Promise.finally

```javascript
Promise.prototype.myFinally = function(cb) {
  return this.then(
    v => Promise.resolve(cb()).then(() => v),
    e => Promise.resolve(cb()).then(() => { throw e; })
  );
};

```

finally 不会改变值，只是透传。

## 9. 并发池：手写一个 promisePool（LeetCode 高频）

> 同时执行最大 n 个 promise，返回所有结果。

```javascript
async function promisePool(functions, n) {
  const executing = [];

  for (const fn of functions) {
    const p = fn();
    executing.push(p);

    if (executing.length >= n) {
      await Promise.race(executing);
      // 重要：移除已经执行完的
      executing.splice(executing.findIndex(p => p === Promise.race(executing)), 1);
    }
  }

  return Promise.all(executing);
}

```

