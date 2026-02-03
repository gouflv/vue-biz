# @vue-biz/core

基于 Vue 3 和 Axios 的业务逻辑封装库，提供列表查询、表单编辑、数据变更等常见业务场景的解决方案。

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
