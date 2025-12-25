import { useConfig } from '../config'

/**
 * useRequest is a simple wrapper around useConfig to get the request instance.
 *
 * Note: The request instance will not be reactive if the config is changed.
 */
export function useRequest() {
  const config = useConfig()
  return config.request.instance
}
