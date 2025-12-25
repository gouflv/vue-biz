import { ref } from 'vue'
import { debug } from '../shared/debug'
import type { UseMutationProps } from './type'

const log = debug.extend('useMutation')

export function useMutation<Params = unknown>(props: UseMutationProps<Params>) {
  const error = ref<Error | null>(null)

  const isPending = ref(false)

  const abortController = ref<AbortController | null>(null)

  async function mutate(params: Params) {
    if (isPending.value) return

    abortController.value?.abort()
    abortController.value = new AbortController()
    isPending.value = true
    error.value = null

    try {
      log('mutating', { params })

      props.onMutate?.()

      await props.mutationFn({
        params,
        config: { signal: abortController.value.signal },
      })
      props.onSuccess?.()
    } catch (e) {
      error.value = e as Error
      props.onError?.(error.value)
      console.error(e)
    } finally {
      isPending.value = false
      abortController.value = null
    }
  }

  return {
    error,
    isPending,
    mutate,
  }
}
