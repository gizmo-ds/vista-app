import { defineComponent } from "vue"
import {
  type DataTableColumns,
  useDialog,
  NDataTable,
  NEmpty,
  NButton,
  NTooltip,
  useThemeVars
} from "naive-ui"
import {
  environmentShowRepository,
  environmentHideRepository,
  environmentRemoveRepository,
  addRemoteRepoDialog,
  bbcode2element
} from "~/helper/index.ts"
import PageLayout from "~/layout/PageLayout.tsx"
import { SubtractAlt, Renew } from "@vicons/carbon"
import { useRepositoryStore } from "~/store/index.ts"

interface repository {
  id: string
  displayName: string
  url: string
  enabled: boolean
}

function headerExtra() {
  const repositoryStore = useRepositoryStore()
  return () => (
    <div class="flex gap-3">
      <NTooltip trigger="hover" placement="bottom" keepAliveOnHover={false}>
        {{
          default: () => "Refresh repositories",
          trigger: () => (
            <NButton text onClick={repositoryStore.loadRepos} class="flex">
              {{ icon: () => <Renew /> }}
            </NButton>
          )
        }}
      </NTooltip>
      <NButton
        type="primary"
        size="small"
        onClick={addRemoteRepoDialog()}
        class="flex"
      >
        Add repository
      </NButton>
    </div>
  )
}

export default defineComponent({
  setup() {
    const repositoryStore = useRepositoryStore()
    const dialog = useDialog()
    function handleChecked(keys?: string[]) {
      const diffHide =
        repositoryStore.enabledRepos?.filter(x => !keys?.includes(x)) ?? []
      const diffShow =
        keys?.filter(x => !repositoryStore.enabledRepos?.includes(x)) ?? []
      Promise.all(
        (diffShow?.map(id => environmentShowRepository(id)) ?? []).concat(
          diffHide.map(id => environmentHideRepository(id))
        )
      ).then(repositoryStore.loadRepos)
    }
    function removeRepo(repo: repository) {
      const elements = bbcode2element(
        "Are you sure you want to remove the repository [b]$1[/b]?",
        [repo.displayName]
      )
      dialog.warning({
        title: "Remove repository",
        content: () => elements,
        positiveText: "Remove",
        negativeText: "Cancel",
        onPositiveClick() {
          repositoryStore.loading = true
          environmentRemoveRepository(repo.id)
            .finally(() => (repositoryStore.loading = false))
            .then(repositoryStore.loadRepos)
        }
      })
    }
    const theme = useThemeVars()

    const columns: DataTableColumns<repository> = [
      {
        width: 50,
        type: "selection"
      },
      {
        key: "displayName",
        title: "Name",
        ellipsis: true,
        render: repo => (
          <div class="flex flex-col">
            <div class="font-bold text-size-4">{repo.displayName}</div>
            <span style={{ color: theme.value.textColor3 }}>{repo.id}</span>
          </div>
        )
      },
      {
        key: "url",
        title: "URL",
        ellipsis: true
      },
      {
        key: "actions",
        width: "5rem",
        render: repo => (
          <div class="flex flex-col">
            <NTooltip trigger="hover" keepAliveOnHover={false}>
              {{
                default: () => "Remove repository",
                trigger: () => (
                  <NButton text type="error" onClick={() => removeRepo(repo)}>
                    {{ icon: () => <SubtractAlt /> }}
                  </NButton>
                )
              }}
            </NTooltip>
          </div>
        )
      }
    ]

    return () => (
      <PageLayout title="Repositories">
        {{
          default: () => (
            <NDataTable
              columns={columns}
              loading={repositoryStore.loading}
              data={repositoryStore.repositories ?? []}
              rowKey={(r: repository) => r.id}
              checkedRowKeys={repositoryStore.enabledRepos}
              onUpdate:checkedRowKeys={keys => handleChecked(keys as string[])}
              size="small"
            >
              {{ empty: () => <NEmpty>No repositories found</NEmpty> }}
            </NDataTable>
          ),
          headerExtra: headerExtra()
        }}
      </PageLayout>
    )
  }
})
