---
title: "Vite与WebPack"
description: "1.为什么需要打包工具？"
commentId: "blog-前端-前端工程化-vite与webpack"
publishDate: "2025-06-01"
tags: [
  "前端", "工程化", "技术笔记"
]
draft: true
readingTime: 2
---

### **1.为什么需要打包工具？**

- 代码模块化（ESM、CommonJS）→ 浏览器不能直接执行；
- 压缩体积、Tree-shaking；
- 多文件合并（减少请求）；
- 转译新语法（Babel、TS）；
- 编译非 JS 资源（SCSS、Vue、React JSX）。

> 简言之：**打包工具 = 构建 + 优化 + 兼容。**
### **2. Webpack 的核心工作流程是什么？**

读取配置（entry/output/module/plugins）
根据依赖图构建模块树；
递归解析 import/require；
Loader 转换源码（如 Babel、CSS）；
Plugin 注入生命周期钩子；
输出打包文件。
### **3. Webpack Loader 和 Plugin 的区别？**

|**对比项**|**Loader**|**Plugin**|
|---|---|---|
|作用|文件转换器|构建流程扩展|
|操作阶段|模块加载|编译生命周期|
|示例|babel-loader / css-loader|html-webpack-plugin / DefinePlugin|
### **4. 常见性能优化手段（Webpack/Vite）？**

|**类型**|**方法**|
|---|---|
|构建优化|缓存 (cache)、多线程 (thread-loader)、分包(splitChunks)、按需加载|
|代码优化|Tree-shaking、Scope Hoisting、压缩（Terser、ESBuild）|
|开发优化|HMR、SourceMap 控制|
|产物优化|CDN、懒加载、图片压缩、字体子集化|
### **5. Tree-Shaking 是什么原理？**

在 ES Module 静态分析阶段删除未引用的导出：

- 只对 import/export 生效；
- 依赖编译时可确定引用；
- 运行时副作用（如立即执行函数）不能安全删除；
- Webpack 需开启 "sideEffects": false。
### **7.Webpack 与 Vite 的区别？**

|**对比项**|**Webpack**|**Vite**|
|---|---|---|
|构建原理|先打包再启动|依赖预构建 + 原生 ESM|
|开发性能|启动慢|秒启动|
|HMR 更新|全量模块替换|按需模块替换|
|生产打包|使用 Webpack/Rollup|使用 Rollup|
|底层|JS 打包器|ESBuild + Rollup|
|特点|工程成熟、生态广|开发体验极快|

### **7. ESBuild 为什么快？**

- 使用 Go 编写（比 JS 编译快几十倍）；
- 单线程高效内存管理；
- 直接操作 AST；
- 并行 I/O；
- 高效的 bundle cache。
### **8. Rollup 与 Webpack 区别？**

Rollup 更适合 **库打包（tree-shaking 精细）**；
Webpack 更适合 **应用构建（复杂依赖、动态加载）**。

### **9. Vite 的原理（开发模式）**

- 利用浏览器原生 ESM：按需请求模块；
- 预构建第三方依赖（esbuild 转换 CJS → ESM）；
- 通过 HMR 精准更新；
- 生产模式调用 Rollup 打包

### **10.HMR（热更新）原理？**
- webpack-dev-server 启动 WebSocket 连接；
- 检测文件变化 → 增量编译；
- 浏览器接收到变更模块 hash；
- 替换旧模块 + 触发重新渲染。

