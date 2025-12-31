import { clone } from 'lodash-es'
import type { SelectOptions, TableProps } from 'tdesign-vue-next'
import { computed, ref } from 'vue'

export function useTableSelectionProps<T>(rowKey = 'id') {
  const selection = ref<T[]>([])

  const selectedKeys = computed(() => selection.value.map((it: any) => it[rowKey]))

  function onSelectChange(selectedRowKeys: (string | number)[], options: SelectOptions<T>) {
    selection.value = clone(options.selectedRowData)
  }

  const tableProps = computed(() => {
    return {
      rowSelectionType: 'multiple',
      selectedRowKeys: selectedKeys.value,
      onSelectChange,
    } as Partial<TableProps>
  })

  return {
    selection,
    tableProps,
  }
}
