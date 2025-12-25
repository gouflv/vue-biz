import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMutation } from './useMutation'

describe('useMutation - Basic functionality', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const mutation = useMutation({ mutationFn: mockMutationFn })
    expect(mutation.isPending.value).toBe(false)
    expect(mutation.error.value).toBe(null)
  })

  it('should call mutationFn with correct params', async () => {
    mockMutationFn.mockResolvedValue(undefined)
    const mutation = useMutation({ mutationFn: mockMutationFn })
    const testParams = { id: 123, name: 'test' }
    await mutation.mutate(testParams)
    await flushPromises()
    expect(mockMutationFn).toHaveBeenCalledTimes(1)
    expect(mockMutationFn).toHaveBeenCalledWith({
      params: testParams,
      config: expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
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
    const mutation = useMutation({ mutationFn: mockMutationFn })
    expect(mutation.isPending.value).toBe(false)
    const mutatePromise = mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.isPending.value).toBe(true)
    resolveFn!(undefined)
    await mutatePromise
    await flushPromises()
    expect(mutation.isPending.value).toBe(false)
  })
})

describe('useMutation - Success flow', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call onMutate before mutation', async () => {
    const onMutate = vi.fn()
    const mutation = useMutation({
      mutationFn: mockMutationFn,
      onMutate,
    })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(onMutate).toHaveBeenCalledTimes(1)
    expect(onMutate).toHaveBeenCalledBefore(mockMutationFn)
  })

  it('should call onSuccess after successful mutation', async () => {
    const onSuccess = vi.fn()
    const mutation = useMutation({
      mutationFn: mockMutationFn,
      onSuccess,
    })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(mockMutationFn).toHaveBeenCalledBefore(onSuccess)
  })

  it('should clear error on successful mutation', async () => {
    const mutation = useMutation({
      mutationFn: mockMutationFn,
    })
    // First mutation fails
    mockMutationFn.mockRejectedValueOnce(new Error('First error'))
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.error.value).toBeInstanceOf(Error)
    // Second mutation succeeds
    mockMutationFn.mockResolvedValueOnce(undefined)
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.error.value).toBe(null)
  })
})

describe('useMutation - Error handling', () => {
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
    const mutation = useMutation({ mutationFn: mockMutationFn })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.error.value).toBe(testError)
  })

  it('should call onError callback when mutation fails', async () => {
    const testError = new Error('Mutation failed')
    const onError = vi.fn()
    mockMutationFn.mockRejectedValue(testError)
    const mutation = useMutation({
      mutationFn: mockMutationFn,
      onError,
    })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(testError)
  })

  it('should set isPending to false after error', async () => {
    mockMutationFn.mockRejectedValue(new Error('Mutation failed'))
    const mutation = useMutation({ mutationFn: mockMutationFn })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.isPending.value).toBe(false)
  })

  it('should log error to console', async () => {
    const testError = new Error('Mutation failed')
    mockMutationFn.mockRejectedValue(testError)
    const mutation = useMutation({ mutationFn: mockMutationFn })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(console.error).toHaveBeenCalledWith(testError)
  })
})

describe('useMutation - Concurrent mutations', () => {
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
    const mutation = useMutation({ mutationFn: mockMutationFn })
    const firstMutate = mutation.mutate({ test: 'first' })
    await flushPromises()
    expect(mutation.isPending.value).toBe(true)
    // Try to call mutate again while first is still pending
    await mutation.mutate({ test: 'second' })
    await flushPromises()
    // Should only have been called once
    expect(mockMutationFn).toHaveBeenCalledTimes(1)
    resolveFn!(undefined)
    await firstMutate
    await flushPromises()
  })
})

describe('useMutation - Request cancellation', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should pass AbortSignal to mutationFn', async () => {
    mockMutationFn.mockResolvedValue(undefined)
    const mutation = useMutation({ mutationFn: mockMutationFn })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mockMutationFn).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      }),
    )
  })

  it('should create new AbortController for each mutation', async () => {
    const signals: AbortSignal[] = []
    mockMutationFn.mockImplementation(({ config }) => {
      signals.push(config.signal)
      return Promise.resolve(undefined)
    })
    const mutation = useMutation({ mutationFn: mockMutationFn })
    await mutation.mutate({ test: 'first' })
    await flushPromises()
    await mutation.mutate({ test: 'second' })
    await flushPromises()
    expect(signals).toHaveLength(2)
    expect(signals[0]).not.toBe(signals[1])
  })
})

describe('useMutation - Edge cases', () => {
  let mockMutationFn: any

  beforeEach(() => {
    mockMutationFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should handle mutationFn that resolves immediately', async () => {
    mockMutationFn.mockResolvedValue(undefined)
    const mutation = useMutation({ mutationFn: mockMutationFn })
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.isPending.value).toBe(false)
    expect(mutation.error.value).toBe(null)
    expect(mockMutationFn).toHaveBeenCalledTimes(1)
  })

  it('should handle mutationFn that rejects immediately', async () => {
    const testError = new Error('Immediate error')
    mockMutationFn.mockRejectedValue(testError)
    const mutation = useMutation({ mutationFn: mockMutationFn })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await mutation.mutate({ test: 'data' })
    await flushPromises()
    expect(mutation.isPending.value).toBe(false)
    expect(mutation.error.value).toBe(testError)
    expect(mockMutationFn).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })
})
