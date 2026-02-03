# useFilterProps

创建 Filter 组件的 props 工具函数。

## 介绍

`useFilterProps` 用于简化 Filter 组件的属性绑定，自动生成 data、onReset、onSubmit 等属性。

## 参数

```typescript
function useFilterProps(
  data: Ref,
  callback: {
    reset: () => void
    submit: () => void
  },
)
```

| 参数            | 类型         | 说明     |
| --------------- | ------------ | -------- |
| data            | `Ref`        | 表单数据 |
| callback.reset  | `() => void` | 重置回调 |
| callback.submit | `() => void` | 提交回调 |

## 返回值

| 类型                       | 说明              |
| -------------------------- | ----------------- |
| `ComputedRef<FilterProps>` | Filter 组件 props |

## 使用示例

### 基础使用

```vue
<template>
  <Filter v-bind="filterProps">
    <t-form-item label="姓名" name="name">
      <t-input v-model="query.name" />
    </t-form-item>
  </Filter>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Filter, useFilterProps } from '@vue-biz/tdesign'

const query = ref({ name: '' })

const filterProps = useFilterProps(query, {
  reset: () => {
    query.value = { name: '' }
  },
  submit: () => {
    console.log('提交筛选', query.value)
  },
})
</script>
```

### 结合 useList

```vue
<template>
  <Filter v-bind="filterProps">
    <t-form-item label="关键词" name="keyword">
      <t-input v-model="query.keyword" />
    </t-form-item>
  </Filter>

  <t-table v-bind="tableProps">
    <t-table-column prop="name" label="姓名" />
  </t-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useList } from '@vue-biz/core'
import { Filter, useFilterProps, useTableProps } from '@vue-biz/tdesign'

const query = ref({
  keyword: '',
  status: '',
})

const list = useList({
  query: () => query.value,
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})

const filterProps = useFilterProps(query, {
  reset: () => {
    query.value = { keyword: '', status: '' }
  },
  submit: () => {
    list.reset() // 重置到第一页
  },
})

const { tableProps } = useTableProps(list)
</script>
```

### 带默认值的重置

```vue
<script setup lang="ts">
const defaultQuery = { name: '', status: 'all' }
const query = ref({ ...defaultQuery })

const filterProps = useFilterProps(query, {
  reset: () => {
    query.value = { ...defaultQuery } // 重置为默认值
  },
  submit: () => {
    list.reset()
  },
})
</script>
```

### 提交前验证

```vue
<script setup lang="ts">
const query = ref({ startDate: '', endDate: '' })

const filterProps = useFilterProps(query, {
  reset: () => {
    query.value = { startDate: '', endDate: '' }
  },
  submit: () => {
    if (!query.value.startDate || !query.value.endDate) {
      console.log('请选择日期范围')
      return
    }
    list.reset()
  },
})
</script>
```

## 注意事项

- `data` 必须是响应式对象（`ref` 或 `reactive`）
- 重置操作需要手动清空数据，不会自动重置
- 提交时建议调用 `list.reset()` 而不是 `list.refresh()`，以确保从第一页开始查询
