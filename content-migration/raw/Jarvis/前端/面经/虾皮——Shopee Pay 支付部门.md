# 一面——12.05
##### 代码题
##### 1.箭头函数的 this
```javascript
var a = 10
var obj = {
  a: 20,
  say: () => {
    console.log(this.a)
  }
}
//问题
obj.say()
//追问
obj.say.call({a: 1})
```
正确输出：10 10
解析： 
**1. 箭头函数不绑定自己的 this**
=> 的 this **取决于定义位置的外层作用域**，不会因为被作为 obj.say() 调用而改变，也不能被 call / apply / bind 改变 this。
**2. 外层作用域在哪里？**
箭头函数是在 **全局作用域** 中定义的（因为对象字面量不会创建新的 this 绑定）。
所以：
- 在浏览器：this === window，而全局声明 var a = 10 等价于 window.a = 10
- 在 Node：全局 this 是 {}（空对象），但由于 REPL 或运行方式不同也可能得到 undefined
**浏览器场景输出就是：10**
**3. 关键点**
obj.say() 的 this **不会指向 obj**，因为箭头函数无法通过调用方式改变 this。
**4.追问：如果加上 call 呢**
箭头函数的 this 不会被 call / apply / bind 改变，所以a:1会直接被忽略
##### 2.JS 的对象
```javascript
let foo={}
let obj = {}
foo[obj]='hello'

let obj2 = {a:1}
foo[obj2] = 'hello2'

console.log(foo[obj], foo[obj2])
```
正确输出：hello2 hello2
解析：
在 JS 中，**对象作为普通对象的 key 会被隐式转换为字符串 "object Object"。**
也就是说：
```javascript
foo[obj] = 'hello'    // foo["[object Object]"] = "hello"
foo[obj2] = 'hello2'  // foo["[object Object]"] = "hello2"  ← 覆盖
```
因为两个 key 最终都是同一个字符串"[ object Object ]"，所以后一次赋值会覆盖前一次赋值。
##### 八股：
###### 1.JS 的基础类型一共有几种：
7 种：
1. **number**
2. **string**
3. **boolean**
4. **null**
5. **undefined**
6. **symbol**
7. **bigint**
###### 2.Object 的 key 可以有几种类型：
在 JavaScript 中，普通对象（Object）的 key 只能是两种：string symbol 其他类型都会被转换成 string。
###### 3.JS 的隐式类型转换
隐式类型转换（Implicit Type Conversion）是 **JavaScript 在需要某种类型却拿到另一种类型时自动发生的类型转换**。
它遵循 **ECMAScript 的抽象操作**，主要是下面三个核心步骤
**JavaScript 隐式类型转换的三大核心过程**
**1. ToPrimitive（转换为原始类型）**
当一个对象参与比较/运算时，会先被转换为基本类型。
顺序如下：
调用 valueOf()
如果返回的不是原始值 → 调用 toString()
仍然不是原始值 → 报错（通常不会发生）
例：

```
[1,2] + 1
```
过程：
- [1,2].toString() → "1,2"
- "1,2" + 1 → "1,21"
**2. ToNumber（转换为数字）**
常见规则：

```
Number("123") → 123
Number("") → 0
Number(true) → 1
Number(false) → 0
Number(null) → 0
Number(undefined) → NaN
Number("abc") → NaN
```

加号（+）在数值运算时会触发 ToNumber：

```
1 + "2" → "12" // 因为 "2" 是 string，所以走拼接
"2" * 3 → 6    // 其他运算符强制走 ToNumber
```

 **3. ToBoolean（转换为布尔值）**
**只有 7 个值是假值（Falsy）：**

1. false
2. 0
3. -0
4. ""（空字符串）
5. null
6. undefined
7. NaN
其他统统是真值（包括对象、空数组、空对象）。

```
if ({}) console.log("true")  // true
if ([]) console.log("true")  // true
```

