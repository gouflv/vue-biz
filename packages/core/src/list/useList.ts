import { injectLocal, provideLocal, watchImmediate } from '@vueuse/core'
import { isArray, isEqual, isNumber } from 'lodash-es'
import { computed, onScopeDispose, ref, toValue, watch, type InjectionKey, type Ref } from 'vue'
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

    try {
      const pageData = await props.fetchFn({
        params,
        config: { signal: controller.signal },
      })

      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        data.value = isArray(pageData.items) ? pageData.items : []
        total.value = isNumber(pageData.total) ? pageData.total : 0
        isPending.value = false

        log('fetched', { data: data.value, total: total.value })
      }
    } catch (e) {
      // Only handle errors if this request wasn't aborted
      if (!controller.signal.aborted) {
        error.value = e as Error
        isPending.value = false
        console.error(e)
      }
    }
  }

  async function reset() {
    current.value = 0
    await fetch()
  }

  watch(
    [enabled, current, pageSize, query],
    (_, oldValues) => {
      if (!enabled.value) return

      const [oldEnabled, oldCurrent, oldPageSize, oldQuery] = oldValues
      // Trigger reset when pageSize or query changes
      if (oldPageSize !== pageSize.value || !isEqual(oldQuery, query.value)) {
        reset()
      } else {
        fetch()
      }
    },
    { immediate: true, deep: true },
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
