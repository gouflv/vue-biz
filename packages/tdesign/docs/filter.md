# Filter

筛选表单组件，提供统一的筛选布局和操作。

## 介绍

`Filter` 是一个封装的筛选表单组件，提供内联布局和统一的操作按钮。

## Props

| 属性         | 类型      | 默认值 | 说明             |
| ------------ | --------- | ------ | ---------------- |
| data         | `any`     | -      | 表单数据（必填） |
| contentClass | `string`  | -      | 内容区域 class   |
| actions      | `boolean` | `true` | 是否显示操作按钮 |

## Events

| 事件   | 参数 | 说明         |
| ------ | ---- | ------------ |
| submit | -    | 点击筛选按钮 |
| reset  | -    | 点击重置按钮 |

## Slots

| 插槽    | 说明                                 |
| ------- | ------------------------------------ |
| default | 表单项内容                           |
| actions | 操作按钮（替换默认的筛选和重置按钮） |

## 使用示例

### 基础使用

```vue
<template>
  <Filter :data="filterData" @submit="handleSubmit" @reset="handleReset">
    <t-form-item label="姓名" name="name">
      <t-input v-model="filterData.name" />
    </t-form-item>
    <t-form-item label="状态" name="status">
      <t-select v-model="filterData.status" :options="statusOptions" />
    </t-form-item>
  </Filter>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from '@vue-biz/tdesign'
import { TFormItem, TInput, TSelect } from 'tdesign-vue-next'

const filterData = ref({
  name: '',
  status: '',
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
]

function handleSubmit() {
  console.log('筛选', filterData.value)
}

function handleReset() {
  filterData.value = { name: '', status: '' }
}
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

const query = ref({ keyword: '' })

const list = useList({
  query: () => query.value,
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})

const filterProps = useFilterProps(query, {
  reset: () => {
    query.value = { keyword: '' }
  },
  submit: () => {
    list.reset()
  },
})

const { tableProps } = useTableProps(list)
</script>
```

### 自定义操作按钮

```vue
<template>
  <Filter :data="filterData" @submit="handleSubmit" @reset="handleReset">
    <t-form-item label="姓名" name="name">
      <t-input v-model="filterData.name" />
    </t-form-item>

    <template #actions>
      <t-button theme="primary" @click="handleSubmit">搜索</t-button>
      <t-button theme="default" @click="handleReset">清空</t-button>
      <t-button theme="default" @click="handleExport">导出</t-button>
    </template>
  </Filter>
</template>
```

### 隐藏操作按钮

```vue
<template>
  <Filter :data="filterData" :actions="false" @submit="handleSubmit">
    <t-form-item label="姓名" name="name">
      <t-input v-model="filterData.name" />
    </t-form-item>
  </Filter>

  <div class="mt-4">
    <t-button @click="handleSubmit">自定义提交按钮</t-button>
  </div>
</template>
```

### 自定义样式

```vue
<template>
  <Filter :data="filterData" content-class="gap-2" @submit="handleSubmit">
    <t-form-item label="姓名" name="name">
      <t-input v-model="filterData.name" />
    </t-form-item>
  </Filter>
</template>
```

## 默认样式

- 表单项内联排列（`layout="inline"`）
- 表单项之间有间距（`gap-4`）
- 标签宽度 80px
- 操作按钮靠右对齐

## 注意事项

- 默认阻止表单自动提交，需要监听 `@submit` 和 `@reset` 事件
- 支持所有 TDesign Form 组件的属性（通过 `v-bind="$attrs"`）
- 使用 Tailwind CSS 类名，确保项目已配置 Tailwind
