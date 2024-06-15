import { type PropType, defineComponent } from "vue"
import type { TauriProjectDetails } from "~/helper/index.ts"

export default defineComponent({
  props: {
    details: Object as PropType<TauriProjectDetails>
  },
  setup(props) {
    console.log(props.details?.installed_packages)
    return () => <div>{props.details?.unity_str}</div>
  }
})
