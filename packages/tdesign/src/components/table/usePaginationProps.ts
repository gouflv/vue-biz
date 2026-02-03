import { type UseListReturn } from '@vue-biz/core'
import type { PageInfo, PaginationProps } from 'tdesign-vue-next'
import { computed } from 'vue'

export function usePaginationProps(list: UseListReturn, props?: Partial<PaginationProps>) {
  const { current, pageSize, total } = list

  return computed(
    () =>
      ({
        // Tdesign's pagination is 1-based index
        current: current.value + 1,
        pageSize: pageSize.value,
        total: total.value,
        pageSizeOptions: [10, 20, 50, 100],
        maxPageBtn: 6,
        // showJumper: computed(() => true),
        onChange: (page: PageInfo) => {
          current.value = page.current - 1
          pageSize.value = page.pageSize
        },
        ...props,
      }) satisfies PaginationProps,
  )
}