继续代码输出题
##### 3.Promise
```javaScript
async function getValue(){
  return 2
}
const val = getValue();
console.log(val)
```
答案：Promise {< fulfilled >: 2}
解析：
async function **默认返回一个 Promise**。return 2 等价于 return Promise.resolve(2)，所以 getValue() 的结果是 Promise，所以有：
```javascript
const val = getValue(); // val 是 Promise
console.log(val);       // 打印 Promise 对象
```
##### 4.Promise
```javascript
new Promise((resolve, reject) => {
	setTimeout(() => resolve(123), 1000);
})
.then((res) => {
  console.log("1", res);
  return 456;
})
.then((res) => {
  console.log("2", res);
  return Promise.resolve(789);
})
.then((res) => {
  console.log("3", res);
  throw 56;
})
.then((res) => console.log("4", res))
.catch((err) => console.log("err", err));
```
输出顺序：
```
1 123
2 456
3 789
err 56
```
解析：
```javascript
new Promise((resolve, reject) => {
  setTimeout(() => resolve(123), 1000);//1 秒后 resolve(123)，Promise 进入 fulfilled 状态。
})
//第一个 then
.then((res) => {
  console.log("1", res); // 打印：1 123
  return 456;            // 返回普通值 → 会被包装为 Promise.resolve(456)
})
//下一步 then 收到 456
.then((res) => {
  console.log("2", res); // 打印：2 456
  return Promise.resolve(789);//返回一个 fulfilled 的 promise，值是 789
})
//下一步 then 收到 789。
.then((res) => {
  console.log("3", res); // 打印：3 789
  throw 56;              // 抛出错误
})
//抛出的错误会让 Promise 状态变为 rejected(56)，链会跳过后续的正常 then，进入 catch。
//下一个 then 不会执行，因为上一环节遇到了错误，状态变为了 rejected
.then((res) => console.log("4", res))
//catch 接收到错误 56
.catch((err) => console.log("err", err));
```
##### 5. Promise
```javascript
async function fetchData(){
  return await new Promise((resolve, reject)=>{
      setTimeout(reject, 1000)
  })
}
try{
  fetchData()
  console.log('success')
}catch(e){
  console.log('error')
}
```
输出：success
解析：
1. **async 函数返回的是 Promise，不会在外层形成同步的 try/catch 捕获**
2. try { fetchData() } 只会捕获同步异常，而 async 函数内部的异常是 **异步的 rejected promise** 如果想要捕获异步的异常，需要加上 await 或者.catch
即：
```javascript
try {
  await fetchData()
  console.log('success')
} catch (e) {
  console.log('error')  // 会打印 error
}
```
或者
```javascript
fetchData().catch(() => console.log('error'))
```
##### 八股：如何全局捕获同步异步错误呢
浏览器端：
1.捕获同步错误(包括运行时异常)：
```javascript
window.onerror = function(message, source, lineno, colno, error) {
  console.log('同步错误捕获：', error);
};
```
能捕获：
- 未定义变量错误
- 运行时错误
- 脚本加载错误（部分不行，需 crossorigin 配置）
2.**捕获未处理的 Promise 异常（异步错误）**

```javascript
window.addEventListener('unhandledrejection', function(event) {
  console.log('未捕获的 Promise 异常：', event.reason);
});
```
能捕获：没有加.catch的普通的 Promise.reject,以及 async 函数未处理的reject
3.捕获资源加载错误
```javascript
window.addEventListener('error', function(event) {
  console.log('资源加载错误', event);
}, true);
```
必须使用捕获阶段(True)
##### React代码题
###### 1.React 的状态更新
```javascript
function Counter() {
const [number, setNumber] = useState(0);
return (
  <>
    <h1>{number}</h1>
    <button onClick={() => {
      setNumber(number + 5);
      console.log(number);
    }}>+5</button>
  </>
)
}
```
正确输出：console.log打印的还是旧的 number 值，而非 number+5 的值
解析：
因为 React 的 state 更新是 **异步且批处理（batching）** 的。setNumber 触发状态更新，但不会立刻更新组件中的 number 变量。 当前事件中的所有 state 更新会被 React 合并，然后在一次重新渲染中统一生效。所以紧跟在 setNumber 后的 console.log 拿到的是旧值。，也就是说 console.log输出的时候，页面还没有重新渲染生效状态
追问：如果在 console.log 外包裹一层 setTimeout 呢，输出的是什么值
```tsx
<button onClick={() => {
  setNumber(number + 5);
  setTimeout(() => console.log(number), 0);
}}>
  +5
</button>
```
正确答案：仍然是旧的 number 值
解析：
核心思想：**闭包（closure）+ 组件重新渲染的机制**
 **当你点击按钮时：**
