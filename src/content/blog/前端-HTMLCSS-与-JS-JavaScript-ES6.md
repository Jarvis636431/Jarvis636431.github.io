---
title: "JavaScript （ES6）"
description: "1. var、let、const 的区别"
commentId: "blog-前端-htmlcss-与-js-javascript-es6"
publishDate: "2025-06-01"
tags: [
  "HTML/CSS/JS", "前端", "技术笔记"
]
draft: true
readingTime: 5
---

## **1. var、let、const 的区别**

|**特性**|**var**|**let**|**const**|
|---|---|---|---|
|作用域|函数作用域|块级作用域|块级作用域|
|重复声明|✔可以|❌不可以|❌不可以|
|暂时性死区（TDZ）|❌无|✔有|✔有|
|是否会挂载到 window|✔会|❌不会|❌不会|
|赋值|可以|可以|❌必须初始化 & 不可重新赋值|

- let/const 出现是为了解决 var 的变量提升 + 全局污染问题。
- const 不能重新赋值，但**对象的属性可修改**（引用不变即可）
## 3. == 和 === 的区别？为什么不建议用 ==
- === ：值 & 类型都必须相等（严格相等）
- == ：会进行**强制类型转换**
如：

```javascript
0 == ''   // true
'' == false // true
null == undefined // true

```

== 的隐式转换规则太复杂且容易出 bug，所以实际开发总是推荐用 === 。
## **4. 原型（prototype）和原型链是什么？**
- 每个对象都有一个隐藏属性 __proto__
- __proto__ 指向它的构造函数的 prototype
形成：

```

对象 → 原型 → 原型的原型 → … → Object.prototype → null

```

### **作用**
- 实现**属性查找机制**
- JS 的继承本质就是靠原型链实现
## **5. 什么是闭包？有什么作用？**
闭包 = **函数 + 函数能够访问的外部变量**
比如：

```javascript
function outer() {
  let count = 0;
  return function inner() {
    return ++count;
  };
}

```

### **作用**
1. **实现私有变量**
2. **实现函数柯里化**
3. **避免变量被意外修改**
### **缺点**
- 可能造成内存泄漏（变量在函数外部被长期引用)
## **7.call、apply、bind 的区别？**

| **方法** | **执行函数？** | **参数传递** | **作用**       |
| ------ | --------- | -------- | ------------ |
| call   | 立即执行      | 单个传      | 改 this       |
| apply  | 立即执行      | 数组传      | 改 this       |
| bind   | 返回新函数     | 单个传      | 延迟调用并固定 this |
## **8. 什么是 Promise？它解决了什么问题？**

Promise 是一种处理异步的对象，用来解决：
1. 回调地狱
2. 错误难以捕获
3. 多个异步任务难以串行/并行管理
### **三种状态**
- pending
- fulfilled
- rejected
状态一旦改变就不能再变。
## **9. async/await 的原理是什么？**
- async/await 是基于 **Promise + Generator 的语法糖**
- await 会暂停函数执行，等待 Promise 结果
### **优点：**

- 让异步代码像同步一样写
- 更容易处理异常（try/catch）
## **10. 什么是执行上下文（Execution Context）？**
### **三个阶段：**

1. **创建阶段**
    - 变量提升
    - this 绑定
    - 创建词法环境
2. **执行阶段**
    - 按顺序执行代码
3. **销毁阶段**
### **类型**
- 全局执行上下文
- 函数执行上下文
- eval 执行上下文
## **11. typeof 和 instanceof 的区别？**

|**方法**|**能判断**|**不能判断**|
|---|---|---|
|typeof|基本类型（string/number 等）|null（返回 object）|
|instanceof|判断对象的原型链|基本类型|

例如：

```javascript
[] instanceof Array // true
typeof [] // "object"

```

## **12. 事件委托是什么？为什么要用事件委托？**

事件委托 = 把子元素事件绑定到父元素上利用冒泡实现。
### **作用**

1. 提升性能（少绑很多事件）
2. 动态元素也能监听
## **13. 防抖和节流的区别？**

