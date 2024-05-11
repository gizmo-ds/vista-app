import { defineComponent, type PropType } from "vue"
import { type TauriUserRepository } from "~/helper/index.ts"

export default defineComponent({
  props: { repo: Object as PropType<TauriUserRepository> },
  setup(props) {
    return () => <div>RepositorieItem: {props.repo?.display_name}</div>
  }
})
