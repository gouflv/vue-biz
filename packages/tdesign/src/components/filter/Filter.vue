<template>
  <div class="mb-2 pb-5 border-b-0 border-gray-100">
    <Form
      :data="data"
      layout="inline"
      :label-width="labelWidth"
      autocomplete="off"
      @submit="emit('submit')"
      @reset="emit('reset')"
      class="flex gap-0 items-start"
    >
      <div :class="twMerge('flex flex-1 flex-wrap gap-4', contentClass)">
        <slot />
      </div>
      <div class="flex flex-none gap-2">
        <Button type="submit">筛选</Button>
        <Button v-if="showReset" type="reset" theme="default">重置</Button>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { Button, Form } from 'tdesign-vue-next'

withDefaults(
  defineProps<{
    data: any
    labelWidth?: string
    showReset?: boolean
    contentClass?: string
  }>(),
  {
    labelWidth: '80px',
    showReset: true,
  },
)

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'reset'): void
}>()
</script>
