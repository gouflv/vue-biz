import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, ref } from 'vue'
import type { PaginationData } from './type'
import { useInjectedList, useList } from './useList'

type MockItem = { id: number; name?: string }

function createMockData(count: number, total: number): PaginationData<MockItem> {
  return {
    items: Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
    total,
  }
}

function mountWithList<T>(setup: () => T) {
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

describe('useList - Basic functionality', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    expect(result.pageSize.value).toBe(20)
    expect(result.current.value).toBe(0)
    expect(result.data.value).toEqual([])
    expect(result.total.value).toBe(0)
    expect(result.isPending.value).toBe(true)
    expect(result.error.value).toBe(null)
  })

  it('should auto fetch on mounted', async () => {
    mockFetchFn.mockResolvedValue(createMockData(2, 2))
    mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
  })

  it('should pass correct params to fetchFn', async () => {
    mockFetchFn.mockResolvedValue(createMockData(0, 0))
    const queryData = { keyword: 'test' }
    mountWithList(() => useList({ fetchFn: mockFetchFn, query: queryData, pageSize: 10 }))
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          pager: { current: 0, pageSize: 10 },
          query: queryData,
        },
        config: expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      }),
    )
  })

  it('should update data and total after successful fetch', async () => {
    const mockData = createMockData(3, 100)
    mockFetchFn.mockResolvedValue(mockData)
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.data.value).toEqual(mockData.items)
    expect(result.total.value).toBe(100)
    expect(result.isPending.value).toBe(false)
    expect(result.error.value).toBe(null)
  })
})

describe('useList - Pagination', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn().mockResolvedValue(createMockData(10, 100))
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should reset to page 0 when pageSize changes', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    mockFetchFn.mockClear()
    result.current.value = 2
    await flushPromises()
    mockFetchFn.mockClear()
    result.pageSize.value = 50
    await vi.waitFor(() => expect(mockFetchFn).toHaveBeenCalled(), { timeout: 300 })
    expect(result.current.value).toBe(0)
  })

  it('should trigger fetch when current changes', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    mockFetchFn.mockClear()
    result.current.value = 2
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          pager: expect.objectContaining({ current: 2 }),
        }),
      }),
    )
  })

  it('should debounce pageSize and query changes', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    mockFetchFn.mockClear()
    result.pageSize.value = 30
    result.pageSize.value = 40
    result.pageSize.value = 50
    await vi.waitFor(() => expect(mockFetchFn).toHaveBeenCalled(), { timeout: 300 })
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
  })

  it('should accept pageSize from props', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn, pageSize: 15 }))
    expect(result.pageSize.value).toBe(15)
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          pager: expect.objectContaining({ pageSize: 15 }),
        }),
      }),
    )
  })
})

describe('useList - Query parameters', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn().mockResolvedValue(createMockData(10, 100))
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should reset to page 0 when query changes', async () => {
    const query = ref({ keyword: 'old' })
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn, query }))
    await flushPromises()
    result.current.value = 3
    await flushPromises()
    mockFetchFn.mockClear()
    query.value = { keyword: 'new' }
    await vi.waitFor(() => expect(mockFetchFn).toHaveBeenCalled(), { timeout: 300 })
    expect(result.current.value).toBe(0)
  })

  it('should support reactive query', async () => {
    const query = ref({ keyword: 'test' })
    mountWithList(() => useList({ fetchFn: mockFetchFn, query }))
    await flushPromises()
    mockFetchFn.mockClear()
    query.value = { keyword: 'updated' }
    await vi.waitFor(() => expect(mockFetchFn).toHaveBeenCalled(), { timeout: 300 })
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          query: { keyword: 'updated' },
        }),
      }),
    )
  })

  it('should support computed query', async () => {
    const keyword = ref('initial')
    const query = computed(() => ({ keyword: keyword.value }))
    mountWithList(() => useList({ fetchFn: mockFetchFn, query }))
    await flushPromises()
    mockFetchFn.mockClear()
    keyword.value = 'changed'
    await vi.waitFor(() => expect(mockFetchFn).toHaveBeenCalled(), { timeout: 300 })
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          query: { keyword: 'changed' },
        }),
      }),
    )
  })

  it('should deep watch query changes', async () => {
    const query = ref({ filters: { status: 'active' } })
    mountWithList(() => useList({ fetchFn: mockFetchFn, query }))
    await flushPromises()
    mockFetchFn.mockClear()
    query.value.filters.status = 'inactive'
    await vi.waitFor(() => expect(mockFetchFn).toHaveBeenCalled(), { timeout: 300 })
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          query: { filters: { status: 'inactive' } },
        }),
      }),
    )
  })
})

describe('useList - Loading state', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set isPending to true when fetching', () => {
    mockFetchFn.mockImplementation(() => new Promise(() => {}))
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    expect(result.isPending.value).toBe(true)
  })

  it('should set isPending to false after fetch completes', async () => {
    mockFetchFn.mockResolvedValue(createMockData(10, 100))
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.isPending.value).toBe(false)
  })

  it('should compute isEmpty as true when no data and not loading', async () => {
    mockFetchFn.mockResolvedValue(createMockData(0, 0))
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.isEmpty.value).toBe(true)
    expect(result.isPending.value).toBe(false)
  })

  it('should compute isEmpty as false when has data', async () => {
    mockFetchFn.mockResolvedValue(createMockData(5, 100))
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.isEmpty.value).toBe(false)
  })
})

