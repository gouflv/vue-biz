import { injectLocal, provideLocal } from '@vueuse/core'
import axios, { type AxiosInstance } from 'axios'
import { defaultsDeep } from 'lodash-es'
import type { DeepPartial } from 'utility-types'
import { defineComponent, type PropType, type SlotsType } from 'vue'

export type Config = {
  request: {
    instance: AxiosInstance
  }
}

export type ConfigProps = DeepPartial<Config>

const ConfigProviderInjectionKey = 'VueBizConfigProvider'

export const DefaultConfig: Config = {
  request: {
    instance: axios.create(),
  },
}

function useConfig() {
  const injected = injectLocal<Config>(ConfigProviderInjectionKey)
  if (!injected) throw new Error('should provide config first')
  return injected
}

function provideConfig(props?: ConfigProps) {
  provideLocal(ConfigProviderInjectionKey, defaultsDeep(props, DefaultConfig))
}

const ConfigProvider = defineComponent({
  name: 'ConfigProvider',
  props: {
    config: {
      type: Object as PropType<ConfigProps>,
    },
  },
  slots: Object as SlotsType<{
    default(): any
  }>,
  setup(props, { slots }) {
    provideConfig(props.config)

    return () => slots.default?.()
  },
})

export { ConfigProvider, useConfig }
