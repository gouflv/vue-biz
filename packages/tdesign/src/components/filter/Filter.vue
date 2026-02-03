<template>
  <Form
    :data="data"
    layout="inline"
    label-width="80px"
    autocomplete="off"
    @submit="emit('submit')"
    @reset="emit('reset')"
    class="flex gap-0 items-start"
    v-bind="$attrs"
  >
    <div :class="twMerge('flex flex-1 flex-wrap gap-4', contentClass)">
      <slot />
    </div>
    <div v-if="actions" class="flex flex-none gap-2">
      <slot name="actions">
        <Button type="submit">筛选</Button>
        <Button type="reset" theme="default">重置</Button>
      </slot>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { Button, Form } from 'tdesign-vue-next'

withDefaults(
  defineProps<{
    data: any
    contentClass?: string
    actions?: boolean
  }>(),
  {
    labelWidth: '80px',
    actions: true,
  },
)

const emit = defineEmits<{
  submit: []
  reset: []
}>()
</script>