describe('useList - Error handling', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set error when fetchFn throws', async () => {
    const testError = new Error('Fetch failed')
    mockFetchFn.mockRejectedValue(testError)
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.error.value).toBe(testError)
  })

  it('should set isPending to false after error', async () => {
    mockFetchFn.mockRejectedValue(new Error('Fetch failed'))
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.isPending.value).toBe(false)
  })

  it('should clear previous error on new request', async () => {
    mockFetchFn.mockRejectedValueOnce(new Error('First error'))
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(result.error.value).toBeInstanceOf(Error)
    mockFetchFn.mockResolvedValue(createMockData(5, 100))
    result.refresh()
    expect(result.error.value).toBe(null)
  })
})

describe('useList - Enabled control', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn().mockResolvedValue(createMockData(10, 100))
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch when enabled is false', async () => {
    mountWithList(() => useList({ fetchFn: mockFetchFn, enabled: false }))
    await flushPromises()
    expect(mockFetchFn).not.toHaveBeenCalled()
  })

  it('should fetch when enabled changes from false to true', async () => {
    const enabled = ref(false)
    mountWithList(() => useList({ fetchFn: mockFetchFn, enabled }))
    await flushPromises()
    expect(mockFetchFn).not.toHaveBeenCalled()
    enabled.value = true
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
  })

  it('should enabled be true by default', async () => {
    mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalled()
  })

  it('should not fetch when manually calling refresh while enabled is false', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn, enabled: false }))
    await flushPromises()
    await result.refresh()
    await flushPromises()
    expect(mockFetchFn).not.toHaveBeenCalled()
  })
})

describe('useList - Request cancellation', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should abort previous request when new request starts', async () => {
    let firstAborted = false
    mockFetchFn.mockImplementation(({ config }) => {
      config.signal?.addEventListener('abort', () => {
        firstAborted = true
      })
      return new Promise((resolve) => setTimeout(() => resolve(createMockData(5, 100)), 100))
    })
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    result.refresh()
    await flushPromises()
    expect(firstAborted).toBe(true)
  })

  it('should abort request on component unmount', async () => {
    let aborted = false
    mockFetchFn.mockImplementation(({ config }) => {
      config.signal?.addEventListener('abort', () => {
        aborted = true
      })
      return new Promise((resolve) => setTimeout(() => resolve(createMockData(5, 100)), 100))
    })
    const component = defineComponent({
      setup() {
        return useList({ fetchFn: mockFetchFn })
      },
      template: '<div></div>',
    })
    const wrapper = mount(component)
    await flushPromises()
    wrapper.unmount()
    await flushPromises()
    expect(aborted).toBe(true)
  })
})

describe('useList - Methods', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn().mockResolvedValue(createMockData(10, 100))
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should refetch current page when calling refresh', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    result.current.value = 3
    await flushPromises()
    mockFetchFn.mockClear()
    await result.refresh()
    await flushPromises()
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
    expect(result.current.value).toBe(3)
  })

  it('should reset to page 0 and fetch when calling reset', async () => {
    const result = mountWithList(() => useList({ fetchFn: mockFetchFn }))
    await flushPromises()
    result.current.value = 5
    await flushPromises()
    mockFetchFn.mockClear()
    result.reset()
    await flushPromises()
    expect(result.current.value).toBe(0)
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          pager: expect.objectContaining({ current: 0 }),
        }),
      }),
    )
  })
})

describe('useList - Provide/Inject', () => {
  let mockFetchFn: any
  beforeEach(() => {
    mockFetchFn = vi.fn().mockResolvedValue(createMockData(10, 100))
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should provide and inject list instance', () => {
    let injectedResult: ReturnType<typeof useList> | null = null
    const component = defineComponent({
      setup() {
        const list = useList({ fetchFn: mockFetchFn })
        list.provide()
        return list
      },
      template: '<Child />',
      components: {
        Child: defineComponent({
          setup() {
            injectedResult = useInjectedList()
            return {}
          },
          template: '<div></div>',
        }),
      },
    })
    mount(component)
    expect(injectedResult).not.toBeNull()
    expect(injectedResult!.pageSize.value).toBe(20)
  })

  it('should throw error when inject without provide', () => {
    expect(() => {
      mountWithList(() => useInjectedList())
    }).toThrow('Should provide useList first')
  })

  it('should support custom injection key', () => {
    const customKey = Symbol('custom-list')
    let injectedResult: ReturnType<typeof useList> | null = null
    const component = defineComponent({
      setup() {
        const list = useList({ fetchFn: mockFetchFn })
        list.provide(customKey)
        return list
      },
      template: '<Child />',
      components: {
        Child: defineComponent({
          setup() {
            injectedResult = useInjectedList()
            return {}
          },
          template: '<div></div>',
        }),
      },
    })
    expect(() => mount(component)).toThrow('Should provide useList first')
  })
})
