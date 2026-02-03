# useRequest

获取全局配置的 Axios 实例的便捷方法。

## 介绍

`useRequest` 是 `useConfig` 的简化版本，直接返回配置的 Axios 实例，方便在组件中快速发起请求。

## 返回值

| 类型            | 说明                  |
| --------------- | --------------------- |
| `AxiosInstance` | 全局配置的 Axios 实例 |

## 使用示例

### 基础使用

```vue
<script setup>
import { useRequest } from '@vue-biz/core'

const request = useRequest()

async function fetchUserInfo() {
  const res = await request.get('/user/info')
  return res.data
}
</script>
```

### 结合其他功能

```vue
<script setup>
import { useRequest, useList } from '@vue-biz/core'

const request = useRequest()

const userList = useList({
  fetchFn: async ({ params }) => {
    const res = await request.get('/users', { params })
    return {
      items: res.data.list,
      total: res.data.total,
    }
  },
})
</script>
```

## 注意事项

- 必须在 `ConfigProvider` 内部使用
- 请求实例不响应配置变更
