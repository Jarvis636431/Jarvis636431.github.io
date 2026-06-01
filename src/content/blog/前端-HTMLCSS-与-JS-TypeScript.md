---
title: "TypeScript"
description: "1. TS 和 JS 的区别是什么？为什么公司喜欢用 TS？"
commentId: "blog-前端-htmlcss-与-js-typescript"
publishDate: "2025-06-01"
tags: [
  "HTML/CSS/JS", "前端", "技术笔记"
]
draft: true
readingTime: 3
---


## 一、基础与类型系统

## **1. TS 和 JS 的区别是什么？为什么公司喜欢用 TS？**
**TS = JS + 类型系统。**
TS 可以带来：

1. **更好的编码提示（IDE 完成度高）**
2. **减少运行时错误**
3. **更强的可维护性（特别是大型项目）**
4. **规范团队代码风格**
5. **更容易重构**

## **2. 常见的基本类型有哪些？**

- string
- number
- boolean
- null
- undefined
- symbol
- bigint
- void
- never
- any
- unknown

面试常问：**unknown 和 any 的区别？**

|**类型**|**特点**|
|---|---|
|any|关闭类型检查，允许所有操作|
|unknown|更安全，不能随便操作，需类型缩窄|

## **3. interface 和 type 的区别？**

### **相同点：**

- 都能定义对象结构
- 都可扩展
### **区别：**

|**特性**|**interface**|**type**|
|---|---|---|
|扩展|可 extends|可交叉类型 & 合并|
|声明合并|✔支持|❌不支持|
|能否定义 union|❌不能|✔能|
|能否定义基本类型别名|❌不能|✔能|

> interface 用于“结构”，type 用于“类型表达式”。

## **4. 什么是类型断言？**

### **写法：**

```

const a = someValue as string;
const b = <string>someValue; // JSX 不推荐

```

作用：告诉编译器你“确定”变量是什么类型。
## **5. 什么是类型守卫（Type Guard）？**

让 TS 在条件内自动缩窄类型。

常用方式：
- typeof
- instanceof
- in
- 自定义类型守卫（面试高频）：

```

function isString(x: unknown): x is string {
  return typeof x === "string";
}

```

## 二、泛型（Generics）

## **6. 什么是泛型？为什么要用？**

泛型让类型“参数化”，提高复用性。
例子：

```

function identity<T>(value: T): T {
  return value;
}

```

好处：

- 可复用
- 类型安全
- 能用于复杂数据结构（List、Tree、Map）
## **7. 泛型约束怎么写？**

```

function getLen<T extends { length: number }>(arg: T) {
  return arg.length;
}

```

## **8. TS 中泛型工具类型有哪些？**

  

### **内置工具类型（面试常考）**

- Partial<T>
    
- Required<T>
    
- Readonly<T>
    
- Record<K, T>
    
- Pick<T, K>
    
- Omit<T, K>
    
- ReturnType<T>
    
- Parameters<T>
    
- InstanceType<T>
    

  

面试必问点：

**问 Pick 和 Omit 的区别？**

---

## 三、进阶类型系统

  

## **9. 什么是联合类型（Union）和交叉类型（Intersection）？**

  

### **联合类型（OR）**

```

type A = string | number;

```

### **交叉类型（AND）**

```

type B = { name: string } & { age: number };

```

---

## **10. never 类型是什么？什么时候会出现？**

  

表示**永远不会有值**。

  

出现场景：

- 抛异常函数
    
- 死循环
    
- 类型缩窄到不可能的状态（常考）
    

---

## **11. 可选链操作符 ?. 是什么？**

```

user?.address?.city

```

避免访问 undefined 的属性报错。

---

## **12. keyof 是什么？**

  

取对象 key 的联合类型：

```

type A = keyof {name: string; age: number}; // "name" | "age"

```

---

## **13. 索引访问类型是什么？**

```

type T = Person["name"];

```

用于读取类型的某个 key。

---

## **14. 条件类型是什么？（重点）**

```

type IsString<T> = T extends string ? true : false;

```

条件类型 + 泛型是 TS 的核心能力。

---

## **15. 分布式条件类型（Distributive Condition）是什么？**

  

联合类型会在条件类型中被拆开处理：

```

type T = (string | number) extends string ? 1 : 2
// 实际为： (string -> 1) | (number -> 2)

```

---

## 四、TS 工程化与实践

  

## **16. tsconfig.json 常用的配置有哪些？**

  

常考：

- strict
    
- target
    
- module
    
- baseUrl
    
- paths
    
- noImplicitAny
    
- esModuleInterop
    

---

## **17. 什么是声明文件（.d.ts）？什么时候用？**

  

### **答：**

  

声明 JS 库的类型，让 TS 可以正确推导类型。

  

如：

```

declare module "lodash";

```

---

## **18. 什么是 structural typing（结构类型系统）？**

  

TS 判断兼容性靠**结构**，而不是名字。

  

例如：

```

type A = {x: number};
type B = {x: number};

let a: A = {x: 1};
let b: B = a; // ✔ 可以

```

---

## **19. TS 是如何做到类型擦除的？**

  

编译后会移除所有类型信息，只剩 JS。

  

这是 TS 的特点：**只在开发期提供类型检查，不影响运行时。**

---

## **20. any 与 unknown 与 never 的区别？**

|**类型**|**含义**|**是否安全**|
|---|---|---|
|any|关闭类型检查|❌ 最不安全|
|unknown|需要缩窄才可用|✔ 安全|
|never|永不存在的值|✔ 很安全|

