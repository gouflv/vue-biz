import type { AxiosRequestConfig } from 'axios'
import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'

export type Mode = 'add' | 'edit'

export type EditFetchFnContext<Params> = {
  /**
   * Fetch parameters, comes from `edit(params)` method
   */
  params?: Params

  /**
   * Fetch config
   */
  config: AxiosRequestConfig
}

export type EditMutationFnContext<FormData> = {
  mode: Mode
  isEdit: boolean
  data: FormData
}

export type UseEditProps<FormData, Params> = {
  /**
   * Used to initialize form data in 'add' mode
   */
  initialData?: MaybeRefOrGetter<Partial<FormData>>

  /**
   * Fetch function to get data for 'edit' mode
   */
  fetchFn?: (context: EditFetchFnContext<Params>) => Promise<FormData>

  /**
   * Mutation function to submit form data, call by mutate()
   */
  mutationFn?: (context: EditMutationFnContext<FormData>) => Promise<unknown>

  onMutation?: () => void

  /**
   * Callback when mutation is successful
   */
  onSuccess?: (response?: unknown) => void

  onError?: (error: Error) => void
}

export type UseEditReturn<FormData = unknown, Params = FormData> = {
  open: Ref<boolean>
  mode: Ref<Mode>
  error: Ref<Error | null>
  isFetching: Ref<boolean>
  isFetched: Ref<boolean>
  isPending: Ref<boolean>
  data: Ref<FormData>
  reset(): void
  add(): void
  edit(params?: Params): Promise<void>
  mutate(): Promise<void>
  provide(key?: InjectionKey<UseEditReturn<FormData, Params>>): void
}
