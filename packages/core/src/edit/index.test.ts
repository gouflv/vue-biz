import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { useEdit, useInjectedEdit } from './useEdit'

function mountWithEdit<T>(setup: () => T) {
  let result: T | null = null
  const component = defineComponent({
    setup() {
      result = setup()
      return result
    },
    template: '<div></div>',
  })
  mount(component)
  return result!
}

describe('useEdit - Basic functionality', () => {
  it('should initialize with default state', () => {
    const edit = mountWithEdit(() => useEdit({}))
    expect(edit.open.value).toBe(false)
    expect(edit.mode.value).toBe('add')
    expect(edit.error.value).toBe(null)
    expect(edit.isFetching.value).toBe(false)
    expect(edit.isFetched.value).toBe(false)
    expect(edit.isPending.value).toBe(false)
  })

  it('should initialize data with initialData', () => {
    const initialData = { name: 'test', value: 123 }
    const edit = mountWithEdit(() => useEdit({ initialData }))
    expect(edit.data.value).toEqual(initialData)
    expect(edit.data.value).not.toBe(initialData) // Should be a clone
  })

  it('should update data when initialData changes', async () => {
    const initialData = ref({ name: 'first', value: 1 })
    const edit = mountWithEdit(() => useEdit({ initialData }))
    expect(edit.data.value).toEqual({ name: 'first', value: 1 })

    initialData.value = { name: 'second', value: 2 }
    await nextTick()
    expect(edit.data.value).toEqual({ name: 'second', value: 2 })
  })
})

describe('useEdit - Add mode', () => {
  it('should set mode to add and open dialog when calling add()', () => {
    const edit = mountWithEdit(() => useEdit({}))
    edit.add()
    expect(edit.mode.value).toBe('add')
    expect(edit.open.value).toBe(true)
  })

  it('should reset data to initialData when calling add()', () => {
    const initialData = { name: 'initial', value: 100 }
    const edit = mountWithEdit(() => useEdit({ initialData }))
    edit.data.value = { name: 'modified', value: 999 }

    // Call add() should reset
    edit.add()
    expect(edit.data.value).toEqual(initialData)
  })

  it('should not trigger fetch in add mode', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ name: 'fetched' })
    const edit = mountWithEdit(() => useEdit({ fetchFn }))

    edit.add()
    await flushPromises()

    expect(fetchFn).not.toHaveBeenCalled()
  })
})

describe('useEdit - Edit mode & Fetching', () => {
  let mockFetchFn: any

  beforeEach(() => {
    mockFetchFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set mode to edit and open dialog when calling edit()', async () => {
    mockFetchFn.mockResolvedValue({ name: 'data' })
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })

    expect(edit.mode.value).toBe('edit')
    expect(edit.open.value).toBe(true)
  })

  it('should call fetchFn with correct params', async () => {
    mockFetchFn.mockResolvedValue({ name: 'fetched' })
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))
    const testParams = { id: 123 }

    await edit.edit(testParams)
    await flushPromises()

    expect(mockFetchFn).toHaveBeenCalledTimes(1)
    expect(mockFetchFn).toHaveBeenCalledWith({
      params: testParams,
      config: expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    })
  })

  it('should update isFetching during fetch', async () => {
    let resolveFn: (value: unknown) => void
    mockFetchFn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    expect(edit.isFetching.value).toBe(false)

    const editPromise = edit.edit({ id: 1 })
    await flushPromises()
    expect(edit.isFetching.value).toBe(true)

    resolveFn!({ name: 'data' })
    await editPromise
    await flushPromises()
    expect(edit.isFetching.value).toBe(false)
  })

  it('should update data and isFetched after successful fetch', async () => {
    const fetchedData = { name: 'fetched', value: 999 }
    mockFetchFn.mockResolvedValue(fetchedData)
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })
    await flushPromises()

    expect(edit.data.value).toEqual(fetchedData)
    expect(edit.isFetched.value).toBe(true)
  })

  it('should reset data before fetching in edit mode', async () => {
    const initialData = { name: 'initial', value: 100 }
    mockFetchFn.mockResolvedValue({ name: 'fetched', value: 999 })
    const edit = mountWithEdit(() => useEdit({ initialData, fetchFn: mockFetchFn }))

    // Modify data
    edit.data.value = { name: 'modified', value: 500 }

    // Call edit() should reset first
    const editPromise = edit.edit({ id: 1 })
    expect(edit.data.value).toEqual(initialData)

    await editPromise
    await flushPromises()
    expect(edit.data.value).toEqual({ name: 'fetched', value: 999 })
  })
})

