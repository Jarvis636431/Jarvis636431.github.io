### **1. Vue 的响应式原理是什么？Vue2 和 Vue3 有什么区别？**

**Vue2：**
- 通过 Object.defineProperty() 劫持对象属性 getter/setter
- 无法监听数组的索引变化、无法监听新增属性（需要 $set）
- 依赖收集 -> 触发更新由 Watcher 完成

**Vue3：**
- 采用 Proxy + Reflect 实现
- 可以监听数组索引、属性新增/删除
- 响应式由 reactive()、ref() 实现
- 整体性能更好、代码更精简
### **2. v-model 的实现原理是什么？**

**原理：语法糖**
- 对于原生 input：
```vue
<input v-model="msg" />
```
- 等价于：
```vue
<input :value="msg" @input="msg = $event.target.value">
``` 
- 对于组件中的 v-model（Vue3）：
    
    v-model 默认会绑定：
    - modelValue（prop）
    - update:modelValue（emit）
### **3. computed 和 watch 的区别是什么？**

|**特性**|**computed**|**watch**|
|---|---|---|
|用途|派生值，依赖不变则缓存|监听特定数据变化并执行副作用|
|是否缓存|✔️ 缓存|❌ 不缓存|
|适用场景|依赖多个数据的计算属性|异步操作、复杂业务逻辑、深度监听|

### **4. 为什么 data 必须是函数（组件中）？**

- 因为组件会复用，多实例共享同一个 data 会导致数据互相污染
- 函数返回新对象，实例之间互不影响
### **5. Vue 的生命周期有哪些？重点是什么？**

**Vue2：**
- 挂载过程：beforeCreate -> created -> beforeMount -> mounted
- 更新过程：beforeUpdate -> updated
- 卸载过程：beforeDestroy -> destroyed
Vue3：

**重点用途：**

- created：可操作 data，但 DOM 未生成
- mounted：可操作 DOM
- beforeDestroy：清理定时器、解绑事件等
### **6. Vue 中有哪些组件通信方式？**

**Vue2：**
1. **父 -> 子：** props
2. **子 -> 父：** $emit
3. **兄弟组件：** EventBus（new Vue()）
4. **跨层级：** provide/inject
5. **全局状态：** Vuex
**Vue3：**
- 同上但 EventBus 不推荐
- 主推 **Pinia** 管理状态
### **7. provide/inject 原理是什么？**

- **祖先组件使用 provide 提供数据**
- **子组件使用 inject 注入数据**
- 不是响应式的（Vue3 可配合 ref 使其响应式）

### **8. 虚拟 DOM 是什么？为什么需要？**

**虚拟 DOM（VNode）：**

- 是一个用 JS 对象描述 DOM 结构的抽象层
- 不是浏览器真正的 DOM
**优点：**
- 减少频繁 DOM 操作
- 跨平台（浏览器、SSR、Native）
- 方便 Diff 优化更新
### **9. Vue 的 Diff 算法是什么？**

Vue2/3 都基于 **双端比较 Diff**（并非 React 的单端 Diff）

策略：
- 头头比、尾尾比、头尾比、尾头比
- 无匹配再用 key 查找
- key 能显著提升 Diff 效率
### **10. hash 模式 vs history 模式的区别？**

|**hash**|**history**|
|---|---|
|URL 有 “#”|无 “#”，更美观|
|不需要服务器配置|**刷新页面必须服务器配合**（rewrite）|
|兼容性更好|SEO 更好|
### **11. Vue Router 守卫有哪些？**

- 全局守卫：beforeEach、afterEach
- 路由独享守卫：beforeEnter
- 组件内守卫：beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave

**常用于：**
- 登录拦截
- 权限验证

### **12. Vuex 的核心概念有哪些？**
- state
- mutations（同步）
- actions（异步）
- getters
- modules

### **13. 为什么 Vuex 要区分 mutations 和 actions？**

- 便于调试：mutations 必须同步
- 性能记录：每次 mutation 都可被 devtools 记录
- 更易追踪状态变化原因

### **1. Pinia 对比 Vuex 的优势？**

- 无需 mutations，只用 actions
- TS 友好
- API 更简洁
- 模块自动拆分，无需 modules
#### **代码层面：**

- 合理使用 v-if / v-show
- 使用 key 优化 Diff
- 拆分组件、按需渲染
- 使用 computed 缓存值
- 避免深层响应式嵌套
#### **打包层面：**

- 路由懒加载
- 组件按需引入
- Tree-Shaking

### **17. Composition API 相比 Options API 的优势是什么？**

- 更好的逻辑组织和复用（可抽离为 hooks）
- TS 友好
- 代码更清晰、可读
### **18. ref 和 reactive 的区别？**

|**特性**|**ref**|**reactive**|
|---|---|---|
|类型|可以包任意值|必须是对象/数组|
|获取值|.value|直接用|
|解构|需要手动|不建议直接解构，会失去响应性|

### **19. 什么是 setup？执行时机是什么？**

- 组件创建前执行（在 beforeCreate 之前）
- 可以访问 props、emit
- 无 this（this 是 undefined）
### **20. 为什么 Vue3 要使用 Fragment？**

- 组件可以有多个根节点
- 减少不必要的 DOM 包裹节点，提高渲染