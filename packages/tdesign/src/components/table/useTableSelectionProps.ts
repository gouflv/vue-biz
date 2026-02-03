import { clone } from 'lodash-es'
import type { SelectOptions, TableProps } from 'tdesign-vue-next'
import { computed, ref } from 'vue'

export function useTableSelectionProps<T>(rowKey = 'id') {
  const selection = ref<T[]>([])

  const selectedKeys = computed(() => selection.value.map((it: any) => it[rowKey]))

  function onSelectChange(selectedRowKeys: Array<string | number>, options: SelectOptions<any>) {
    selection.value = clone(options.selectedRowData)
  }

  const tableProps = computed(
    () =>
      ({
        rowSelectionType: 'multiple',
        selectedRowKeys: selectedKeys.value,
        onSelectChange,
      }) satisfies Partial<TableProps<any>>,
  )

  return {
    selection,
    tableProps,
  }
}
