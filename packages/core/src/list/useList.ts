import { injectLocal, provideLocal, watchDebounced, watchImmediate } from '@vueuse/core'
import { isArray, isNumber } from 'lodash-es'
import {
  computed,
  onMounted,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue'
import { debug } from '../shared/debug'
import type { ListFetchFnParams, UseListProps, UseListReturn } from './type'

const DEFAULT_INJECT_KEY = Symbol('useList')

const log = debug.extend('useList')

export function useList<Data = unknown, Query = unknown>(
  props: UseListProps<Data, Query>,
): UseListReturn<Data> {
  const pageSize = ref(20)

  const query = ref({} as Query)

  // Sync pageSize to local
  watchImmediate(
    () => toValue(props.pageSize),
    (value) => {
      if (isNumber(value)) {
        pageSize.value = value
      }
    },
  )

  // Sync query to local
  watchImmediate(
    () => toValue(props.query),
    (value) => {
      query.value = value
    },
  )

  const enabled = computed(() => toValue(props.enabled) !== false)

  const error = ref<Error | null>(null)
  const isPending = ref(true)
  const current = ref(0)
  const data = ref([]) as Ref<Data[]>
  const total = ref(0)
  const isEmpty = computed(() => !isPending.value && !data.value?.length)

  const abortController = ref<AbortController | null>(null)

  /**
   * Will abort previous request if exists
   */
  async function fetch() {
    if (!enabled.value) return

    try {
      // Abort previous request if exists
      abortController.value?.abort()

      // Create new AbortController for this request
      const controller = new AbortController()
      abortController.value = controller

      isPending.value = true
      error.value = null

      const params: ListFetchFnParams<Query> = {
        pager: {
          current: current.value,
          pageSize: pageSize.value,
        },
        query: query.value,
      }

      log('fetching', { params })

      const pageData = await props.fetchFn({
        params,
        config: { signal: controller.signal },
      })

      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        data.value = isArray(pageData.items) ? pageData.items : []
        total.value = isNumber(pageData.total) ? pageData.total : 0

        log('fetched', { data: data.value, total: total.value })
      }
    } catch (e) {
      // Ignore AbortError
      if ((e as Error).name !== 'AbortError') {
        error.value = e as Error
        console.error(e)
      }
    } finally {
      isPending.value = false
    }
  }

  function reset() {
    current.value = 0
    fetch()
  }

  // Initial fetch
  onMounted(fetch)

  // Trigger fetch when enabled changes
  watch(enabled, fetch)

  // Trigger fetch when current changes
  watch(current, fetch)

  // Trigger reset when pageSize or query changes
  watchDebounced(
    [pageSize, query],
    () => {
      reset()
    },
    { debounce: 50, maxWait: 200, deep: true },
  )

  onScopeDispose(() => {
    abortController.value?.abort()
  })

  const exposed = {
    error,
    isPending,
    isEmpty,
    current,
    pageSize,
    total,
    data,
    refresh: fetch,
    reset,
    provide,
  } satisfies UseListReturn<Data>

  function provide(key: InjectionKey<unknown> = DEFAULT_INJECT_KEY) {
    provideLocal(key, exposed)
  }

  return exposed
}

export function useInjectedList<Data = unknown>(): UseListReturn<Data> {
  const injected = injectLocal<UseListReturn<Data>>(DEFAULT_INJECT_KEY)
  if (!injected) throw new Error('Should provide useList first')
  return injected
}
