# useTableSelectionProps

提供表格行选择功能的工具函数。

## 介绍

`useTableSelectionProps` 用于独立管理表格行选择状态，返回选中的行数据和相应的 Table props。

## 参数

```typescript
function useTableSelectionProps<T>(rowKey?: string)
```

| 参数   | 类型     | 默认值 | 说明           |
| ------ | -------- | ------ | -------------- |
| rowKey | `string` | `'id'` | 行唯一标识字段 |

## 返回值

| 属性       | 类型                               | 说明                 |
| ---------- | ---------------------------------- | -------------------- |
| selection  | `Ref<T[]>`                         | 已选择的行数据       |
| tableProps | `ComputedRef<Partial<TableProps>>` | Table 选择相关 props |

## 使用示例

### 基础使用

```vue
<template>
  <t-button @click="handleBatchDelete" :disabled="!selection.length"> 批量删除 </t-button>

  <t-table :data="list.data.value" v-bind="tableProps">
    <t-table-column prop="name" label="姓名" />
  </t-table>
</template>

<script setup lang="ts">
import { useTableSelectionProps } from '@vue-biz/tdesign'

const { selection, tableProps } = useTableSelectionProps()

function handleBatchDelete() {
  const ids = selection.value.map((item) => item.id)
  console.log('删除:', ids)
}
</script>
```

### 自定义 rowKey

```vue
<script setup lang="ts">
const { selection, tableProps } = useTableSelectionProps('userId')
</script>
```

### 获取选中的 ID

```vue
<script setup lang="ts">
import { computed } from 'vue'

const { selection } = useTableSelectionProps()

const selectedIds = computed(() => selection.value.map((item) => item.id))
</script>
```

### 清空选择

```vue
<template>
  <t-button @click="clearSelection">清空选择</t-button>
</template>

<script setup lang="ts">
const { selection } = useTableSelectionProps()

function clearSelection() {
  selection.value = []
}
</script>
```

## 注意事项

- 默认开启多选模式（`rowSelectionType: 'multiple'`）
- 选中数据会深拷贝，避免直接修改原始数据
- `selection` 包含完整的行数据对象，不仅是 ID
- 通常 `useTableProps` 已经内置了选择功能，无需单独使用