- React 调用组件函数（一次渲染）
- 生成一个属于这次渲染的变量：number = 某个旧值
- setNumber(number + 5) 只发起更新，不立即修改 number
- setTimeout 的回调**捕获**了这次渲染闭包中的旧 number
因为**函数组件的变量不会在原地改变**，React 是通过“重新执行组件函数”来让变量更新的，而 setTimeout 回调不会触发新渲染，它只执行捕获的旧闭包变量。
###### 2. useEffect
```tsx
function Counter() {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    console.log('useEffect handler called');
    return () => console.log('useEffect destoryed!');
  }, [number]);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
      }}>Increase the number</button>
    </>
  );
}
```
正确输出顺序：
初次渲染时输出：
useEffect handler called
点击一次按钮后：
useEffect destoryed!
useEffect handler called
每次点击都会重复这个过程
解析：
useEffect 的依赖是 [number]当 number 发生变化时：
1. React 先运行上一次 effect 的 cleanup（return 函数）
2. 再运行新的 effect handler
###### 3.找到代码中的错误
```tsx
function useFetchFriendStatus(friendId) {
	if( friendId === -1 ){
	    return 'Offline'
	}
	const [online, setOnline] = useState('online')
	function handle(status) {
		  setOnline(status)
	}
	return subscribeToFriendStatusAPI(props.friend.id, handle);
}
function FriendStatus(props) {
	const isOnline = useFetchFriendStatus(props.friend.id)
	if (isOnline === null) {
	  return 'Loading...';
	}
	return isOnline ? 'Online' : 'Offline';
}
```
核心错误：
```tsx
if( friendId === -1 ){
    return 'Offline'
}
const [online, setOnline] = useState('online')
```
这里 Hook 在 if 后面执行，这会导致：
- 可能跳过 useState，使 Hook 调用顺序不一致
- React 抛错：**Hooks can only be called in the same order**
**Hook 必须无条件执行**。
追问：Hook 为什么必须在顶层调用呢，不可以放在条件后面执行：
答案：因为 **React 依赖组件内的 Hook 调用顺序来记录和恢复状态**，Hook 不像类组件那样通过 this 区分实例，也没有名字。React 只能通过 **调用顺序（call order）** 来判断哪个 useState/useEffect 对应哪个状态。 如果 Hook 调用写在条件、循环中，会导致调用顺序发生变化，从而破坏 React 的状态映射。**React 通过调用顺序识别 Hook，而不是通过变量名识别。**
核心(联系到 Fiber 架构)：
Hook 依赖调用顺序来维护内部状态，而不是变量名。  React 在 Fiber 上维护一条 Hook 链表，每执行一次 useState/useEffect，就向链表写入一个 hook 节点。如果你把 Hook 放在条件、循环、回调里，会导致执行顺序变化，React 无法正确匹配 hook → 状态错乱。所以 Hook 必须在函数组件的顶层调用

##### Node 相关
###### 八股：Node的事件循环机制
答案：**Node.js 事件循环由 libuv 驱动，分 6 个阶段，每个阶段依次执行队列中的回调，各阶段之间插入微任务检查。**
Node 的 loop 会不停执行如下阶段：
1. **timers**
    - 执行 setTimeout 和 setInterval 的回调
    - 执行时机：到达最早到期的 timer
2. **pending callbacks**
    - 系统操作的某些延迟回调，比如 TCP 错误，某些 I/O 的错误
3. **idle, prepare**
    - 内部使用，开发者不会碰到
4. **poll（重点）**
    - 读取 I/O，执行 I/O 相关回调
    - 如果队列为空：
        - 若有 timer 到期 → 去 timers 阶段
        - 否则可能阻塞等待 I/O
5. **check**
    - 执行 setImmediate 回调
6. **close callbacks**
    - 执行 close 事件，如 socket.on('close', ...)
