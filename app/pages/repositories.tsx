import { type PropType, defineComponent } from "vue"
import {
  type DataTableColumns,
  useDialog,
  NDataTable,
  NEmpty,
  NButton,
  NTooltip,
  useThemeVars,
  NButtonGroup,
  NCheckbox
} from "naive-ui"
import { ModelAlt, SubtractAlt, Renew } from "@vicons/carbon"
import {
  environmentShowRepository,
  environmentHideRepository,
  environmentRemoveRepository,
  addRemoteRepoDialog,
  bbcode2element,
  toVersionString,
  compareVersion
} from "~/helper/index.ts"
import PageLayout from "~/layout/PageLayout.tsx"
import { usePackageStore, useRepositoryStore } from "~/store/index.ts"

interface repository {
  id: string
  displayName: string
  url: string
  enabled: boolean
}

const HeaderExtra = defineComponent({
  setup() {
    const repositoryStore = useRepositoryStore()
    return () => (
      <div class="flex gap-3 items-center">
        <NCheckbox
          checked={repositoryStore.showPrereleasePackages}
          onUpdate:checked={v => (repositoryStore.showPrereleasePackages = v)}
        >
          Show Pre-release Packages
        </NCheckbox>
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
})

const ShowPackages = defineComponent({
  props: { repo: Object as PropType<repository> },
  setup(props) {
    const repo = props.repo!
    const repositoryStore = useRepositoryStore()
    const packageStore = usePackageStore()
    const dialog = useDialog()

    async function showPackages() {
      if (packageStore.packages.length === 0) await packageStore.loadPackages()
      const pkgs = packageStore.packages
        .filter(
          pkg =>
            pkg.source !== "LocalUser" &&
            pkg.source.Remote.id === repo.id &&
            (!repositoryStore.showPrereleasePackages
              ? pkg.version.pre === ""
              : true)
        )
        .sort((a, b) => compareVersion(b.version, a.version))
        .sort((a, b) => a.name.localeCompare(b.name))

      console.log(repositoryStore.showPrereleasePackages)

      dialog.info({
        title: `Packages in ${repo.displayName}`,
        content: () => (
          <div class="flex flex-col gap-2">
            <div>
              Total: {pkgs.length} {pkgs.length === 1 ? "package" : "packages"}
            </div>
            <div class="max-h-16rem overflow-auto">
              {pkgs.map(pkg => (
                <li class="whitespace-nowrap">
                  <span class="font-bold">{pkg.display_name ?? pkg.name}</span>
                  <span class="pl-2">{toVersionString(pkg.version)}</span>
                </li>
              ))}
            </div>
          </div>
        )
      })
      console.log(pkgs)
    }
    return () => (
      <NTooltip>
        {{
          trigger: () => (
            <NButton
              secondary
              disabled={packageStore.loading}
              renderIcon={() => <ModelAlt />}
              onClick={showPackages}
            />
          ),
          default: () => "Show Packages"
        }}
      </NTooltip>
    )
  }
})

const RepositoriesTable = defineComponent({
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
        width: "15rem",
        render: repo => (
          <div class="flex flex-col w-full">
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
        width: "7rem",
        render: repo => (
          <NButtonGroup>
            <ShowPackages repo={repo} />
            <NTooltip>
              {{
                trigger: () => (
                  <NButton
                    secondary
                    type="error"
                    onClick={() => removeRepo(repo)}
                    renderIcon={() => <SubtractAlt />}
                  />
                ),
                default: () => "Remove Repository"
              }}
            </NTooltip>
          </NButtonGroup>
        )
      }
    ]

    return () => (
      <NDataTable
        columns={columns}
        loading={repositoryStore.loading}
        data={repositoryStore.repositories ?? []}
        rowKey={(r: repository) => r.id}
        checkedRowKeys={repositoryStore.enabledRepos ?? []}
        onUpdate:checkedRowKeys={keys => handleChecked(keys as string[])}
        size="small"
      >
        {{ empty: () => <NEmpty>No repositories found</NEmpty> }}
      </NDataTable>
    )
  }
})

export default defineComponent({
  setup() {
    return () => (
      <PageLayout title="Repositories">
        {{
          default: () => <RepositoriesTable />,
          headerExtra: () => <HeaderExtra />
        }}
      </PageLayout>
    )
  }
})
