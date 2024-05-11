import { defineComponent } from "vue"
import { useDialog, useNotification, NText } from "naive-ui"
import { open } from "@tauri-apps/api/shell"
import { useClipboard } from "@vueuse/core"

export default defineComponent({
  props: { url: String },
  setup(props, { slots }) {
    const dialog = useDialog()
    const notification = useNotification()
    const { copy, copied, isSupported } = $(useClipboard({ source: props.url }))

    function copyUrl() {
      if (!isSupported)
        return notification.error({ content: "Copy is not supported" })
      copy().then(
        () =>
          copied &&
          notification.success({
            content: "Copied to clipboard",
            duration: 2000
          })
      )
    }
    function handler() {
      if (!props.url) return
      dialog.success({
        title: "Open External Link",
        content: () => (
          <p>
            Do you want to open the following link?
            <NText code>{props.url}</NText>
          </p>
        ),
        showIcon: false,
        positiveText: "Open",
        onPositiveClick: () => open(props.url!),
        negativeText: "Copy",
        onNegativeClick: () => copyUrl()
      })
    }
    return () => <span onClick={handler}>{slots.default?.()}</span>
  }
})
