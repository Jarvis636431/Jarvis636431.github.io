
## **1.** **手写useState**

```javascript
function myUseState(initialValue) {
  let _val = initialValue;

  function setState(newVal) {
    _val = newVal;
  }

  function getState() {
    return _val;
  }

  return [getState, setState];
}
```

或简化版（强调闭包思想）：

```
function myUseState(initial) {
  let state = initial;
  const setState = newVal => {
    state = typeof newVal === 'function' ? newVal(state) : newVal;
  };
  return [() => state, setState];
}
```

## **2.** 

## **手写一个 useEffect（考察依赖比较 + 回调触发）**

```
let prevDepsArray = [];

function myUseEffect(callback, depsArray) {
  const hasChanged = depsArray.some((dep, i) => dep !== prevDepsArray[i]);

  if (hasChanged) {
    callback();
    prevDepsArray = depsArray;
  }
}
```

## **3.** 

## **手写一个 useMemo（依赖比较）**

```
let prevDeps = null;
let prevValue = null;

function myUseMemo(fn, deps) {
  if (!prevDeps || deps.some((d, i) => d !== prevDeps[i])) {
    prevValue = fn();
    prevDeps = deps;
  }
  return prevValue;
}
```

## **4.** 

## **手写一个事件总线（React 中常考）**

```
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    (this.events[event] || (this.events[event] = [])).push(handler);
  }

  emit(event, data) {
    (this.events[event] || []).forEach(fn => fn(data));
  }

  off(event, handler) {
    this.events[event] = (this.events[event] || []).filter(fn => fn !== handler);
  }
}
```

## **5.** 

## **手写一个虚拟 DOM diff（迷你版）**

不会要你真的写 fiber，只要能写个深度比较就够了：

```
function diff(oldNode, newNode) {
  const patches = [];

  if (!newNode) {
    patches.push({ type: 'REMOVE', oldNode });
  } else if (typeof oldNode !== typeof newNode) {
    patches.push({ type: 'REPLACE', newNode });
  } else if (typeof oldNode === 'string' && oldNode !== newNode) {
    patches.push({ type: 'TEXT', newNode });
  } else {
    const maxLen = Math.max(
      oldNode.children.length,
      newNode.children.length
    );

    for (let i = 0; i < maxLen; i++) {
      patches.push(diff(oldNode.children[i], newNode.children[i]));
    }
  }

  return patches;
}
```

## **6.** 

## **手写一个高阶组件 HOC**

```
function withLogger(Component) {
  return function Wrapper(props) {
    console.log("Props:", props);
    return <Component {...props} />;
  };
}
```

## **7.** 

## **手写一个简单版 Redux（常考）**

```
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(fn => fn());
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  return { getState, dispatch, subscribe };
}
```

## **8.** 

## **手写实现一个 useReducer**

```
function myUseReducer(reducer, initialState) {
  let state = initialState;

  function dispatch(action) {
    state = reducer(state, action);
  }

  return [() => state, dispatch];
}
```

## **9.** 

## **手写一个 debounce（React 中防抖经常考）**

```
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

## **10.** 

## **手写一个 throttle（节流）**

```
function throttle(fn, delay) {
  let last = 0;

  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      fn.apply(this, args);
      last = now;
    }
  };
}
```