###### Node 中的 CommonJS 的导出规则
1.代码输出题
```javascript
//test.js
exports.add = 100;
module.exports = 1;
//test1.js文件
let test = require("./test");
let p = test.add;
let b = test;
console.log("p的值是：" + p);
console.log("b的值是：" + b);
```
最终输出：p 的值是undefined，b 的值是 1
解析：
- exports 只是 module.exports 的 **引用（指向同一个对象）
- 但**一旦你重新赋值** **module.exports = xxx**，引用关系就断了
- CommonJS 最终导出的是 **module.exports**
**所以不能同时使用这两种导出方法，只要写了module.exports = xxx,就会覆盖掉之前所有写在 exports 上的内容。
2.代码输出题
```javascript
// a.js

let a = 0;
function add() {
  a += 1;
}
module.exports = { 
  a,
  add,  
}
// b.js
const { a, add } = require('./a');
console.log(a);
add();
console.log(a);
```
答案：0 0，即两个 a 都是 0
解析：
CommonJS module.exports 导出的是一个对象。但是你在 require('./a') 后做了 **解构赋值**const { a, add } = require('./a');解构会把 a 的值 **复制一份** 给本地变量 a，而不是保持引用。
所以：
- a.js 内部的 a 是 **模块内部变量**
- 解构出的 a 是一个 **独立的数值 0**
- 调用 add() 修改的是 a.js 内部的 a
- 但不会影响你解构出来的 a
追问：如果不使用解构，而是直接使用对象引用的话，则访问到的是正常的值
```javascript
const obj = require('./a');

console.log(obj.a); // 0
obj.add();
console.log(obj.a); // 1
```
#### 手写代码：
##### 1.结合 TS 的泛型，实现一个 POST 函数，支持多个 API 的调用请求与返回
关键在于不同 API 的请求体和响应体的数据类型和格式不一样，如何使用泛型来约束，实现这么一个统一的方法
答案：
```typescript
async function post<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
//TReq 为请求体类型，TRes 为响应体类型
  return res.json() as Promise<TRes>;
}
```
追问：能不能给请求体加一个约束，比如说，一定包含一个 string 类型的 id 字段
答案：使用 extends 约束泛型
```typescript
//写法 1
type WithId = {
  id: string;
};

function post<TReq extends WithId, TRes>(
  url: string,
  data: TReq
): Promise<TRes> {
  // ...
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  }).then(r => r.json());
}

//写法 2
function post<TReq extends { id: string }, TRes>(
  url: string,
  data: TReq
): Promise<TRes> {
  //...
}
```
##### 2.写一个函数add，支持固定次数的链式调用，输出结果总和。如 add(1)(2)(3) -> 输出6
答案：
```javascript
function add(x) {
  let sum = x;

  function inner(y) {
    sum += y;
    return inner;
  }

  inner.valueOf = function () {
    return sum;
  };

  inner.toString = function () {
    return sum;
  };

  return inner;
}
```
核心在于**当 console.log / == / + 运算 时，JS 会对函数进行隐式类型转换**
会尝试调用：
1. valueOf()
2. toString()
只要让这两个函数返回最终 sum 即可。
##### 3.数组扁平化：给定一个数组，要求递归地将数组扁平化。也就是实现Array.flat方法 [1,[2],[3,[4,5]]] => [1,2,3,4,5]
答案：
```javascript
/**
 * 递归扁平化数组
 * @param {Array} arr 
 * @returns {Array}
 */
function flat(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flat(item)); // 递归展开
    } else {
      result.push(item);
    }
  }

  return result;
}
```

#### 项目+八股
##### 1.看到你项目中配置了 https 的证书，那么https相比于http的优势在哪
###### 1.**数据加密：防止窃听（Eavesdropping）**
HTTP 明文传输，任何人都可以看到：
- 登录账号密码
- Cookie
- Token
- 请求内容
HTTPS 使用 **TLS** 加密，使中间人（MITM）无法直接读取数据。
###### **2.数据完整性：防止篡改（Tampering）**
在 HTTP 下，攻击者可以修改请求和响应：
- 注入广告
- 注入恶意脚本
- 篡改接口返回值
HTTPS 使用 **MAC（消息认证码）** 和 **数字签名** 防止被修改。
###### **3.服务器身份验证：防止伪装（Spoofing）**
CA 证书保证你访问的就是：
- 真正的服务器
- 而不是钓鱼网站
- 也不是中间人伪造的 IP
这是 HTTP 无法做到的。
###### 4. **性能更快（HTTP/2 依赖 HTTPS）**
很多人以为 HTTPS 更慢，其实反过来：
- HTTP/2 必须在 TLS（HTTPS） 上运行
- 拥有多路复用、头部压缩、流量控制
- 页面资源总加载时间更快
###### 追问：https 是如何确定请求的是真实服务器的
HTTPS 通过 **数字证书 + CA 信任体系 + 服务器私钥验证** 来确认你访问的确是真实服务器。
客户端会检验证书是否合法、域名是否匹配、是否由受信的 CA 签发、是否被篡改。
最终浏览器用证书公钥加密随机数，只有持有对应“私钥”的真实服务器才能解密，从而证明它的身份
完整流程：
**1. 服务器给你发数字证书（证书里包含公钥 + 域名 + CA 签名）**
内容包括：
- 服务器公钥
- 服务器域名（如：www.google.com）
- CA 的数字签名
- 证书有效期
**2. 浏览器验证证书是否合法**
验证包含：
 **(1) 证书是不是由受信任的 CA 签的**
