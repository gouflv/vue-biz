# useTableProps

将 `useList` 返回值转换为 TDesign Table 组件的 props。

## 介绍

`useTableProps` 自动将 @vue-biz/core 的 `useList` 返回值转换为 TDesign Table 所需的属性，包括数据、分页、加载状态等。

## 参数

```typescript
function useTableProps<T>(
  list: UseListReturn<T>,
  options?: {
    rowKey?: string
    height?: Ref<number>
    pagination?: boolean | Partial<PaginationProps>
  },
)
```

| 参数               | 类型                                  | 默认值 | 说明               |
| ------------------ | ------------------------------------- | ------ | ------------------ |
| list               | `UseListReturn<T>`                    | -      | useList 返回值     |
| options.rowKey     | `string`                              | `'id'` | 行唯一标识字段     |
| options.height     | `Ref<number>`                         | -      | 表格高度（响应式） |
| options.pagination | `boolean \| Partial<PaginationProps>` | `true` | 分页配置           |

## 返回值

| 属性       | 类型                      | 说明             |
| ---------- | ------------------------- | ---------------- |
| tableProps | `ComputedRef<TableProps>` | Table 组件 props |
| selection  | `Ref<T[]>`                | 已选择的行数据   |

## 使用示例

### 基础使用

```vue
<template>
  <t-table v-bind="tableProps">
    <t-table-column prop="name" label="姓名" />
    <t-table-column prop="age" label="年龄" />
  </t-table>
</template>

<script setup lang="ts">
import { useList } from '@vue-biz/core'
import { useTableProps } from '@vue-biz/tdesign'
import { TTable, TTableColumn } from 'tdesign-vue-next'

const list = useList({
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})

const { tableProps } = useTableProps(list)
</script>
```

### 自定义 rowKey

```vue
<script setup lang="ts">
const list = useList({
  /* ... */
})

const { tableProps } = useTableProps(list, {
  rowKey: 'userId', // 使用 userId 作为唯一标识
})
</script>
```

### 动态高度

```vue
<script setup lang="ts">
import { ref } from 'vue'

const containerHeight = ref(600)

const list = useList({
  /* ... */
})

const { tableProps } = useTableProps(list, {
  height: containerHeight, // 表格会自动减去分页器高度
})
</script>
```

### 禁用分页

```vue
<script setup lang="ts">
const { tableProps } = useTableProps(list, {
  pagination: false,
})
</script>
```

### 自定义分页配置

```vue
<script setup lang="ts">
const { tableProps } = useTableProps(list, {
  pagination: {
    pageSizeOptions: [20, 50, 100],
    showJumper: true,
  },
})
</script>
```

### 使用选择功能

```vue
<template>
  <t-button @click="handleBatchDelete" :disabled="!selection.length">
    批量删除 ({{ selection.length }})
  </t-button>
  <t-table v-bind="tableProps">
    <t-table-column prop="name" label="姓名" />
  </t-table>
</template>

<script setup lang="ts">
const list = useList({
  /* ... */
})
const { tableProps, selection } = useTableProps(list)

function handleBatchDelete() {
  const ids = selection.value.map((item) => item.id)
  // 执行批量删除
}
</script>
```

## 内置功能

### 自动加载状态

表格自动显示加载状态，基于 `list.isPending`。

### 自动分页

分页器自动绑定到 `list.current` 和 `list.pageSize`，切换页码时自动触发请求。

### 选择统计

分页区域自动显示总数据量和已选择数量，支持一键清空选择。

### 表格悬停

默认启用行悬停效果（`hover: true`）。

## 注意事项

- `height` 参数会自动减去分页器高度（64px）
- 选择功能默认启用，选中的行会保存在 `selection` 中
- 页码从 0 开始（与 TDesign 的 1-based 索引自动转换）
