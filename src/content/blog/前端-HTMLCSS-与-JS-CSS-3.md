---
title: "CSS 3"
description: "1. CSS 选择器的优先级（权重）是如何计算的？"
commentId: "blog-前端-htmlcss-与-js-css-3"
publishDate: "2025-06-01"
tags: [
  "HTML/CSS/JS", "前端", "技术笔记"
]
draft: true
readingTime: 3
---

## 一、选择器与权重

## **1. CSS 选择器的优先级（权重）是如何计算的？**

权重从高到低：

1. !important
2. 内联样式（如 style=””）
3. ID 选择器（#id）
4. 类选择器 / 属性选择器 / 伪类（.class、[type=“text”]、:hover）
5. 标签选择器（div）
6. 通配符（*）
7. 继承的样式

**具体数值：**

```

!important > 1000 > 100 > 10 > 1

```

## 2. 伪类和伪元素

### **伪类 pseudo-class（:hover、:active 等）**
描述**状态**
### **伪元素 pseudo-element（::before、::after 等）**
创建虚拟元素加入 DOM

写法建议：
- 伪类：:hover
- 伪元素：::before
## 二、盒模型（Box Model）
## **3. 什么是 CSS 盒模型？**
标准盒模型和怪异盒模型，标准盒模型宽度仅包含 content，怪异盒模型宽度包含 content， padding 和 border

包含：
- content
- padding
- border
- margin
## **追问：如何切换盒模型？**

```

box-sizing: content-box; /* 默认 */
box-sizing: border-box; /* 推荐 */

```

border-box 更稳定，宽度包含 padding + border。
## 三、BFC（面试必考）
## **4. 什么是 BFC？有什么作用？**

### **定义：BFC（Block Formatting Context）是独立的布局环境。

### **触发方式：**
- overflow:hidden/auto/scroll
- float
- display: inline-block
- display: flow-root
- position: absolute/fixed
- flex/grid 容器
### **作用：**
1. **清除浮动**
2. **阻止 margin 合并（塌陷）**
3. **防止文字环绕浮动元素**
4. **使两个块级元素左右布局**
## 四、定位（Position）

## **5. position 的几种取值？区别是什么？**

- static: 默认
- relative: 相对自身
- absolute: 相对最近的非 static 祖先
- fixed: 相对视口
- sticky: 吸顶，滚动到一定位置变 fixed

## 五、Flex 布局
## **6. Flex 中常用属性有哪些？**
父容器：
- display: flex;
- flex-direction
- justify-content
- align-items
- align-content
- flex-wrap
子元素：
- flex: 1
- flex-grow
- flex-shrink
- flex-basis
- align-self 
### **面试高频：**

### **flex: 1 等价于什么？**

```css
.flex: 1 1 0
.flex-grow: 1;
.flex-shrink: 1;
.flex-basis: 0;

```

## 六、Grid（新趋势，高级岗位常问）
## **7. Grid 和 Flex 有啥区别？**
| |**Flex**|**Grid**|
|---|---|---|
|轴|一维布局|二维布局|
|布局能力|行或列|行和列|
|复杂度|简单|更复杂更强大|

> Grid 是二维布局，Flex 是一维布局。

# 七、常见布局问题

## **8. 如何实现左边固定 + 右边自适应布局？**

三种经典写法：  
### **1. Flex**

```css
.container { display: flex; }
.left { width: 200px; }
.right { flex: 1; }

```

### **2. Grid**

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}

```

### **3. float + margin-left**
传统方式，略老。
## **9. 如何让一个元素水平垂直居中？**
### **方法 1：flex**

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

```

### **方法 2：position + transform**

```css
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

```

### **3. Grid**

```css
.parent {
  display: grid;
  place-items: center;
}

```

## 九、动画 / 过渡

## **10. transition 和 animation 的区别？**

|**transition**|**animation**|
|---|---|
|需要触发|不需要触发|
|只能开始 → 结束|可无限循环|
|写法简单|可组合多个 keyframe|

## 十、层叠上下文（Stacking Context）

## **11. 哪些属性能触发层叠上下文？**

- position: relative/absolute + z-index
- opacity < 1
- transform
- filter
- mix-blend-mode
- isolation: isolate
- will-change
## 十一、响应式

## **12. 媒体查询怎么写？**

```css
@media (max-width: 768px) {
  .container { display: none; }
}

```

## 十二、margin 合并（塌陷）是什么？如何解决？
### **现象：**

上下两个 margin 会合并成一个。
### **解决：**

- 触发 BFC（比如 overflow: hidden）
- 父容器加 padding-top
- 父容器加 border-top
## 十三、隐藏元素的方式

|**方法**|**特点**|
|---|---|
|display: none|不占空间，事件失效|
|visibility: hidden|占空间但不可见|
|opacity: 0|占空间，可点击（注意）|
|clip-path: inset(0 0 0 0)|高级手段|
|height: 0 + overflow: hidden|可动画|
## 十四、CSS 优化

## **14. 如何优化 CSS 性能？**

- 合理使用组合选择器，避免过深层级
- 减少重排与重绘
- CSS 放头部，JS 放尾部（或 defer）
- 使用 will-change 进行 GPU 加速
- 避免使用 * 选择器

## 十五、如何实现 1px 边框

### **方法 1：利用 transform**

```css
.border {
  border: 1px solid #000;
  transform: scale(0.5);
}

```

### **方法 2：伪元素 + 0.5px**

```css
::after {
  border-bottom: 0.5px solid #000;
}

```

### **方法 3：使用 devicePixelRatio 判断 DPR**