浏览器内置一堆“根证书”（根 CA）。
浏览器用根 CA 的公钥解开证书签名，能成功解开 → 说明证书是真的。
 **(2) 证书的域名与你访问的域名是否匹配**
证书里写的是你的域名，只有访问相同的域名才可以
 **(3) 证书是否过期、是否吊销**
浏览器会检查：
- 有效期
- CRL/OCSP 是否标记为已吊销
**3. 浏览器生成一个随机数，用证书里的公钥加密发给服务器**
这个随机数就是后面 HTTPS 对称加密的“密钥”。
**重点是：只有正确的服务器（拥有私钥）才能解密这个随机数。**
**4. 服务器用自己的私钥解密随机数**
成功解密 → 证明是真正的服务器
**5. 双方用这个随机数生成会话密钥，后续所有数据对称加密**
##### 2.如何避免请求风暴
题目详细描述，假如说有一个 APP，我刚进入首页的时候会发起许多个请求，假设这时候 access token刚过期，这些所有的请求都触发了 401 需要 refresh的请求，这里就积累了一堆过期 token 的请求，该怎么避免这种情况
标准答案：
1. **检测 401（token 过期）**
2. **让第一个触发 401 的请求负责刷新 token（使用 refresh_token）**
3. **其他并发请求全部等待这个刷新过程完成**
4. **刷新成功后继续重新发请求**
5. **刷新失败 → 全部跳转登录**
单例刷新（Single-Flight Refresh）又叫 token refresh deduplication
核心问题：
如果不做处理，你会看到：
- 打开首页瞬间发出几十个请求
- token 刚过期 → 每个都返回 401
- 每个请求都去刷新 token → **形成刷新风暴**
- 导致服务压力陡增，甚至死锁
所以必须让：多个请求只触发一次 token 刷新
具体解法：**使用“请求队列 + 刷新锁（Refresh Token Lock）” 只刷新一次**
##### 3. 为什么要集成 Sentry 这种监控体系，具体关注了哪些指标
为了保证系统稳定性和业务连续性，需要对系统进行**可观测（Observability）**建设。
包括：**监控（Metrics）+ 日志（Log）+ 链路追踪（Tracing）**

 **监控体系要关注哪些关键指标**
 ###### **一、业务指标（最重要）**

| **指标**  | **说明**           | **为什么重要**  |
| ------- | ---------------- | ---------- |
| PV / UV | 访问量、访客数          | 评估用户规模     |
| 各页面加载时长 | FP、FCP、LCP、TTI 等 | 影响用户体验与转化率 |
| 接口成功率   | HTTP 成功/失败比      | 判断是否影响用户操作 |
| 错误率     | 页面 JS 错误、接口错误    | 判断线上是否稳定   |
| 转化漏斗    | 重要流程如支付、登录       | 直接影响业务收入   |
| 用户行为    | 停留时长、点击路径        | 用于产品优化     |
 ###### **二、性能指标（前端 + 后端）**
 **前端性能（Core Web Vitals）**

- LCP（最大内容绘制）
- FID / INP（交互延迟）
- CLS（布局偏移）
- TTFB（首包时间）
- 白屏时间、首屏时间
**后端性能**
- 接口整体响应时间（P95/P99）
- 吞吐量 QPS / TPS
- 队列长度
- 数据库查询耗时
###### **三、系统资源指标（Server / Pod / Node）**

| **指标**        | **说明**           |
| ------------- | ---------------- |
| CPU 使用率       | 是否出现 CPU 打满 / 抖动 |
| 内存使用率         | 判断是否内存泄漏         |
| 磁盘 IO / 网络 IO | 是否成为瓶颈           |
| 磁盘剩余空间        | 防止写文件失败          |
| 线程池/连接池使用率    | 防止耗尽             |
###### **四、稳定性相关指标**

