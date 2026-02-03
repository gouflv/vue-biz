# usePaginationProps

将 `useList` 返回值转换为 TDesign Pagination 组件的 props。

## 介绍

`usePaginationProps` 用于单独使用分页组件时，将 @vue-biz/core 的 `useList` 转换为 TDesign Pagination props。

## 参数

```typescript
function usePaginationProps(list: UseListReturn, props?: Partial<PaginationProps>)
```

| 参数  | 类型                       | 说明           |
| ----- | -------------------------- | -------------- |
| list  | `UseListReturn`            | useList 返回值 |
| props | `Partial<PaginationProps>` | 额外的分页配置 |

## 返回值

| 类型                           | 说明                  |
| ------------------------------ | --------------------- |
| `ComputedRef<PaginationProps>` | Pagination 组件 props |

## 使用示例

### 基础使用

```vue
<template>
  <t-pagination v-bind="paginationProps" />
</template>

<script setup lang="ts">
import { useList } from '@vue-biz/core'
import { usePaginationProps } from '@vue-biz/tdesign'
import { TPagination } from 'tdesign-vue-next'

const list = useList({
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})

const paginationProps = usePaginationProps(list)
</script>
```

### 自定义配置

```vue
<script setup lang="ts">
const paginationProps = usePaginationProps(list, {
  pageSizeOptions: [20, 50, 100],
  showJumper: true,
  showPageSize: true,
})
</script>
```

### 与表格分离

```vue
<template>
  <t-table :data="list.data.value" :loading="list.isPending.value">
    <t-table-column prop="name" label="姓名" />
  </t-table>

  <t-pagination v-bind="paginationProps" class="mt-4" />
</template>

<script setup lang="ts">
const list = useList({
  /* ... */
})
const paginationProps = usePaginationProps(list)
</script>
```

## 默认配置

- `pageSizeOptions`: `[10, 20, 50, 100]`
- `maxPageBtn`: `6`
- 自动处理页码切换
- 自动绑定 current、pageSize、total

## 注意事项

- 页码自动从 0-based（useList）转换为 1-based（TDesign）
- 通常在需要自定义表格布局时使用，否则推荐使用 `useTableProps`
