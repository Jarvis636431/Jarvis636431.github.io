---
title: "百度——Web 网盘部门"
description: "1.有做过 electron 么"
commentId: "blog-百度-web-网盘部门"
publishDate: "2025-06-01"
tags: [
  "面经"
]
draft: true
readingTime: 5
---

# 一面——12.08
### 八股盛宴
1.有做过 electron 么
2.接触过 node 相关的开发么，知道哪些框架，具体应用的有哪些
3.谈谈 express 和 koa 的区别
4.讲讲你对前端工程化的认识
5.浏览器从输入 url 到页面渲染的全流程，结合项目来具体讲
6.TCP 三次握手，为什么要进行三次
7.讲讲浏览器的同源策略 
8.实现水平居中有几种方法
9.如何解决跨域问题，除了 CORS，还有什么方法
10.配置 CORS 的是请求头还是响应头
11.讲讲浏览器的事件循环机制
12.微任务宏任务都有哪些，Promise 对象是微任务么
13.setTimeout 和 setInterval 的区别
14.如果要实现一个倒计时逻辑，应该使用 setTimeout 还是 setInterval
15.为什么这么选，不用 setInterval 能不能实现，setInterval 为什么更好
16.讲讲重排和重绘，什么会触发重排，什么会触发重绘
17.v-if 和 v-show 会触发重排和重绘么
18.具体什么事件才会影响布局
19.v-show 在什么时候不会影响布局
20.讲讲 ES6 的新语法
21.const 定义的什么是可以改变的
22.箭头函数的特点
23.Promise 有哪些常用的方法
24.什么时候会选用 Promise.race
25.你刚刚讲到了 cdn，cdn 在使用的时候会遇到哪些问题
26.怎么解决 cdn 的缓存问题
27.cdn 上的资源加载失败要怎么解决，
28.你刚刚讲配置多个 cdn 链接是一个方法，那如果 cdn失败了，他是被编译到项目中的，我该怎么快速去切换到别的 cdn 链接，细分线上项目的 bug
### 手撕代码
#### 1.JS 实现二分查找

```javascript
/**
 * 二分查找（迭代版）
 * @param {number[]} arr   已排序的升序数组
 * @param {number} target  待查找的目标值
 * @returns {number}       找到返回对应索引，未找到返回 -1
 */
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;   // 闭区间 [left, right]

  while (left <= right) {
    // 等价于 Math.floor((left + right) / 2)，但能防止大数溢出
    const mid = left + ((right - left) >> 1);

    if (arr[mid] === target) {
      return mid;               // 命中，直接返回
    } else if (arr[mid] < target) {
      left = mid + 1;           // 去右半边
    } else {
      right = mid - 1;          // 去左半边
    }
  }

  return -1;                    // 未找到
}

/* ===== 简单测试 ===== */
const a = [1, 3, 4, 7, 9, 15, 21];
console.log(binarySearch(a, 7));  // 3
console.log(binarySearch(a, 6));  // -1

```

#### 2.JS 实现全排列
1. 借助 ES6 的新语法

```javascript
const perm = arr => arr.length ? arr.flatMap((v, i) =>
  perm(arr.filter((_, j) => j !== i)).map(s => [v, ...s])
) : [[]];

```

追问：为什么使用 flatMap，原理是什么，...s是什么意思，为什么要 filter

2. 标准写法

```javascript
function permute(nums) {
  const res = [];
  const used = Array(nums.length).fill(false);

  function backtrack(path) {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      path.push(nums[i]);

      backtrack(path);

      path.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return res;
}

```

# 二面——12.11
项目：
这些项目都是你独立做的么，有没有合作开发的经验，选一个最近做的项目讲一讲，难点是什么，最有成就感的地方是什么，怎么解决的
你刚刚提到了首屏加载时间优化了 40%，你是怎么衡量这个数值的，具体使用了什么方法来优化它
你刚刚提到了webworker 这么一个方案，那你来说说 webworker 和 requestIdleCallback 的区别，什么场景下使用 webworker，什么场景下使用 requestIdleCallBack
你刚刚提到了虚拟列表的优化手段，原理是什么
现在假设有这么一个列表，分页请求，每页 50 条，使用虚拟列表优化前和优化后分别是什么状态
图片的懒加载原理是什么呢
你刚刚讲到是等到图片出现在视窗中时再来填充 src，那这个 src 在填充之前，这个图片的 url 资源是存在哪的呢
八股：
聊聊 ts，假设前人定义了一个 interface，里面有 abc 三个参数，假设我需要再去使用 ab，我发现前人的定义，我该怎么去使用它呢
使用接口集成 extends ，辅助 Pick 方法
追问：你说的方法中，核心是什么
那假如说前人定义的是 a-z，我需要的是 a-x，我还是要一个一个 Pick 么，有没有别的办法
使用 Omit 方法来去除不需要的键
Omit 和 Pick 的区别是什么
协作相关：
假设给你了一个需求，你会怎么规划他的排期
如果你的实际时间超出了预估时间，该怎么做
git 场景题：
假设有一个 master 分支，是已经上线的 1.0版本，现在你签出了一个新的分支用来开发新的 feature，现在发现有线上的 bug 需要你来修改，描述一下你的整个流程，使用了哪些 git 命令，假设中间有别的同事又上线了新的功能，你又该怎么做
你刚刚讲到先commit 一下 2.0 的 feature，修完 bug 后再回来继续写，那这样这一次 feature 就会有两次提交，如果规范中规定一个 feature 只能有一次提交，该怎么做，使用什么命令
flex 场景题：
假设我有一个 div 父元素，内部有两个 span，我希望两个 span 水平垂直居中纵向排列，怎么用 flex实现
假设不需要水平，只要垂直居中，怎么办，假设不需要垂直，只要水平居中，不纵向排列，又该怎么办
### 手撕
使用 Promise 实现一个 sleep 函数，接受一个时间参数，单位是毫秒
通过闭包实现一个累加的计数器，避免使用全局变量
实现 Promise.all，Promise.race，逐行讲解
### 反问
Node后端和 Electron 相关的内容会有培训么
技术栈 Vue2/Vue3
AI IDE 相关的内容
多久会有一个反馈呢

# 三面 leader 面试
谈谈对于架构的认识
对于 AI 辅助编程的看法
codereview 的边界条件