- 错误率（JS Error / API Error / 崩溃率）
- 重试率
- 超时率
- 服务可用性 SLA（比如 99.9%）
- 延迟的 P90 / P95 / P99（尾延迟）
>高延迟来自链路瓶颈：DB、缓存失效、队列阻塞、线程池满等。

###### **五、链路监控（Tracing）**
使用工具：Jaeger / SkyWalking / Zipkin / OpenTelemetry
可观察：
- 每个请求经过哪些服务
- 哪一段链路慢
- 有没有服务超时、重试、熔断
这是**微服务时代必备**。
###### **六、日志（Log）体系**
全链路日志包含：
- 业务日志
- 错误日志
- 访问日志（Nginx）
- 安全日志
通常使用 ELK（Elasticsearch + Logstash + Kibana）或 Loki / OpenSearch。

##### 4.跨域相关的解决办法
主要是在后端配置 CORS 跨域资源共享的响应头，以及在 Nginx 中做相关的配置，具体可见跨域
##### 5.JWT是什么，JWT既然是无状态的，那他会有安全隐患，该怎么解决
 **1. JWT 无法主动失效（最大问题）**
JWT 一旦签发，**在过期之前都是有效的**：
- 服务端不存储 session
- 因此无法“主动注销 / 强制下线 / 撤销 token”
常见风险：
- 用户换密码旧 token 依然能用
- 用户退出登录但 token 还没过期
- 被盗的 token 没法立刻失效
**2. Token 暴露后，攻击者可完全冒充用户**
JWT 通常存放在：
- localStorage ❌（容易被 XSS 盗取）
- cookie + httpOnly ✔️（比较安全）  
> 只要 JWT 泄漏，就能在有效期内完全伪造身份。

风险来源：
- XSS 攻击窃取 localStorage 里的 token
- https 被降级攻击
- 第三方不安全 SDK 泄漏 token
**3. 不正确的签名校验导致被伪造**
曾经出现很多攻击案例：
- 服务端不校验 alg 字段，被攻击者把算法改成 none
- 服务端只支持 HS256，但攻击者改成 RS256，某些库会直接跳过校验
- 服务端泄漏了 secret key（HS256）
> 签名配置不正确会让 JWT 完全可伪造。
- 
**4. Payload 明文可读（Base64，不是加密！）**

JWT 的 payload 是明文的：

```
{
  "user": "tom",
  "role": "admin"
}
```

任何人都能看到：
- 用户信息
- 权限信息
- 过期时间
⚠️ 不能把敏感信息（手机号、权限标识、内部 ID）放在 payload。
**5. Token 体积大，放在 Header 中会造成开销**
JWT 通常比 session id 大 10 倍：

```
Cookie: token=eyJhbGciOi...
```

影响：
- 每个请求都要带着
- 影响网络带宽
- 在弱网环境显得更慢
**6. 长期 Token + Refresh Token 处理不当导致安全问题**
- accessToken 有效期短
- refreshToken 有效期长
如果 refreshToken 存放不安全，也会被盗用 → 用户永久被接管。
**7. 时间同步问题导致过期判断错误**
如果服务器时间错误：
- 用户 token 明明没过期却被判定过期
- 或者已经过期的 token 还能继续使用
> 所以生产环境常用 httpOnly + secure cookie，并结合 **黑名单** 或 **短 token + refresh token** 来解决


# 二面——12.09
### 项目
1.讲讲你的实习经历，做的项目具体是什么
2.选一个你的项目讲讲，你主要负责了什么，具体实现了什么功能
看过开源的框架/库的实现么
3.你了解哪些3D 框架，讲讲你对 babylon 的了解，和 Three.js有什么区别
4.WebGPU 是什么，有哪些浏览器支持 WebGPU
5.用过 next.js么，他主要提供了什么能力，讲讲你的了解
6.有没有读过前端的框架源码，对比一下 React 和 Vue 的区别
### 手撕
最小升序子数组
给你一个整数数组 nums ，你需要找出一个 连续子数组 ，如果对这个子数组进行升序排序，那么整个数组都会变为升序排序。
请你找出符合题意的 最短 子数组，并输出它的长度。
解法 1：
```javascript
function findUnsortedSubarray(nums) {
  const arr = nums.slice().sort((a, b) => a - b);
  let left = 0, right = nums.length - 1;

  while (left < nums.length && nums[left] === arr[left]) left++;
  while (right > left && nums[right] === arr[right]) right--;

  return right - left + 1;
}
```
时间复杂度 O(nlogn),是由于排序引起的
解析：
这个函数的目标是找出“如果把某一段连续子数组排序后，整个数组都能变成升序”的最短长度。
核心思想是：
 **1. 拷贝原数组并排序**
