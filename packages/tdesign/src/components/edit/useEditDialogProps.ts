import type { UseEditReturn } from '@vue-biz/core'
import type { DialogProps } from 'tdesign-vue-next'
import { computed } from 'vue'

export function useEditDialogProps(
  edit: UseEditReturn,
  callback?: {
    confirm?: () => void
  },
) {
  return computed(() => {
    const { open, mode, isFetching, isPending } = edit

    return {
      visible: open.value,
      header: mode.value === 'add' ? '新增' : '编辑',
      destroyOnClose: true,
      lazy: true,
      attach: 'body',
      confirmBtn: {
        loading: isPending.value,
        disabled: isFetching.value,
      },
      onClose: () => {
        open.value = false
      },
      onConfirm: () => {
        callback?.confirm?.()
      },
    } satisfies DialogProps
  })
}
