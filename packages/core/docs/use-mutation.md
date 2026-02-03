# useMutation

通用数据变更的 Composable，用于删除、更新状态等操作。

## 介绍

`useMutation` 用于处理简单的数据变更操作，如删除、状态切换、批量操作等。

## 参数

```typescript
type UseMutationProps<Params> = {
  mutationFn: (context: { params: Params; config: AxiosRequestConfig }) => Promise<unknown>
  onMutate?: () => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}
```

| 参数       | 类型       | 必填 | 说明       |
| ---------- | ---------- | ---- | ---------- |
| mutationFn | `Function` | 是   | 变更函数   |
| onMutate   | `Function` | 否   | 变更前回调 |
| onSuccess  | `Function` | 否   | 成功回调   |
| onError    | `Function` | 否   | 错误回调   |

## 返回值

| 属性      | 类型                                | 说明       |
| --------- | ----------------------------------- | ---------- |
| isPending | `Ref<boolean>`                      | 执行中状态 |
| error     | `Ref<Error \| null>`                | 错误信息   |
| mutate    | `(params: Params) => Promise<void>` | 执行变更   |

## 使用示例

### 删除操作

```vue
<script setup>
import { useMutation, useList } from '@vue-biz/core'

const list = useList({
  /* ... */
})

const deleteUser = useMutation({
  mutationFn: async ({ params }) => {
    await axios.delete(`/user/${params.id}`)
  },
  onSuccess: () => {
    list.refresh() // 刷新列表
  },
})

function handleDelete(id) {
  if (confirm('确认删除？')) {
    deleteUser.mutate({ id })
  }
}
</script>

<template>
  <div v-for="item in list.data.value" :key="item.id">
    {{ item.name }}
    <button @click="handleDelete(item.id)" :disabled="deleteUser.isPending.value">删除</button>
  </div>
</template>
```

### 状态切换

```vue
<script setup>
import { useMutation } from '@vue-biz/core'

const toggleStatus = useMutation({
  mutationFn: async ({ params }) => {
    await axios.put(`/user/${params.id}/status`, {
      enabled: params.enabled,
    })
  },
})

function handleToggle(id, enabled) {
  toggleStatus.mutate({ id, enabled })
}
</script>

<template>
  <button @click="handleToggle(1, true)">启用</button>
  <button @click="handleToggle(1, false)">禁用</button>
</template>
```

### 批量操作

```vue
<script setup>
import { useMutation } from '@vue-biz/core'

const batchDelete = useMutation({
  mutationFn: async ({ params }) => {
    await axios.post('/user/batch-delete', {
      ids: params.ids,
    })
  },
  onSuccess: () => {
    selectedIds.value = []
    list.refresh()
  },
})

const selectedIds = ref([])

function handleBatchDelete() {
  if (!selectedIds.value.length) return
  batchDelete.mutate({ ids: selectedIds.value })
}
</script>

<template>
  <button @click="handleBatchDelete">批量删除</button>
</template>
```

### 错误处理

```vue
<script setup>
import { useMutation } from '@vue-biz/core'
import { ref } from 'vue'

const errorMsg = ref('')

const mutation = useMutation({
  mutationFn: async ({ params }) => {
    await axios.post('/action', params)
  },
  onError: (error) => {
    errorMsg.value = error.message
  },
})
</script>

<template>
  <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
  <button @click="mutation.mutate({ id: 1 })">执行</button>
</template>
```

## 特性说明

### 执行防抖

执行中会忽略新的请求，防止重复提交。

### 生命周期

1. 调用 `mutate(params)`
2. 触发 `onMutate` 回调
3. 执行 `mutationFn`
4. 成功：触发 `onSuccess`
5. 失败：触发 `onError`

### 与 useEdit 的区别

- `useMutation`: 简单的数据变更，无状态管理
- `useEdit`: 完整的表单编辑流程，包含数据获取、模式切换等
