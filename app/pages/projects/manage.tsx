import { defineComponent, ref, computed } from "vue"
import { NButton, NButtonGroup } from "naive-ui"
import { useRoute } from "vue-router"
import PageLayout from "@/app/layout/PageLayout"
import {
  type TauriProjectDetails,
  type TauriRepositoriesInfo,
  projectDetails,
  environmentRepositoriesInfo,
  utilOpen
} from "~/helper/index.ts"
import OpenProject from "~/components/OpenProject.tsx"
import { useUnityStore } from "@/app/store"

interface repository {
  id: string
  displayName: string
  url: string
  enabled: boolean
}

const detailsRef = ref<TauriProjectDetails>()
const reposInfoRef = ref<TauriRepositoriesInfo>()
const reposRef = computed(() =>
  reposInfoRef.value?.user_repositories.map(
    repo =>
      ({
        id: repo.id,
        displayName: repo.display_name,
        url: repo.url,
        enabled: !reposInfoRef.value?.hidden_user_repositories.includes(repo.id)
      } as repository)
  )
)

function headerExtra(name: string, path: string, unityVersion: string) {
  const unityStore = useUnityStore()
  const unityPath = computed(
    () => unityStore.unityVersions.find(v => v.version === unityVersion)?.path
  )
  return () => (
    <div class="mr-2">
      <NButtonGroup size="small">
        <OpenProject path={path} unityPath={unityPath.value} name={name} />
        <NButton onClick={() => utilOpen(path)}>Open Folder</NButton>
        <NButton>Backup</NButton>
      </NButtonGroup>
    </div>
  )
}

function manageRender(path: string) {
  projectDetails(path).then(r => {
    detailsRef.value = r
    console.log(r)
  })
  environmentRepositoriesInfo().then(r => {
    reposInfoRef.value = r
    console.log(r)
  })

  return () => (
    <div class="flex flex-col gap-3">
      <div>Located at: {path}</div>
      <div>{JSON.stringify(reposRef.value, null, 2)}</div>
    </div>
  )
}

export default defineComponent({
  setup() {
    const route = useRoute()
    const { name, path, unityVersion } = route.query as Record<string, string>

    return () => (
      <PageLayout title={name} hasBack={true}>
        {{
          default: manageRender(path),
          headerExtra: headerExtra(name, path, unityVersion)
        }}
      </PageLayout>
    )
  }
})
