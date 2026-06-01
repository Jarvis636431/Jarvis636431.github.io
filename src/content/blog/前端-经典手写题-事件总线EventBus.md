---
title: "事件总线(EventBus)"
description: "// 模拟的原生模块"
commentId: "blog-前端-经典手写题-事件总线eventbus"
publishDate: "2025-06-01"
tags: [
  "前端", "手写题", "技术笔记"
]
draft: true
readingTime: 1
---

```

// 模拟的原生模块
const NativeModules = {
  FileReader: {
    readFile: (path, callback) => {
      // 模拟异步读取文件
      setTimeout(() => {
        // 假设文件内容总是"Hello, Bridge!"
        callback(null, `Hello, Bridge! from ${path}`);
      }, 100);
    }
  }
};

// 一个包装函数，用于将回调风格的API转换为Promise风格
function requireNativeModule(moduleName) {
  const module = NativeModules[moduleName];
  return {
    readFile: (path) => {
      return new Promise((resolve, reject) => {
        module.readFile(path, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    }
  };
}

// 使用 requireNativeModule 获取 FileReader 模块
const FileReader = requireNativeModule("FileReader");

// 调用 readFile 并输出结果
FileReader.readFile('/test.txt')
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });

```
