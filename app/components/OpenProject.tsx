import { NButton, useLoadingBar } from "naive-ui"
import { defineComponent } from "vue"
import { projectOpenUnity } from "~/helper/index.ts"

export default defineComponent({
  props: { path: String, unityPath: String, name: String },
  setup(props) {
    let starting = $ref(false)
    const loadingBar = useLoadingBar()
    function openProject() {
      starting = true
      loadingBar.start()
      projectOpenUnity(props.path!, props.unityPath!)
        .then(() => {
          starting = false
          loadingBar.finish()
        })
        .catch(() => loadingBar.error())
    }
    return () => (
      <NButton type="primary" onClick={openProject} disabled={starting}>
        Open Project
      </NButton>
    )
  }
})
