import { defineComponent } from "vue"
import {
  NButton,
  NButtonGroup,
  NTooltip,
  NCard,
  NCheckbox,
  NText
} from "naive-ui"
import { useRoute } from "vue-router"
import { Folder, DataBackup } from "@vicons/carbon"
import PageLayout from "@/app/layout/PageLayout"
import {
  type TauriProjectDetails,
  projectDetails,
  utilOpen
} from "~/helper/index.ts"
import OpenProject from "~/components/OpenProject.tsx"
import {
  useUnityStore,
  useRepositoryStore,
  usePackageStore
} from "~/store/index.ts"
import PMList from "@/app/components/PMList"

const HeaderExtra = defineComponent({
  props: {
    name: String,
    path: String,
    unityVersion: String
  },
  setup(props) {
    const unityStore = useUnityStore()
    const unityVersions = $computed(() => unityStore.unityVersions)
    const unityPath = $computed(
      () => unityVersions.find(v => v.version === props.unityVersion)?.path
    )
    return () => (
      <div class="mr-2">
        <NButtonGroup size="small">
          <OpenProject
            path={props.path}
            unityPath={unityPath}
            name={props.name}
            showIcon
          />
          <NTooltip>
            {{
              trigger: () => (
                <NButton
                  onClick={() => utilOpen(props.path!)}
                  renderIcon={() => <Folder />}
                />
              ),
              default: () => "Reveal in File Explorer"
            }}
          </NTooltip>
          <NTooltip>
            {{
              trigger: () => <NButton renderIcon={() => <DataBackup />} />,
              default: () => "Create Backup"
            }}
          </NTooltip>
        </NButtonGroup>
      </div>
    )
  }
})

const Manage = defineComponent({
  props: {
    path: String,
    name: String,
    unityVersion: String
  },
  setup(props) {
    const packageStore = usePackageStore()
    if (packageStore.packages.length === 0) packageStore.loadPackages()
    const repositoryStore = useRepositoryStore()
    let details = $ref<TauriProjectDetails>()
    projectDetails(props.path!).then(v => (details = v))

    return () => (
      <div class="flex flex-col gap-2">
        <NCard>
          <div>
            Located at: <NText code>{props.path}</NText>
          </div>
          <NCheckbox
            checked={repositoryStore.showPrereleasePackages}
            onUpdate:checked={v => (repositoryStore.showPrereleasePackages = v)}
          >
            Show Pre-release Packages
          </NCheckbox>
        </NCard>
        <NCard>
          <PMList details={details} />
        </NCard>
      </div>
    )
  }
})

export default defineComponent({
  setup() {
    const route = useRoute()
    const { name, path, unityVersion } = route.query as Record<string, string>
    return () => (
      <PageLayout title={name} hasBack={true} subtitle={path}>
        {{
          default: () => (
            <Manage path={path} name={name} unityVersion={unityVersion} />
          ),
          headerExtra: () => (
            <HeaderExtra name={name} path={path} unityVersion={unityVersion} />
          )
        }}
      </PageLayout>
    )
  }
})
