## 1. 什么是 LRU 缓存
LRU (**Least Recently Used，最近最少使用**) 缓存是一种对缓存的处理机制，即当缓存容量快满的时候，优先淘汰缓存中最久未被访问的键值对
- **最近使用** 的定义：一次 get(key) 或 put(key,…)（更新已有键）都算访问，都会把这个键标记为“最新”。
- **目标**：get/put 都要做到 **O(1)** 平均时间。
## 2. 如何实现 LRU 缓存

### 1. 基于 ES6 语法的 Map 实现

```javascript
class LRUCache {
  constructor(capacity = 10) {
    if (capacity <= 0) throw new Error('capacity must be > 0');
    this.cap = capacity;
    this.map = new Map(); // 保序：最旧在最前、最新在最后
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    // 触发“最近使用”：移到队尾
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, val) {
    if (this.map.has(key)) this.map.delete(key); // 更新也算使用
    this.map.set(key, val);
    if (this.map.size > this.cap) {
      // 淘汰“最久未用” = 头部元素
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}
```
### 2. 基于 哈希表+双向链表 实现

```javascript
class Node {
  constructor(key, val) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}
class DoublyList {
  constructor() {
    this.head = new Node(null, null); // 哨兵
    this.tail = new Node(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  // 在头部插入 node（作为最新）
  unshift(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
  // 移除任意 node
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = node.next = null;
  }
  // 移除尾部真实节点（最旧）
  pop() {
    if (this.tail.prev === this.head) return null;
    const last = this.tail.prev;
    this.remove(last);
    return last;
  }
}

class LRUCache {
  constructor(capacity = 10, { onEvict } = {}) {
    if (capacity <= 0) throw new Error('capacity must be > 0');
    this.cap = capacity;
    this.map = new Map();      // key -> Node
    this.list = new DoublyList();
    this.onEvict = onEvict;    // 可选：淘汰回调
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    // 移到头部（最新）
    this.list.remove(node);
    this.list.unshift(node);
    return node.val;
  }
  put(key, val) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.val = val;
      this.list.remove(node);
      this.list.unshift(node);
      return;
    }
    const node = new Node(key, val);
    this.map.set(key, node);
    this.list.unshift(node);

    if (this.map.size > this.cap) {
      const old = this.list.pop(); // 最旧
      this.map.delete(old.key);
      this.onEvict && this.onEvict(old.key, old.val);
    }
  }
}
```

