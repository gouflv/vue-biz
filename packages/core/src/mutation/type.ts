import type { AxiosRequestConfig } from 'axios'

export type UseMutationProps<Params = unknown> = {
  mutationFn: (context: { params: Params; config: AxiosRequestConfig }) => Promise<unknown>
  onMutate?: () => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}
