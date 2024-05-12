import { defineComponent } from "vue"
import {
  type DataTableColumns,
  useDialog,
  NDataTable,
  NEmpty,
  NEl,
  NButton,
  NTooltip
} from "naive-ui"
import {
  type TauriRepositoriesInfo,
  environmentRepositoriesInfo,
  environmentShowRepository,
  environmentHideRepository,
  environmentRemoveRepository,
  addRemoteRepoDialog
} from "~/helper/index.ts"
import PageLayout from "~/layout/PageLayout.tsx"
import { SubtractAlt, Renew } from "@vicons/carbon"

interface repository {
  id: string
  displayName: string
  url: string
  enabled: boolean
}

function headerExtra(loadRepos: () => void) {
  return () => (
    <div class="flex gap-3">
      <NTooltip trigger="hover" placement="bottom" keepAliveOnHover={false}>
        {{
          default: () => <>Refresh repositories</>,
          trigger: () => (
            <NButton text onClick={() => loadRepos()} class="flex">
              {{ icon: () => <Renew /> }}
            </NButton>
          )
        }}
      </NTooltip>
      <NButton
        type="primary"
        size="small"
        onClick={addRemoteRepoDialog(loadRepos)}
        class="flex"
      >
        Add repository
      </NButton>
    </div>
  )
}

export default defineComponent({
  setup() {
    let loading = $ref(true)
    let reposInfo = $ref<TauriRepositoriesInfo>()
    let enabledRepos = $ref<string[]>([])
    let repos = $computed(() =>
      reposInfo?.user_repositories.map(
        repo =>
          ({
            id: repo.id,
            displayName: repo.display_name,
            url: repo.url,
            enabled: enabledRepos.includes(repo.id)
          } as repository)
      )
    )
    const dialog = useDialog()
    function loadRepos() {
      environmentRepositoriesInfo()
        .finally(() => (loading = false))
        .then(info => {
          enabledRepos = info.user_repositories
            .filter(r => !info.hidden_user_repositories.includes(r.id))
            .map(r => r.id)
          reposInfo = info
        })
    }
    function handleChecked(keys?: string[]) {
      const diffHide = enabledRepos.filter(x => !keys?.includes(x))
      const diffShow = keys?.filter(x => !enabledRepos.includes(x))
      Promise.all(
        (diffShow?.map(id => environmentShowRepository(id)) ?? []).concat(
          diffHide.map(id => environmentHideRepository(id))
        )
      ).then(() => loadRepos())
    }
    loadRepos()
    function removeRepo(repo: repository) {
      dialog.warning({
        title: "Remove repository",
        content: () => (
          <>
            <span>Are you sure you want to remove the repository </span>
            <b>{repo.displayName}</b>
            <span>?</span>
          </>
        ),
        positiveText: "Remove",
        negativeText: "Cancel",
        onPositiveClick() {
          loading = true
          environmentRemoveRepository(repo.id)
            .finally(() => (loading = false))
            .then(() => loadRepos())
        }
      })
    }

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
            <NEl style={{ color: "var(--text-color-3)" }}>{repo.id}</NEl>
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
          <div class="flex flex-col items-center">
            <NTooltip trigger="hover" placement="left" keepAliveOnHover={false}>
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
              loading={loading}
              data={repos}
              rowKey={(r: repository) => r.id}
              checkedRowKeys={enabledRepos}
              onUpdate:checkedRowKeys={keys => handleChecked(keys as string[])}
              size="small"
            >
              {{ empty: () => <NEmpty>No repositories found</NEmpty> }}
            </NDataTable>
          ),
          headerExtra: headerExtra(loadRepos)
        }}
      </PageLayout>
    )
  }
})
