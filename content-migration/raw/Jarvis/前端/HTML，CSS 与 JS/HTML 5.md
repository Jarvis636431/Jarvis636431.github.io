## **1. 什么是 HTML5？相比 HTML4 有哪些改进？**

**回答要点：**

- 新标准，与设备无关（跨平台、跨终端）
- 增加大量 **语义化标签**（header / nav / article…）
- 新增 **音视频**（audio / video）
- 新增 **本地存储**（localStorage、sessionStorage）
- 新增 **WebSocket**
- 新增 **Canvas、SVG**
- 新增 **表单增强**（number、email、range 等）
- 新增 **离线缓存**（manifest → 废弃，但考点仍有）

## **2. HTML5 新增的语义化标签**

**标签**：

header / nav / section / article / aside / footer / main / figure / figcaption / time …

**作用：**
- 提升可读性
- 有利 SEO
- 有利无障碍阅读（screen reader）
- 结构更清晰

## **3. 视频和音频如何在 HTML5 中使用？（audio vs video）**

```html
<video src="xx.mp4" controls autoplay muted></video>
<audio src="xx.mp3" controls></audio>
```

常见属性：

- controls
- autoplay（必须 muted 才能在移动端自动播放）
- loop
- poster（video 封面）
## **4. localStorage、sessionStorage 与 cookie 区别？**

|**特性**|**localStorage**|**sessionStorage**|**cookie**|
|---|---|---|---|
|过期时间|永不过期|闭标签即失效|可设置，默认关闭即失效|
|大小|~5MB|~5MB|~4KB|
|自动随 HTTP 发送|❌|❌|✔|
|用途|持久缓存|临时缓存|登录状态、跨域追踪|
## **5. HTML5 的离线缓存怎么实现？(缓存 manifest，虽然废弃但会考)**


**核心：**

- 用 manifest.appcache 声明
- service worker 是现代方案（PWA）
(manifest 已被废弃，面试要主动指出)
## **6. HTML5 的表单新增了哪些类型？有什么好处？** 

常见类型：
- email
- url
- number
- range
- date
- color
- search
- tel  

**好处：**

- 自动校验
- 更一致的 UI
- 移动端自动匹配软键盘类型
## **7. 什么是 Web Storage？优点是什么？**

Web Storage = localStorage + sessionStorage。
**优点：**
1. 很大（5MB）
2. API 简单（setItem/getItem）
3. 不随请求传输
4. 持久化便捷
## **8. HTML5 中如何使用 Canvas？Canvas 和 SVG 的区别？**

### **Canvas**
```javascript
const c = document.querySelector('canvas');
const ctx = c.getContext('2d');
ctx.fillStyle = "red";
ctx.fillRect(10, 10, 100, 100);
```
### **Canvas vs SVG**

|**Canvas**|**SVG**|
|---|---|
|基于**像素**|基于**矢量图形**|
|更适合游戏、动画|更适合图表|
|不可无限缩放（模糊）|放大不失真|
|不可直接响应 DOM 事件|SVG 元素天然 DOM，可点击|

## **10. HTML5 如何做移动端适配？meta viewport 的作用？**

常见写法：

```
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**作用：**

- 使用设备宽度作为 CSS 视口宽度
    
- 禁止缩放，提高交互体验
    

---

## **11. defer 和 async 的区别？
是 script 标签的两个异步加载的属性

|**属性**|**加载**|**执行**|
|---|---|---|
|async|异步加载|加载完立即执行（可能打断 HTML 解析）|
|defer|异步加载|HTML 解析完后执行（按顺序）|

结论：
**推荐用 defer**

## **12. 什么是 DOMContentLoaded？什么是 load？**

- DOMContentLoaded：DOM 解析完（不等图片）
    
- load：页面所有资源加载完（图片、css、iframe）
## **13. script 放在 body 末尾的原因？**

- 避免阻塞 HTML 解析
- 提升首屏渲染速度
## **14. 什么是 Web Worker？**

- 开启子线程执行 JS，不阻塞主线程
- 不能操作 DOM
- 常用于复杂计算、加密、大数据处理
## **15. HTML5 如何实现拖拽（Drag & Drop）？**
 
关键事件
- dragstart
- dragover
- drop
  
核心：
```
<div draggable="true"></div>
```
## **16. 什么是语义化 DOM？为什么重要？**

- 便于 SEO
- 便于屏幕阅读器识别
- 结构清晰
- 利于团队协作
## **17. HTML5 的 File API 是什么？能做什么？**

可以操作本地文件：

- 获取文件列表
- 读取文件内容（FileReader）
- 预览图像
- 大文件分片上传
## **18. HTML5 的 History API 有什么作用？（单页 SPA 必考）**

pushState, replaceState, popstate
作用：

- 无刷新改变 URL
- 单页应用路由核心（VueRouter/ReactRouter）
## **19. 如何实现图片懒加载？（面试必考）**

方案：
### **1）原生** 
### **loading="lazy"**

```html
<img src="xx" loading="lazy">
```
### **2）IntersectionObserver**
用于监听元素是否进入视口。

## **20. HTML5 SVG 常见使用场景？**

- 图表（ECharts、D3）
- icon
- 地图
- 动画