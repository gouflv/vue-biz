import type { AxiosRequestConfig } from 'axios'
import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'

export type ListFetchFnParams<Query> = {
  pager: {
    /**
     * Current page number, start from 0
     */
    current: number
    /**
     * Number of items per page
     */
    pageSize: number
  }
  query: Query
}

export type ListFetchFnContext<Query> = {
  /**
   * Fetch parameters
   */
  params: ListFetchFnParams<Query>

  /**
   * Fetch config
   */
  config: AxiosRequestConfig
}

export type UseListProps<Item, Query> = {
  fetchFn: (context: ListFetchFnContext<Query>) => Promise<PaginationData<Item>>

  query?: MaybeRefOrGetter<Query>

  pageSize?: MaybeRefOrGetter<number>

  enabled?: MaybeRefOrGetter<boolean>
}

export type UseListReturn<Data = unknown> = {
  error: Ref<Error | null>
  isPending: Ref<boolean>
  isEmpty: Ref<boolean>
  data: Ref<Data[] | undefined>
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  refresh: () => Promise<void>
  reset: () => void
  provide: (key?: InjectionKey<UseListReturn<Data>>) => void
}

export type PaginationData<Item = unknown> = {
  items: Item[]
  total: number
}
