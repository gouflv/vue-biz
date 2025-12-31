import { computed, type Ref } from 'vue'

/**
 * Create filter component props
 */
export function useFilterProps(
  data: Ref,
  callback: {
    reset: () => void
    submit: () => void
  },
) {
  return computed(() => ({
    data: data.value,
    onReset: callback.reset,
    onSubmit: callback.submit,
  }))
}
