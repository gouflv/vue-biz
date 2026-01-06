import type { UseListReturn } from '@vue-biz/core'
import type { TableProps } from 'tdesign-vue-next'
import { computed, type Ref } from 'vue'
import { usePaginationProps } from './usePaginationProps'
import { useTableSelectionProps } from './useTableSelectionProps'

const PAGINATION_HEIGHT = 64

export function useTable<T = unknown>(
  list: UseListReturn<T>,
  options: {
    rowKey?: string
    height?: Ref<number>
    pagination?: boolean
    paginationHeight?: number
  },
) {
  const rowKey = options.rowKey || 'id'
  const height = options.height
  const showPager = options.pagination ?? true
  const paginationHeight = options.paginationHeight || PAGINATION_HEIGHT

  const pagination = usePaginationProps(list)

  const { selection, tableProps: tableSelectionProps } = useTableSelectionProps<T>(rowKey)

  const totalContent = () => {
    const total = `共 ${list.total.value} 条数据`

    const selectedCount = selection.value.length ? `，已选择 ${selection.value.length} 条` : ''

    return (
      <div class="t-pagination__total">
        {total}
        {selectedCount && (
          <>
            {selectedCount}
            <a
              class="link ml-3"
              onClick={() => {
                selection.value = []
              }}
            >
              清空选择
            </a>
          </>
        )}
      </div>
    )
  }

  const tableProps = computed(
    () =>
      ({
        rowKey,
        data: list.data.value,
        loading: list.isPending.value,
        maxHeight: height ? height.value - (showPager ? paginationHeight : 0) : undefined,
        hover: true,
        pagination: showPager && {
          ...pagination.value,
          totalContent,
        },
        ...tableSelectionProps.value,
      }) as TableProps,
  )

  return {
    tableProps,
    selection,
  }
}