### **防抖（debounce）**
事件停止 n 毫秒后再执行 → 典型场景：输入框搜索
### **节流（throttle）**
每隔 n 毫秒执行一次 → 典型场景：滚动事件
## **14. null 和 undefined 的区别**

|**类型**|**含义**|
|---|---|
|undefined|变量未赋值|
|null|主动设置为空|
typeof：

```

typeof null === "object" // JS 历史遗留 bug

```

## **15. Promise 有几种常用方法？**
### **静态方法**

- Promise.resolve
- Promise.reject
- Promise.all
- Promise.race
- Promise.allSettled
- Promise.any
### **实例方法**

- then
- catch
- finally

## **1. 箭头函数与普通函数的区别**

| **特性**                      | **箭头函数**         | **普通函数**     |
| --------------------------- | ---------------- | ------------ |
| this 指向                     | **定义时绑定（词法作用域）** | 运行时绑定（动态作用域） |
| 是否有 arguments               | 没有               | ✔ 有          |
| 是否可构造（能不能 new）              | 不能               | ✔ 能          |
| 是否可作为 generator             | 不行               | ✔ 可以         |
| 是否有 prototype               | 没有               | ✔ 有          |
| 是否能用 call/apply/bind 改 this | 无法改变             | ✔ 可以         |

> 箭头函数是给回调函数准备的，它不需要自己的 this、arguments、prototype。
## **2. 箭头函数为什么没有自己的 this？**

因为箭头函数的 this 是**在定义时就决定的**，取决于**外层作用域**的 this。
示例：

```javascript
const obj = {
  name: "A",
  say: () => {
    console.log(this.name);
  },
};

```

say 中的 this 来自于**全局作用域**，不是 obj，因此 this.name 会输出 undefined。
## **3. 箭头函数的 this 能用 call/apply/bind 修改么？**

### **答案：不能。**

```javascript
const fn = () => this;
fn.call({ a: 1 }) === fn(); // true

```

call/apply/bind 对箭头函数无效，因为箭头函数没有自己的 this。

## **4. 箭头函数为什么不能作为构造函数？**

因为箭头函数没有：

- prototype 属性
- [[Construct]] 内部方法
所以不能用 new：

```javascript
const Person = () => {};
new Person(); // TypeError: Person is not a constructor

```

## **5. 箭头函数为什么没有 arguments？**

它没有自己的 arguments，只能用 rest 参数代替：

```javascript
const fn = (...args) => {
  console.log(args);
};

```

## **6. 箭头函数适合用在哪些场景？**

### **✔ 1. 回调函数（典型使用）**

比如数组操作：

```

arr.map(x => x * 2);

```

### **✔ 2. 保留外层 this 的场景**

例如 class 中的回调：

```

class Button {
  constructor() {
    this.msg = "clicked";
  }
  
  handleClick = () => {
    console.log(this.msg);
  }
}

```

### **✔ 3. 事件回调（如果需要使用外层 this）**

## **7. 哪些场景不适合使用箭头函数？**

### **❌ 1. 当你需要 this 指向当前对象时（如：对象方法）**

```

const obj = {
  x: 1,
  getX: () => this.x,  // this 来自全局，对象方法不要用箭头函数！
};

```

### **❌ 2. 构造函数**

### **❌ 3. 动态 this（如 event handler 需要 access this）**

### **❌ 4. 需要 arguments 的函数**

## **8. 箭头函数能否作为对象的方法？**

**不推荐，且大多数情况不行。**
理由：对象方法经常需要 this 指向当前对象，而箭头函数会把 this 固定为外层，从而失效。

## **9. 箭头函数的返回值有哪些写法？**

### **简写返回值**

```

const add = (a, b) => a + b;

```

### **返回对象时要注意写法：**

```

const getObj = () => ({ a: 1 }); // 用 () 包起来

```

否则会被解析为代码块。

---

## **10. 箭头函数如何与 async/await 搭配？**

  

完全可以一起用：

```

const fetchData = async () => {
  const res = await fetch('/api');
  return res.json();
};

```

> **箭头函数没有 this、arguments、prototype，也不能 new；this 在定义时决定，并且无法被 call/apply/bind 改变；最适用于回调或需要绑定外层 this 的场景，不适用于对象方法。**

