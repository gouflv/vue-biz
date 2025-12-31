import type { FormInstanceFunctions } from 'tdesign-vue-next'
import { toValue, type MaybeRef } from 'vue'

export async function isValidAsync(form: MaybeRef<FormInstanceFunctions | undefined>) {
  const res = await toValue(form)?.validate()
  return res === true
}
