import { defineComponent, ref, computed, type Ref } from "vue"
import {
  type DataTableColumns,
  NEmpty,
  NIcon,
  NDataTable,
  NDropdown,
  NEllipsis,
  NButton,
  NButtonGroup,
  NTooltip,
  NEl,
  NInput,
  useThemeVars
} from "naive-ui"
import {
  StarFilled,
  Star,
  UserAvatarFilledAlt,
  EarthFilled,
  ChevronDown,
  UnknownFilled,
  OverflowMenuVertical,
  Renew,
  Search
} from "@vicons/carbon"
import { useRouter } from "vue-router"
import {
  type TauriProject,
  type TauriProjectType,
  environmentProjects,
  environmentSetFavoriteProject,
  distance2now,
  utilOpen
} from "~/helper/index.ts"
import PageLayout from "~/layout/PageLayout.tsx"
import OpenProject from "~/components/OpenProject.tsx"
import { useUnityStore } from "@/app/store/index.ts"

function TauriProjectType2ProjectType(t: TauriProjectType): string {
  switch (t) {
    case "Worlds":
    case "UpmWorlds":
    case "LegacyWorlds":
      return "World"
    case "Avatars":
    case "UpmAvatars":
    case "LegacyAvatars":
      return "Avatar"
    default:
      return t
  }
}
function loadProjects(projects: Ref<TauriProject[]>, loading: Ref<boolean>) {
  loading.value = true
  environmentProjects()
    .finally(() => (loading.value = false))
    .then(info => {
      const list = info.filter(p => !p.favorite)
      projects.value = info.filter(p => p.favorite).concat(list)
    })
}

function headerExtra() {
  const options = [{ label: "Add Existing Project", key: "add-existing" }]
  return () => (
    <div class="mr-2">
      <NButtonGroup size="small">
        <NButton type="primary">Create New Project</NButton>
        <NDropdown options={options} trigger="click">
          <NButton type="default" class="px-1">
            {{ icon: () => <ChevronDown /> }}
          </NButton>
        </NDropdown>
      </NButtonGroup>
    </div>
  )
}
function header(
  projects: Ref<TauriProject[]>,
  loading: Ref<boolean>,
  searchValue: Ref<string>
) {
  return () => (
    <div class="flex flex-row grow-1">
      <div class="flex">
        <NEl
          class="flex text-size-xl fw-bold"
          style={{ color: "var(--text-color-1)" }}
        >
          Projects
        </NEl>
      </div>
      <div class="flex mx-8 grow-1">
        <NTooltip trigger="hover" placement="bottom" keepAliveOnHover={false}>
          {{
            default: () => <>Refresh projects</>,
            trigger: () => (
              <NButton
                text
                onClick={() => loadProjects(projects, loading)}
                class="flex mr-3"
              >
                {{ icon: () => <Renew /> }}
              </NButton>
            )
          }}
        </NTooltip>
        <NInput
          placeholder="Search Projects..."
          size="small"
          clearable
          value={searchValue.value}
          onInput={v => (searchValue.value = v)}
        >
          {{
            prefix: () => (
              <NIcon>
                <Search />
              </NIcon>
            )
          }}
        </NInput>
      </div>
    </div>
  )
}

