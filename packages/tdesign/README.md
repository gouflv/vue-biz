# @vue-biz/tdesign

基于 [TDesign Vue Next](https://tdesign.tencent.com/vue-next/overview) 组件库的 @vue-biz/core 适配层，提供开箱即用的业务组件和工具函数。

## 特性

- 🎨 基于 TDesign Vue Next 组件库
- 🔌 无缝集成 @vue-biz/core
- 📦 提供表格、表单、筛选等常见业务组件
- 🎯 TypeScript 支持
- 🎁 开箱即用的样式

## 安装

```bash
pnpm add @vue-biz/tdesign @vue-biz/core tdesign-vue-next tdesign-icons-vue-next
```

## 快速开始

### 1. 引入样式

```typescript
// main.ts
import 'tdesign-vue-next/es/style/index.css'
import '@vue-biz/tdesign/styles/index.css'
```

### 2. 使用表格组件

```vue
<template>
  <t-table v-bind="tableProps" />
</template>

<script setup lang="ts">
import { useList } from '@vue-biz/core'
import { useTableProps } from '@vue-biz/tdesign'
import { TTable } from 'tdesign-vue-next'

const list = useList({
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})

const { tableProps } = useTableProps(list)
</script>
```

## API 文档

### 表格组件

- [useTableProps](./docs/use-table-props.md) - 表格属性适配

### 表单组件

- [useEditDialogProps](./docs/use-edit-dialog-props.md) - 编辑对话框属性适配

### 筛选组件

- [Filter](./docs/filter.md) - 筛选表单组件
- [useFilterProps](./docs/use-filter-props.md) - 筛选属性工具

## 依赖说明

- **@vue-biz/core**: 核心业务逻辑库
- **tdesign-vue-next**: TDesign Vue 3 组件库
- **tdesign-icons-vue-next**: TDesign 图标库

## License

MIT