describe('useEdit - Fetch error handling', () => {
  let mockFetchFn: any

  beforeEach(() => {
    mockFetchFn = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should set error when fetchFn throws', async () => {
    const testError = new Error('Fetch failed')
    mockFetchFn.mockRejectedValue(testError)
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })
    await flushPromises()

    expect(edit.error.value).toBe(testError)
  })

  it('should set isFetching to false after error', async () => {
    mockFetchFn.mockRejectedValue(new Error('Fetch failed'))
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })
    await flushPromises()

    expect(edit.isFetching.value).toBe(false)
  })

  it('should log error to console', async () => {
    const testError = new Error('Fetch failed')
    mockFetchFn.mockRejectedValue(testError)
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })
    await flushPromises()

    expect(console.error).toHaveBeenCalledWith(testError)
  })
})

describe('useEdit - Mutation', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call mutationFn with correct params', async () => {
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))
    edit.data.value = { name: 'test', value: 123 }
    edit.mode.value = 'add'

    await edit.mutate()
    await flushPromises()

    expect(mockMutationFn).toHaveBeenCalledTimes(1)
    expect(mockMutationFn).toHaveBeenCalledWith({
      mode: 'add',
      isEdit: false,
      data: { name: 'test', value: 123 },
    })
  })

  it('should update isPending during mutation', async () => {
    let resolveFn: (value: unknown) => void
    mockMutationFn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))

    expect(edit.isPending.value).toBe(false)

    const mutatePromise = edit.mutate()
    await flushPromises()
    expect(edit.isPending.value).toBe(true)

    resolveFn!(undefined)
    await mutatePromise
    await flushPromises()
    expect(edit.isPending.value).toBe(false)
  })

  it('should call onMutation before mutation', async () => {
    const onMutation = vi.fn()
    const edit = mountWithEdit(() =>
      useEdit({
        mutationFn: mockMutationFn,
        onMutation,
      }),
    )

    await edit.mutate()
    await flushPromises()

    expect(onMutation).toHaveBeenCalledTimes(1)
    expect(onMutation).toHaveBeenCalledBefore(mockMutationFn)
  })

  it('should call onSuccess after successful mutation', async () => {
    const onSuccess = vi.fn()
    const mutationResult = { id: 1 }
    mockMutationFn.mockResolvedValue(mutationResult)
    const edit = mountWithEdit(() =>
      useEdit({
        mutationFn: mockMutationFn,
        onSuccess,
      }),
    )

    await edit.mutate()
    await flushPromises()

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith(mutationResult)
    expect(mockMutationFn).toHaveBeenCalledBefore(onSuccess)
  })

  it('should close dialog after successful mutation', async () => {
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))
    edit.open.value = true

    await edit.mutate()
    await flushPromises()

    expect(edit.open.value).toBe(false)
  })

  it('should pass correct isEdit flag based on mode', async () => {
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))

    // Test add mode
    edit.mode.value = 'add'
    await edit.mutate()
    await flushPromises()
    expect(mockMutationFn).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'add',
        isEdit: false,
      }),
    )

    // Test edit mode
    mockMutationFn.mockClear()
    edit.mode.value = 'edit'
    await edit.mutate()
    await flushPromises()
    expect(mockMutationFn).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'edit',
        isEdit: true,
      }),
    )
  })
})

describe('useEdit - Mutation error handling', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should set error when mutationFn throws', async () => {
    const testError = new Error('Mutation failed')
    mockMutationFn.mockRejectedValue(testError)
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))

    await edit.mutate()
    await flushPromises()

    expect(edit.error.value).toBe(testError)
  })

  it('should call onError callback when mutation fails', async () => {
    const testError = new Error('Mutation failed')
    const onError = vi.fn()
    mockMutationFn.mockRejectedValue(testError)
    const edit = mountWithEdit(() =>
      useEdit({
        mutationFn: mockMutationFn,
        onError,
      }),
    )

    await edit.mutate()
    await flushPromises()

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(testError)
  })

  it('should set isPending to false after error', async () => {
    mockMutationFn.mockRejectedValue(new Error('Mutation failed'))
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))

    await edit.mutate()
    await flushPromises()

    expect(edit.isPending.value).toBe(false)
  })

  it('should not close dialog after error', async () => {
    mockMutationFn.mockRejectedValue(new Error('Mutation failed'))
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))
    edit.open.value = true

    await edit.mutate()
    await flushPromises()

    expect(edit.open.value).toBe(true)
  })

  it('should log error to console', async () => {
    const testError = new Error('Mutation failed')
    mockMutationFn.mockRejectedValue(testError)
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))

    await edit.mutate()
    await flushPromises()

    expect(console.error).toHaveBeenCalledWith(testError)
  })
})

describe('useEdit - Concurrent operations', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should prevent concurrent mutations', async () => {
    let resolveFn: (value: unknown) => void
    mockMutationFn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )
    const edit = mountWithEdit(() => useEdit({ mutationFn: mockMutationFn }))

    const firstMutate = edit.mutate()
    await flushPromises()
    expect(edit.isPending.value).toBe(true)

    // Try to call mutate again while first is still pending
    await edit.mutate()
    await flushPromises()

    // Should only have been called once
    expect(mockMutationFn).toHaveBeenCalledTimes(1)

    resolveFn!(undefined)
    await firstMutate
    await flushPromises()
  })
})

