# useList

分页列表查询的 Composable，提供分页、查询、刷新等功能。

## 介绍

`useList` 用于管理分页列表数据，自动处理分页参数、查询条件变更、请求中断等场景。

## 参数

```typescript
type UseListProps<Item, Query> = {
  fetchFn: (context: ListFetchFnContext<Query>) => Promise<PaginationData<Item>>
  query?: MaybeRefOrGetter<Query>
  pageSize?: MaybeRefOrGetter<number>
  enabled?: MaybeRefOrGetter<boolean>
}
```

| 参数     | 类型                        | 必填 | 默认值 | 说明             |
| -------- | --------------------------- | ---- | ------ | ---------------- |
| fetchFn  | `Function`                  | 是   | -      | 数据获取函数     |
| query    | `MaybeRefOrGetter<Query>`   | 否   | `{}`   | 查询条件         |
| pageSize | `MaybeRefOrGetter<number>`  | 否   | `20`   | 每页条数         |
| enabled  | `MaybeRefOrGetter<boolean>` | 否   | `true` | 是否启用自动请求 |

### fetchFn 参数

```typescript
{
  params: {
    pager: {
      current: number // 当前页码，从 0 开始
      pageSize: number // 每页条数
    }
    query: Query // 查询条件
  }
  config: AxiosRequestConfig // 请求配置，包含 signal
}
```

### fetchFn 返回值

```typescript
{
  items: Item[]  // 数据列表
  total: number  // 总条数
}
```

## 返回值

| 属性      | 类型                  | 说明         |
| --------- | --------------------- | ------------ |
| data      | `Ref<Item[]>`         | 列表数据     |
| total     | `Ref<number>`         | 总条数       |
| current   | `Ref<number>`         | 当前页码     |
| pageSize  | `Ref<number>`         | 每页条数     |
| isPending | `Ref<boolean>`        | 加载状态     |
| isEmpty   | `Ref<boolean>`        | 是否为空     |
| error     | `Ref<Error \| null>`  | 错误信息     |
| refresh   | `() => Promise<void>` | 刷新当前页   |
| reset     | `() => Promise<void>` | 重置到第一页 |
| provide   | `(key?) => void`      | 提供给子组件 |

## 使用示例

### 基础列表

```vue
<script setup>
import { useList } from '@vue-biz/core'

const list = useList({
  fetchFn: async ({ params, config }) => {
    const res = await axios.get('/users', {
      params,
      signal: config.signal,
    })
    return {
      items: res.data.list,
      total: res.data.total,
    }
  },
})
</script>

<template>
  <div v-if="list.isPending.value">加载中...</div>
  <div v-else-if="list.isEmpty.value">暂无数据</div>
  <div v-else>
    <div v-for="item in list.data.value" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

### 带查询条件

```vue
<script setup>
import { ref } from 'vue'
import { useList } from '@vue-biz/core'

const keyword = ref('')

const list = useList({
  query: () => ({ keyword: keyword.value }),
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})
</script>

<template>
  <input v-model="keyword" placeholder="搜索" />
  <div v-for="item in list.data.value" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### 分页

```vue
<script setup>
import { useList } from '@vue-biz/core'

const list = useList({
  pageSize: 10,
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})

function handlePageChange(page) {
  list.current.value = page
}
</script>

<template>
  <div v-for="item in list.data.value" :key="item.id">
    {{ item.name }}
  </div>
  <pagination
    :current="list.current.value"
    :total="list.total.value"
    :page-size="list.pageSize.value"
    @change="handlePageChange"
  />
</template>
```

### 依赖注入

```vue
<!-- Parent.vue -->
<script setup>
import { useList } from '@vue-biz/core'

const list = useList({
  /* ... */
})
list.provide() // 提供给子组件
</script>

<!-- Child.vue -->
<script setup>
import { useInjectedList } from '@vue-biz/core'

const list = useInjectedList()
</script>
```

## 特性说明

### 自动重置

当 `query` 或 `pageSize` 变更时，自动重置到第一页并重新请求。

### 请求中断

切换页面或条件变更时，自动中断上一个请求，避免竞态问题。

### 条件启用

通过 `enabled` 参数控制是否自动请求：

```vue
<script setup>
const enabled = ref(false)

const list = useList({
  enabled,
  fetchFn: async () => {
    /* ... */
  },
})

// 手动启用
enabled.value = true
</script>
```
