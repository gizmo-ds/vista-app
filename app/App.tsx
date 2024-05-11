import { defineComponent } from "vue"
import { useDark } from "@vueuse/core"
import {
  NConfigProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  NLayout,
  darkTheme,
  lightTheme
} from "naive-ui"
import AppLayout from "./layout/AppLayout.tsx"
import { listen } from "@tauri-apps/api/event"

export default defineComponent({
  setup() {
    const isDark = $(useDark())

    listen<string[]>("tauri://file-drop", event => {
      const files = event.payload
      console.log(files)
      if (!files || files.length === 0) return
    })

    return () => (
      <NConfigProvider
        theme={isDark ? darkTheme : lightTheme}
        style={{ colorScheme: isDark ? "dark" : "light" }}
      >
        <NNotificationProvider placement="bottom-right">
          <NDialogProvider>
            <NLoadingBarProvider>
              <NLayout class="h-screen max-h-screen">
                <AppLayout />
              </NLayout>
            </NLoadingBarProvider>
          </NDialogProvider>
        </NNotificationProvider>
      </NConfigProvider>
    )
  }
})
