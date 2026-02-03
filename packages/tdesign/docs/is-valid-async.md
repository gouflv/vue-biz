# isValidAsync

异步表单验证工具函数。

## 介绍

`isValidAsync` 用于异步验证 TDesign Form 表单，返回验证结果。

## 参数

```typescript
function isValidAsync(form: MaybeRef<FormInstanceFunctions | undefined>): Promise<boolean>
```

| 参数 | 类型                                           | 说明          |
| ---- | ---------------------------------------------- | ------------- |
| form | `MaybeRef<FormInstanceFunctions \| undefined>` | Form 组件实例 |

## 返回值

| 类型               | 说明                              |
| ------------------ | --------------------------------- |
| `Promise<boolean>` | 验证通过返回 `true`，否则 `false` |

## 使用示例

### 基础使用

```vue
<template>
  <t-form ref="formRef" :data="formData" :rules="rules">
    <t-form-item label="姓名" name="name">
      <t-input v-model="formData.name" />
    </t-form-item>
  </t-form>

  <t-button @click="handleSubmit">提交</t-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isValidAsync } from '@vue-biz/tdesign'

const formRef = ref()
const formData = ref({ name: '' })

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
}

async function handleSubmit() {
  if (await isValidAsync(formRef)) {
    console.log('验证通过，提交数据')
  } else {
    console.log('验证失败')
  }
}
</script>
```

### 结合 useEdit

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

### 多步骤表单

```vue
<script setup lang="ts">
const step1FormRef = ref()
const step2FormRef = ref()
const currentStep = ref(0)

async function nextStep() {
  if (currentStep.value === 0) {
    if (await isValidAsync(step1FormRef)) {
      currentStep.value = 1
    }
  } else {
    if (await isValidAsync(step2FormRef)) {
      // 提交表单
    }
  }
}
</script>
```

## 注意事项

- 验证失败时表单会自动显示错误信息
- 支持 `ref` 或直接传入 Form 实例
- 返回 `Promise<boolean>`，需要使用 `await` 或 `.then()`
- Form 实例为 `undefined` 时返回 `false`
