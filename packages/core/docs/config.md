# ConfigProvider / useConfig

全局配置管理，用于配置 Axios 实例等全局设置。

## ConfigProvider

提供全局配置的组件，通常在应用根组件使用。

### Props

| 属性   | 类型          | 说明     |
| ------ | ------------- | -------- |
| config | `ConfigProps` | 配置对象 |

### ConfigProps

```typescript
type ConfigProps = {
  request?: {
    instance?: AxiosInstance
  }
}
```

### 使用示例

```vue
<template>
  <ConfigProvider :config="config">
    <RouterView />
  </ConfigProvider>
</template>

<script setup>
import { ConfigProvider } from '@vue-biz/core'
import axios from 'axios'

const config = {
  request: {
    instance: axios.create({
      baseURL: '/api',
      timeout: 10000,
    }),
  },
}
</script>
```

## useConfig

获取全局配置的 Composable。

### 返回值

| 属性             | 类型            | 说明       |
| ---------------- | --------------- | ---------- |
| request.instance | `AxiosInstance` | Axios 实例 |

### 使用示例

```vue
<script setup>
import { useConfig } from '@vue-biz/core'

const config = useConfig()
const axiosInstance = config.request.instance
</script>
```

### 注意事项

- 必须在 `ConfigProvider` 内部使用
- 配置变更后不会自动响应，需要重新获取
