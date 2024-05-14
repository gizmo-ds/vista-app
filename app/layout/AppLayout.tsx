import { defineComponent } from "vue"
import { NLayout, NLayoutSider } from "naive-ui"
import { useLocalStorage } from "@vueuse/core"
import AppSider from "~/components/AppSider"

export default defineComponent({
  setup() {
    let siderCollapsed = $(useLocalStorage("app-sider-collapsed", false))
    const siderWidth = $computed(() => (siderCollapsed ? 64 : 200))
    return () => (
      <NLayout has-sider position="absolute" class="h-screen">
        <NLayoutSider
          bordered
          collapse-mode="width"
          collapsedWidth={64}
          width={200}
          showTrigger
          collapsed={siderCollapsed}
          onCollapse={() => (siderCollapsed = true)}
          onExpand={() => (siderCollapsed = false)}
        >
          <AppSider collapsed={siderCollapsed} width={siderWidth - 1} />
        </NLayoutSider>
        <NLayout>
          <router-view></router-view>
        </NLayout>
      </NLayout>
    )
  }
})