function favoriteRender(_projects: Ref<TauriProject[]>) {
  const projects = $(_projects)
  return (p: TauriProject, i: number) => (
    <div
      class="cursor-pointer h-8 flex flex-col justify-center items-center"
      onClick={() =>
        environmentSetFavoriteProject(
          p.list_version,
          p.index,
          !p.favorite
        ).then(() => (projects[i].favorite = !p.favorite))
      }
    >
      <NTooltip
        trigger="hover"
        placement="left"
        keepAliveOnHover={false}
        class="flex"
      >
        {{
          default: () => <>{p.favorite ? "Unfavorite" : "Favorite"}</>,
          trigger: () => (
            <NIcon size="20px" class="flex">
              {p.favorite ? <StarFilled /> : <Star />}
            </NIcon>
          )
        }}
      </NTooltip>
    </div>
  )
}
function nameRender() {
  const theme = useThemeVars()
  return (p: TauriProject) => (
    <>
      <div class="text-size-4 font-bold">{p.name}</div>
      <NEllipsis class="text-size-3" style={{ color: theme.value.textColor3 }}>
        {p.path}
      </NEllipsis>
    </>
  )
}
function projectTypeRender() {
  return (p: TauriProject) => {
    const projectType = TauriProjectType2ProjectType(p.project_type)
    const projectTypeStr = projectType
    const isLegacy = p.project_type.startsWith("Upm")
    return (
      <div class="h-5 text-size-4 flex flex-col justify-center">
        <div class="flex items-center">
          <NIcon size="23px" class="pr-1.5">
            {(() => {
              if (projectType === "Avatar") return <UserAvatarFilledAlt />
              else if (projectType === "World") return <EarthFilled />
              else return <UnknownFilled />
            })()}
          </NIcon>
          <div class="flex flex-col">
            <div>{projectTypeStr}</div>
            {isLegacy && (
              <NEl
                class="text-size-3"
                style={{ color: "var(--error-color-hover)" }}
              >
                Legacy
              </NEl>
            )}
          </div>
        </div>
      </div>
    )
  }
}
function actionsRender() {
  const router = useRouter()
  const unityStore = useUnityStore()

  return (p: TauriProject) => {
    const unityPath = computed(
      () => unityStore.unityVersions.find(v => v.version === p.unity)?.path
    )

    const options = [
      { label: "Open project folder", key: "openFolder" },
      { label: "Create backup", key: "backup" },
      { key: "divider", type: "divider" },
      {
        label: () => (
          <NEl style={{ color: "var(--error-color)" }}>Remove from List</NEl>
        ),
        key: "remove"
      },
      {
        label: () => (
          <NEl style={{ color: "var(--error-color)" }}>Delete from Disk</NEl>
        ),
        key: "delete"
      }
    ]
    const manageDisabled =
      p.project_type === "UpmAvatars" ||
      p.project_type === "UpmWorlds" ||
      p.project_type === "Unknown"
    function handleSelect(key: string) {
      switch (key) {
        case "openFolder":
          utilOpen(p.path)
          break
        default:
          console.log("Action", key, "not implemented")
          break
      }
    }
    function projectManage() {
      router.push({
        name: "projects-manage",
        query: { path: p.path, unityVersion: p.unity, name: p.name }
      })
    }
    return (
      <NButtonGroup>
        <OpenProject path={p.path} unityPath={unityPath.value} name={p.name} />
        <NButton disabled={manageDisabled} onClick={projectManage}>
          Manage
        </NButton>
        <NDropdown options={options} trigger="click" onSelect={handleSelect}>
          <NButton type="default" class="px-1">
            {{ icon: () => <OverflowMenuVertical /> }}
          </NButton>
        </NDropdown>
      </NButtonGroup>
    )
  }
}

function createTableColumns(
  _projects: Ref<TauriProject[]>
): DataTableColumns<TauriProject> {
  return [
    {
      key: "favorite",
      width: "3rem",
      render: favoriteRender(_projects)
    },
    {
      title: "Name",
      key: "name",
      ellipsis: true,
      sorter: (a, b) => (b.favorite ? 0 : a.name.localeCompare(b.name)),
      render: nameRender()
    },
    {
      title: "Type",
      key: "project_type",
      width: "8rem",
      sorter: (a, b) =>
        b.favorite ? 0 : a.project_type.localeCompare(b.project_type),
      render: projectTypeRender()
    },
    {
      title: "Unity",
      key: "unity",
      width: "7rem",
      sorter: (a, b) => (b.favorite ? 0 : a.unity.localeCompare(b.unity)),
      render: p => p.unity
    },
    {
      title: "Last Modified",
      key: "last_modified",
      width: "10rem",
      sorter: (a, b) => (b.favorite ? 0 : a.last_modified - b.last_modified),
      render: p => distance2now(new Date(p.last_modified))
    },
    {
      key: "actions",
      width: "16rem",
      render: actionsRender()
    }
  ]
}

export default defineComponent({
  setup() {
    const loading = ref(true)
    const projects = ref<TauriProject[]>([])
    loadProjects(projects, loading)
    const searchValue = ref("")
    const tableColumns = createTableColumns(projects)
    // 过滤完毕的项目
    const filteredProjects = computed(() =>
      !searchValue.value || searchValue.value === ""
        ? projects.value
        : projects.value.filter(p =>
            p.name.toLowerCase().includes(searchValue.value.toLowerCase())
          )
    )

    return () => (
      <PageLayout>
        {{
          default: () => (
            <NDataTable
              size="small"
              class="min-w-57rem"
              maxHeight="calc(100vh - 7.6rem)"
              columns={tableColumns}
              data={filteredProjects.value}
              loading={loading.value}
            >
              {{ empty: () => <NEmpty>No projects found</NEmpty> }}
            </NDataTable>
          ),
          header: header(projects, loading, searchValue),
          headerExtra: headerExtra()
        }}
      </PageLayout>
    )
  }
})
