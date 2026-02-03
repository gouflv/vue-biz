# useEdit

表单编辑的 Composable，支持新增和编辑两种模式。

## 介绍

`useEdit` 用于管理表单的新增和编辑操作，自动处理表单数据获取、提交、状态管理等。

## 参数

```typescript
type UseEditProps<FormData, Params> = {
  initialData?: MaybeRefOrGetter<Partial<FormData>>
  fetchFn?: (context: EditFetchFnContext<Params>) => Promise<FormData>
  mutationFn?: (context: EditMutationFnContext<FormData>) => Promise<unknown>
  onMutation?: () => void
  onSuccess?: (response?: unknown) => void
  onError?: (error: Error) => void
}
```

| 参数        | 类型                                  | 必填 | 说明                   |
| ----------- | ------------------------------------- | ---- | ---------------------- |
| initialData | `MaybeRefOrGetter<Partial<FormData>>` | 否   | 初始数据，用于新增模式 |
| fetchFn     | `Function`                            | 否   | 编辑模式的数据获取函数 |
| mutationFn  | `Function`                            | 否   | 提交函数               |
| onMutation  | `Function`                            | 否   | 提交前回调             |
| onSuccess   | `Function`                            | 否   | 提交成功回调           |
| onError     | `Function`                            | 否   | 错误回调               |

### fetchFn 参数

```typescript
{
  params?: Params            // 来自 edit(params) 的参数
  config: AxiosRequestConfig // 请求配置，包含 signal
}
```

### mutationFn 参数

```typescript
{
  mode: 'add' | 'edit' // 当前模式
  isEdit: boolean // 是否为编辑模式
  data: FormData // 表单数据
}
```

## 返回值

| 属性       | 类型                         | 说明         |
| ---------- | ---------------------------- | ------------ |
| open       | `Ref<boolean>`               | 对话框开关   |
| mode       | `Ref<'add' \| 'edit'>`       | 当前模式     |
| data       | `Ref<FormData>`              | 表单数据     |
| isFetching | `Ref<boolean>`               | 数据获取中   |
| isFetched  | `Ref<boolean>`               | 数据已获取   |
| isPending  | `Ref<boolean>`               | 提交中       |
| error      | `Ref<Error \| null>`         | 错误信息     |
| add        | `() => void`                 | 打开新增     |
| edit       | `(params?) => Promise<void>` | 打开编辑     |
| mutate     | `() => Promise<void>`        | 提交表单     |
| reset      | `() => void`                 | 重置表单     |
| provide    | `(key?) => void`             | 提供给子组件 |

## 使用示例

### 基础使用

```vue
<script setup>
import { useEdit } from '@vue-biz/core'

const edit = useEdit({
  initialData: { name: '', age: 0 },
  fetchFn: async ({ params }) => {
    const res = await axios.get(`/user/${params.id}`)
    return res.data
  },
  mutationFn: async ({ mode, data }) => {
    if (mode === 'add') {
      return axios.post('/user', data)
    } else {
      return axios.put(`/user/${data.id}`, data)
    }
  },
  onSuccess: () => {
    console.log('提交成功')
  },
})
</script>

<template>
  <button @click="edit.add()">新增</button>
  <button @click="edit.edit({ id: 1 })">编辑</button>

  <dialog :open="edit.open.value">
    <h2>{{ edit.mode.value === 'add' ? '新增' : '编辑' }}</h2>

    <div v-if="edit.isFetching.value">加载中...</div>
    <form v-else>
      <input v-model="edit.data.value.name" />
      <input v-model="edit.data.value.age" type="number" />
      <button @click="edit.mutate()" :disabled="edit.isPending.value">提交</button>
    </form>
  </dialog>
</template>
```

### 结合列表刷新

```vue
<script setup>
import { useEdit, useList } from '@vue-biz/core'

const list = useList({
  /* ... */
})

const edit = useEdit({
  mutationFn: async ({ mode, data }) => {
    if (mode === 'add') {
      await axios.post('/user', data)
    } else {
      await axios.put(`/user/${data.id}`, data)
    }
  },
  onSuccess: () => {
    list.refresh() // 刷新列表
  },
})
</script>
```

### 动态初始数据

```vue
<script setup>
import { ref } from 'vue'
import { useEdit } from '@vue-biz/core'

const defaultCategory = ref('A')

const edit = useEdit({
  initialData: () => ({
    name: '',
    category: defaultCategory.value,
  }),
  mutationFn: async ({ data }) => {
    await axios.post('/item', data)
  },
})
</script>
```

### 依赖注入

```vue
<!-- Parent.vue -->
<script setup>
import { useEdit } from '@vue-biz/core'

const edit = useEdit({
  /* ... */
})
edit.provide() // 提供给子组件
</script>

<!-- Child.vue -->
<script setup>
import { useInjectedEdit } from '@vue-biz/core'

const edit = useInjectedEdit()
</script>
```

## 特性说明

### 模式切换

- 调用 `add()` 进入新增模式，使用 `initialData` 初始化表单
- 调用 `edit(params)` 进入编辑模式，自动调用 `fetchFn` 获取数据

### 数据重置

- 切换模式时自动重置表单数据
- `initialData` 变更时自动更新表单

### 请求中断

- 关闭对话框时自动中断数据获取请求
- 重复请求时自动中断上一个请求

### 提交防抖

提交中会忽略新的提交请求，防止重复提交。
