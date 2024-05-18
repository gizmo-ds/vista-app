import { defineComponent } from "vue"
import { type MenuOption, NIcon, NMenu } from "naive-ui"
import { RouterLink, useRouter } from "vue-router"
import { Catalog, ListBoxes, Branch, Settings } from "@vicons/carbon"

interface SiderOption {
  name: string
  label: string
  icon: JSX.Element
}

const siderOptions: SiderOption[] = [
  { name: "projects", label: "Projects", icon: <ListBoxes /> },
  { name: "repositories", label: "Repositories", icon: <Branch /> },
  { name: "logs", label: "Logs", icon: <Catalog /> },
  { name: "settings", label: "Settings", icon: <Settings /> }
]

const options: MenuOption[] = siderOptions.map(option => ({
  key: option.name,
  label: () => (
    <RouterLink to={{ name: option.name }}>{option.label}</RouterLink>
  ),
  icon: () => <NIcon>{option.icon}</NIcon>
}))

export default defineComponent({
  props: { collapsed: Boolean, width: Number },
  setup(props) {
    const router = useRouter()
    let currentMenu = $computed(() => {
      let name = router.currentRoute.value.name
      if (name === "projects-manage") return "projects"
      if (name === "settings-licenses") return "settings"
      return name
    })

    return () => (
      <NMenu
        options={options}
        collapsed={props.collapsed}
        value={currentMenu?.toString()}
        collapsedWidth={64}
        collapsedIconSize={22}
      />
    )
  }
})
