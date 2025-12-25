import { injectLocal, provideLocal } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { onScopeDispose, ref, toValue, watch, type InjectionKey, type Ref } from 'vue'
import { debug } from '../shared/debug'
import type { Mode, UseEditProps, UseEditReturn } from './type'

const DEFAULT_INJECT_KEY = Symbol('useEdit')

const log = debug.extend('useEdit')

export function useEdit<FormData = unknown, Params = FormData>(
  props: UseEditProps<FormData, Params>,
): UseEditReturn<FormData, Params> {
  const open = ref(false)
  const mode = ref<Mode>('add')

  const error = ref<Error | null>(null)
  const isFetching = ref(false)
  const isFetched = ref(false)
  const isPending = ref(false)
  const data = ref(getInitializeData()) as Ref<FormData>

  const fetchAbortController = ref<AbortController | null>(null)

  function getInitializeData() {
    return cloneDeep(toValue(props.initialData) ?? {}) as FormData
  }

  async function fetch(params?: Params) {
    if (!props.fetchFn) {
      throw new Error('fetchFn is not provided')
    }

    fetchAbortController.value?.abort()
    fetchAbortController.value = new AbortController()
    isFetching.value = true
    isFetched.value = false
    error.value = null

    try {
      log('fetching', { params })

      const result = await props.fetchFn({
        params,
        config: { signal: fetchAbortController.value.signal },
      })

      log('fetched', result)

      data.value = result as FormData
      isFetched.value = true
    } catch (e) {
      error.value = e as Error
      console.error(e)
    } finally {
      isFetching.value = false
      fetchAbortController.value = null
    }
  }

  async function mutate() {
    if (!props.mutationFn) {
      throw new Error('mutationFn is not provided')
    }

    if (isPending.value) return

    isPending.value = true
    error.value = null

    try {
      log('mutating', { data: data.value })

      props.onMutation?.()

      const res = await props.mutationFn({
        mode: mode.value,
        isEdit: mode.value === 'edit',
        data: data.value,
      })

      props.onSuccess?.(res)
      open.value = false
    } catch (e) {
      error.value = e as Error
      props.onError?.(error.value)
      console.error(e)
    } finally {
      isPending.value = false
    }
  }

  function reset() {
    data.value = getInitializeData()
  }

  function add() {
    mode.value = 'add'
    open.value = true
    reset()
  }

  async function edit(params?: Params) {
    mode.value = 'edit'
    open.value = true
    reset()
    await fetch(params)
  }

  // Update data when initialData changes
  watch(
    () => toValue(props.initialData),
    () => {
      data.value = getInitializeData()
    },
  )

  // Abort fetch when closed
  watch(open, () => {
    if (!open.value) {
      fetchAbortController.value?.abort()
    }
  })

  onScopeDispose(() => {
    fetchAbortController.value?.abort()
  })

  const exposed = {
    open,
    mode,
    error,
    isFetching,
    isFetched,
    isPending,
    data,
    reset,
    add,
    edit,
    mutate,
    provide,
  } satisfies UseEditReturn<FormData, Params>

  function provide(key: InjectionKey<unknown> = DEFAULT_INJECT_KEY) {
    provideLocal(key, exposed)
  }

  return exposed
}

export function useInjectedEdit<FormData = unknown, Params = FormData>(
  key: InjectionKey<UseEditReturn<FormData, Params>> = DEFAULT_INJECT_KEY,
): UseEditReturn<FormData, Params> {
  const injected = injectLocal<UseEditReturn<FormData, Params>>(key)
  if (!injected) throw new Error('Should provide useEdit first')
  return injected
}
