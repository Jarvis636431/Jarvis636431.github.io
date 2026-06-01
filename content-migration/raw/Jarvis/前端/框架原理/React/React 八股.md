
## **1.** **React 的核心思想是什么？**


**考点：声明式、组件化、单向数据流、虚拟 DOM**
- 声明式 UI：状态驱动视图，关注“想要什么”，不关注“怎么操作 DOM”。
- 组件化：UI + 状态 + 行为组合成组件，可复用可维护。
- 单向数据流：state → view，数据自上而下传递。
- 虚拟 DOM：用 JS 对象描述 UI，通过 diff 算法实现高效更新。
## **2.** **React 中 state 和 props 的区别？**

- **props**：父传子，不可修改，组件配置。
- **state**：组件内部状态，可通过 setState/useState 修改。
- props 决定组件的“外在形态”，state 决定组件的“内部逻辑”。

## **3.** **React 组件更新流程（Reconciliation）是什么？**

- 状态或 props 改变 → 触发 render → 生成新虚拟 DOM → diff → 找出最小改动 → fiber调度 → 更新真实 DOM。
你可以提「fiber 架构」：可中断、时间切片、优先级调度。
## **4.** **为什么要用 key？不用会怎样？**

- key 用来标识列表项，帮助 React 快速判断元素是否变动。
- **不写 key** 或 **使用 index 作为 key** 可能导致：
    - 状态错乱
    - 不必要的重渲染
    - DOM 操作错误（动画、输入框等）
什么时候可以用key
## **5.** **React Hooks 为什么不能在条件语句中调用？**

因为 React 依赖 **Hook 的调用顺序保持一致** 来匹配 state。
- 如果在 if/loop 里调用，顺序会错，状态会错位。
（讲一下 “Hook 本质是一个链表，依赖顺序”：加分）
## **6.** **useEffect 和 useLayoutEffect 的区别？**

|**Hook**|**执行时机**|
|---|---|
|**useEffect**|浏览器绘制完之后执行（异步）|
|**useLayoutEffect**|DOM 更新后、浏览器绘制前执行（同步）|

**什么时候用 useLayoutEffect？**
- 需要读取 DOM 并同步测量布局，如获取宽高、滚动位置。

## **7.** 

## **为什么需要 useCallback/useMemo？它们真的能提升性能吗？**

- 避免子组件不必要的重新渲染
    
- 避免闭包重复创建导致性能问题
  

真正加分回答是：

> “useCallback/useMemo 不是为了优化性能，是为了避免性能变差。”

## **8.** 

## **React 性能优化方式有哪些？**

- useMemo/useCallback
    
- React.memo
    
- 懒加载（React.lazy）
    
- 虚拟列表
    
- 避免在 render 中创建对象
    
- 分片更新（useTransition）
    
- key 使用合理
    

---

## **9.** 

## **受控组件 vs 非受控组件？**

- **受控组件**：input value 由 state 控制（React 控制 DOM）
    
- **非受控组件**：通过 ref 直接访问 DOM
    

  

面试官爱问：

> 表单为什么大部分用受控组件？

  

答：

- 可以验证、拦截、格式化，逻辑集中在 React。
    

## **10.** 

## **React 的 diff 算法主要优化点是什么？**

- 只比较同一层级的节点（不跨层级）
    
- 通过 key 快速识别子节点变化
    
- 类型不同 → 直接卸载重建
    

---

## **11.** **为什么 setState 是异步的？（class）**

- React 会合并多次 setState，批处理更新，提高性能。  

Hooks 部分：

- useState 在事件中是异步批处理，但在 Promise 或 setTimeout 中是同步的（取决于 React 版本和批处理策略）。

## **12.** **React Fiber 是什么？为什么要有 Fiber？**


简答版：

- Fiber 是 React 重写的调度机制，使渲染可被 **中断、恢复、分片**。
    
- 可以根据优先级处理更新，避免大任务卡死 UI。

高分补充：

> 时间切片（Time Slicing）、并发特性（Concurrent Mode）
## **13.** 

## **Redux 的数据流过程？（超级常问）**

- dispatch(action)
    
- reducer 根据 action 更新 state
    
- store 保存新的 state
    
- subscribe 通知 UI 更新

考点：

- Redux 是单向数据流
    
- reducer 必须是纯函数

## **14.** **React Router 的原理（history/Hash）？**

- **Hash 路由**：依赖  # ，通过 onhashchange 监听
    
- **History 路由**：pushState/replaceState + popstate 事件
加分：

SPA 如何配合后端避免 404：

- 配置后端 fallback 到 index.html