describe('useEdit - Request cancellation', () => {
  let mockFetchFn: any
  let mockMutationFn: any

  beforeEach(() => {
    mockFetchFn = vi.fn()
    mockMutationFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should pass AbortSignal to fetchFn', async () => {
    mockFetchFn.mockResolvedValue({ name: 'data' })
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })
    await flushPromises()

    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      }),
    )
  })

  it('should abort fetch when dialog is closed', async () => {
    let capturedSignal: AbortSignal | null = null
    mockFetchFn.mockImplementation(({ config }) => {
      capturedSignal = config.signal
      return new Promise(() => {}) // Never resolves
    })
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    edit.edit({ id: 1 })
    await flushPromises()

    expect(capturedSignal?.aborted).toBe(false)

    edit.open.value = false
    await nextTick()

    expect(capturedSignal?.aborted).toBe(true)
  })

  it('should abort fetch on scope dispose', async () => {
    let capturedSignal: AbortSignal | null = null
    mockFetchFn.mockImplementation(({ config }) => {
      capturedSignal = config.signal
      return new Promise(() => {}) // Never resolves
    })

    const component = defineComponent({
      setup() {
        return useEdit({ fetchFn: mockFetchFn })
      },
      template: '<div></div>',
    })
    const wrapper = mount(component)
    const edit = wrapper.vm as any

    edit.edit({ id: 1 })
    await flushPromises()

    expect(capturedSignal?.aborted).toBe(false)

    wrapper.unmount()
    await nextTick()

    expect(capturedSignal?.aborted).toBe(true)
  })

  it('should create new AbortController for each fetch', async () => {
    const signals: AbortSignal[] = []
    mockFetchFn.mockImplementation(({ config }) => {
      signals.push(config.signal)
      return Promise.resolve({ name: 'data' })
    })
    const edit = mountWithEdit(() => useEdit({ fetchFn: mockFetchFn }))

    await edit.edit({ id: 1 })
    await flushPromises()
    await edit.edit({ id: 2 })
    await flushPromises()

    expect(signals).toHaveLength(2)
    expect(signals[0]).not.toBe(signals[1])
  })
})

describe('useEdit - Reset functionality', () => {
  it('should reset data to initialData when calling reset()', () => {
    const initialData = { name: 'initial', value: 100 }
    const edit = mountWithEdit(() => useEdit({ initialData }))

    // Modify data
    edit.data.value = { name: 'modified', value: 999 }
    expect(edit.data.value).toEqual({ name: 'modified', value: 999 })

    // Reset
    edit.reset()
    expect(edit.data.value).toEqual(initialData)
  })

  it('should automatically reset data when switching modes', async () => {
    const initialData = { name: 'initial', value: 100 }
    const mockFetchFn = vi.fn().mockResolvedValue({ name: 'fetched' })
    const edit = mountWithEdit(() => useEdit({ initialData, fetchFn: mockFetchFn }))

    // Modify data
    edit.data.value = { name: 'modified', value: 999 }

    // Switch to add mode - should reset
    edit.add()
    expect(edit.data.value).toEqual(initialData)

    // Modify again
    edit.data.value = { name: 'modified2', value: 888 }

    // Switch to edit mode - should reset
    await edit.edit({ id: 1 })
    // Before fetch completes, should be reset to initial
    expect(mockFetchFn).toHaveBeenCalled()
  })
})

describe('useEdit - Dependency injection', () => {
  it('should provide and inject with default key', () => {
    let injected: any
    const component = defineComponent({
      setup() {
        const edit = useEdit({})
        edit.provide()
        return edit
      },
      template: '<Child />',
      components: {
        Child: defineComponent({
          setup() {
            injected = useInjectedEdit()
            return {}
          },
          template: '<div></div>',
        }),
      },
    })
    const wrapper = mount(component)
    expect(injected).toBeTruthy()
    expect(injected.mode.value).toBe('add')
  })

  it('should work with custom injection key', () => {
    const customKey = Symbol('customEdit')
    let injected: any
    const component = defineComponent({
      setup() {
        const edit = useEdit({})
        edit.provide(customKey)
        return edit
      },
      template: '<Child />',
      components: {
        Child: defineComponent({
          setup() {
            injected = useInjectedEdit(customKey)
            return {}
          },
          template: '<div></div>',
        }),
      },
    })
    mount(component)
    expect(injected).toBeTruthy()
    expect(injected.mode.value).toBe('add')
  })

  it('should throw error when not provided', () => {
    expect(() => {
      mountWithEdit(() => useInjectedEdit())
    }).toThrow('Should provide useEdit first')
  })
})
