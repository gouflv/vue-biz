# @vue-biz/core

基于 Vue 3 和 Axios 的业务逻辑封装库，提供列表查询、表单编辑、数据变更等常见业务场景的解决方案。

## ⚠️ 使用要求

本包发布的是 **ESM 格式的 TypeScript 原始代码**，使用前请确保你的项目满足以下条件：

- ✅ 使用 **Vite** 作为构建工具
- ✅ 支持 TypeScript（建议 5.0+）
- ✅ 使用 ESM 模块系统（`"type": "module"`）

Vite 会自动处理 TypeScript 转译，通常无需额外配置。如果遇到问题，可以在 `vite.config.ts` 中添加：

```typescript
export default {
  optimizeDeps: {
    include: ['@vue-biz/core'],
  },
}
```

## 特性

- 🚀 开箱即用的业务场景 Composables
- 📦 支持分页列表、表单编辑、数据变更等常见场景
- 🎯 TypeScript 支持，完整的类型定义
- ⚡️ 基于 Vue 3 Composition API
- 🔌 支持请求中断和错误处理
- 🔄 支持依赖注入，方便组件间共享状态

## 安装

```bash
pnpm add @vue-biz/core axios vue
```

## 快速开始

### 1. 配置全局请求实例

```vue
<template>
  <ConfigProvider :config="config">
    <App />
  </ConfigProvider>
</template>

<script setup>
import { ConfigProvider } from '@vue-biz/core'
import axios from 'axios'

const config = {
  request: {
    instance: axios.create({
      baseURL: '/api',
    }),
  },
}
</script>
```

### 2. 使用列表查询

```vue
<script setup>
import { useList } from '@vue-biz/core'

const list = useList({
  fetchFn: async ({ params }) => {
    const res = await axios.get('/users', { params })
    return { items: res.data.list, total: res.data.total }
  },
})
</script>

<template>
  <div v-if="list.isPending">加载中...</div>
  <div v-for="item in list.data.value" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

## API 文档

### 核心配置

- [ConfigProvider / useConfig](./docs/config.md) - 全局配置管理
- [useRequest](./docs/use-request.md) - 获取请求实例

### 业务 Composables

- [useList](./docs/use-list.md) - 列表查询和分页管理
- [useEdit](./docs/use-edit.md) - 表单编辑（新增/编辑）
- [useMutation](./docs/use-mutation.md) - 数据变更操作

## License

MIT
