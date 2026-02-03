# useEditDialogProps

将 `useEdit` 返回值转换为 TDesign Dialog 组件的 props。

## 介绍

`useEditDialogProps` 自动将 @vue-biz/core 的 `useEdit` 返回值转换为 TDesign Dialog 所需的属性，包括标题、加载状态、事件等。

## 参数

```typescript
function useEditDialogProps(
  edit: UseEditReturn,
  callback?: {
    confirm?: () => void
  },
)
```

| 参数             | 类型            | 说明           |
| ---------------- | --------------- | -------------- |
| edit             | `UseEditReturn` | useEdit 返回值 |
| callback.confirm | `() => void`    | 确认按钮回调   |

## 返回值

| 类型                       | 说明              |
| -------------------------- | ----------------- |
| `ComputedRef<DialogProps>` | Dialog 组件 props |

## 使用示例

### 基础使用

```vue
<template>
  <t-button @click="edit.add()">新增</t-button>

  <t-dialog v-bind="dialogProps">
    <t-form v-if="!edit.isFetching.value" :data="edit.data.value">
      <t-form-item label="姓名" name="name">
        <t-input v-model="edit.data.value.name" />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { useEdit } from '@vue-biz/core'
import { useEditDialogProps } from '@vue-biz/tdesign'
import { TButton, TDialog, TForm, TFormItem, TInput } from 'tdesign-vue-next'

const edit = useEdit({
  initialData: { name: '' },
  mutationFn: async ({ mode, data }) => {
    if (mode === 'add') {
      await axios.post('/user', data)
    } else {
      await axios.put(`/user/${data.id}`, data)
    }
  },
})

const dialogProps = useEditDialogProps(edit, {
  confirm: () => {
    edit.mutate()
  },
})
</script>
```

### 表单验证

```vue
<template>
  <t-dialog v-bind="dialogProps">
    <t-form ref="formRef" :data="edit.data.value" :rules="rules">
      <t-form-item label="姓名" name="name">
        <t-input v-model="edit.data.value.name" />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEdit } from '@vue-biz/core'
import { useEditDialogProps, isValidAsync } from '@vue-biz/tdesign'

const formRef = ref()

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
}

const edit = useEdit({
  mutationFn: async ({ data }) => {
    await axios.post('/user', data)
  },
})

const dialogProps = useEditDialogProps(edit, {
  confirm: async () => {
    if (await isValidAsync(formRef)) {
      await edit.mutate()
    }
  },
})
</script>
```

### 结合列表刷新

```vue
<script setup lang="ts">
import { useList, useEdit } from '@vue-biz/core'
import { useEditDialogProps } from '@vue-biz/tdesign'

const list = useList({
  /* ... */
})

const edit = useEdit({
  mutationFn: async ({ data }) => {
    await axios.post('/user', data)
  },
  onSuccess: () => {
    list.refresh() // 刷新列表
  },
})

const dialogProps = useEditDialogProps(edit, {
  confirm: () => edit.mutate(),
})
</script>
```

### 自定义对话框配置

```vue
<template>
  <t-dialog v-bind="{ ...dialogProps, width: '600px' }">
    <!-- 内容 -->
  </t-dialog>
</template>
```

## 默认配置

生成的 Dialog props 包含：

- `visible`: 自动绑定 `edit.open`
- `header`: 根据 `edit.mode` 显示"新增"或"编辑"
- `confirmBtn.loading`: 自动绑定 `edit.isPending`
- `confirmBtn.disabled`: 数据加载中时禁用
- `destroyOnClose`: `true`（关闭时销毁内容）
- `lazy`: `true`（延迟渲染）
- `attach`: `'body'`（挂载到 body）
- `onClose`: 自动关闭对话框
- `onConfirm`: 触发 callback.confirm

## 注意事项

- 必须在 `callback.confirm` 中调用 `edit.mutate()` 来触发提交
- 表单验证应在 `callback.confirm` 中进行
- 对话框关闭时会自动中断数据获取请求
