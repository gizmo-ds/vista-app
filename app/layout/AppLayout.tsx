import { defineComponent } from "vue"
import { NLayout, NLayoutSider } from "naive-ui"
import AppSider from "@/app/components/AppSider"

export default defineComponent({
  setup() {
    let siderCollapsed = $ref(false)
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
