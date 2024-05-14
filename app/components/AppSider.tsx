import { defineComponent } from "vue"
import { type MenuOption, NIcon, NMenu } from "naive-ui"
import { RouterLink, useRouter } from "vue-router"
import {
  LicenseThirdParty,
  Catalog,
  ListBoxes,
  ModelAlt,
  Settings
} from "@vicons/carbon"
import { useToggle } from "@vueuse/core"
import { useDark } from "~/helper/index.ts"

const options: MenuOption[] = [
  {
    key: "projects",
    label: () => <RouterLink to="/projects">Projects</RouterLink>,
    icon: () => (
      <NIcon>
        <ListBoxes />
      </NIcon>
    )
  },
  {
    key: "repositories",
    label: () => <RouterLink to="/repositories">Repositories</RouterLink>,
    icon: () => (
      <NIcon>
        <ModelAlt />
      </NIcon>
    )
  },
  {
    key: "logs",
    label: () => <RouterLink to="/logs">Logs</RouterLink>,
    icon: () => (
      <NIcon>
        <Catalog />
      </NIcon>
    )
  },
  {
    key: "credits",
    label: () => <RouterLink to="/credits">Credits</RouterLink>,
    icon: () => (
      <NIcon>
        <LicenseThirdParty />
      </NIcon>
    )
  },
  {
    key: "settings",
    label: () => "Settings",
    icon: () => (
      <NIcon>
        <Settings />
      </NIcon>
    )
  }
]

export default defineComponent({
  props: { collapsed: Boolean, width: Number },
  setup(props) {
    const router = useRouter()
    const isDark = useDark()
    const themeToggle = useToggle(isDark)
    let currentRoute = $computed(() => {
      let name = router.currentRoute.value.name
      if (name === "projects-manage") return "projects"
      return name
    })

    return () => (
      <NMenu
        class="max-h-[calc(100vh-60px)] overflow-y-auto "
        options={options}
        collapsed={props.collapsed}
        value={currentRoute?.toString()}
        collapsedWidth={64}
        collapsedIconSize={22}
        onUpdate:value={v => {
          if (v === "settings") themeToggle()
        }}
      />
    )
  }
})