```javascript
const arr = nums.slice().sort((a, b) => a - b);
```
排序后的数组是数组应该呈现的正确升序状态。
我们只需要比较：
- 哪些位置不一样
- 最左的不一样点
- 最右的不一样点
    即可确定需要排序的范围。
**2. 找左边第一个不一致的位置（left）**
```javascript
while (left < nums.length && nums[left] === arr[left]) left++;
```
如果某个位置排序前后一样，那它肯定是已经在正确位置，无需动。
第一个不相同的位置，就是**需要排序子数组的左边界**。
**3. 找右边第一个不一致的位置（right）**
```javascript
while (right > left && nums[right] === arr[right]) right--;
```
同理，从右向左找第一个不一样的地方，就是**需要排序子数组的右边界**。
**4. 子数组长度就是右 - 左 + 1**
```javascript
return right - left + 1;
```
举例：
原数组：
```
[2, 4, 6, 8, 10, 9, 15]
```
排序后：
```
[2, 4, 6, 8, 9, 10, 15]
```
左边第一个不一样 = index 4 (10 ≠ 9)
右边第一个不一样 = index 5 (9 ≠ 10)
所以长度 ＝ 5 - 4 + 1 = **2**
追问：能不能优化一下时间复杂度，有别的解法么
**当前代码的时间复杂度是多少？**
排序这一行决定了复杂度：
```javascript
nums.slice().sort((a, b) => a - b);
```
排序是 **O(n log n)**，后面两段 while 是 O(n)。
所以总体：
> **时间复杂度：O(n log n)**
> **空间复杂度：O(n)**（因为拷贝了一个数组）

**如何优化到 O(n)**
**👉 核心思路：**
不排序，通过扫描找到“逆序最小值”和“逆序最大值”，再确定边界。
分 3 步完成：
**① 从左往右扫描，找到**逆序中的最小值 minVal
```javascript
let minVal = Infinity;
for (let i = 1; i < nums.length; i++) {
  if (nums[i] < nums[i - 1]) {
    minVal = Math.min(minVal, nums[i]);
  }
}
```
这一步找到所有“下降点”的最小值。
它应该出现在更前面，说明左边界需要往左扩。
**② 从右往左扫描，找到逆序中的最大值 maxVal**
```javascript
let maxVal = -Infinity;
for (let i = nums.length - 2; i >= 0; i--) {
  if (nums[i] > nums[i + 1]) {
    maxVal = Math.max(maxVal, nums[i]);
  }
}
```
它应该往右移动，所以右边界需要扩张
**③ 再次扫描确定 left 和 right** 
**找 left：第一个大于 minVal 的位置**
```javascript
let left = 0;
while (left < nums.length && nums[left] <= minVal) left++;
```
**找 right：第一个小于 maxVal 的位置**
```javascript
let right = nums.length - 1;
while (right >= 0 && nums[right] >= maxVal) right--;
```
**最终 O(n) 优化代码（面试官认可版本）**

```javascript
function findUnsortedSubarray(nums) {
  let n = nums.length;
  let minVal = Infinity, maxVal = -Infinity;

  // 从左到右找逆序最小值
  for (let i = 1; i < n; i++) {
    if (nums[i] < nums[i - 1]) {
      minVal = Math.min(minVal, nums[i]);
    }
  }

  // 从右到左找逆序最大值
  for (let i = n - 2; i >= 0; i--) {
    if (nums[i] > nums[i + 1]) {
      maxVal = Math.max(maxVal, nums[i]);
    }
  }

  // 数组本来就是有序
  if (minVal === Infinity) return 0;

  // 找 left
  let left = 0;
  while (left < n && nums[left] <= minVal) left++;

  // 找 right
  let right = n - 1;
  while (right >= 0 && nums[right] >= maxVal) right--;

  return right - left + 1;
}
```