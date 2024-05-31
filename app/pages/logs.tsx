import { type Ref, defineComponent, nextTick } from "vue"
import {
  NTag,
  NText,
  NVirtualList,
  NEllipsis,
  NDropdown,
  NInput,
  NIcon,
  NInputGroup,
  NSelect,
  useThemeVars,
  NButton,
  NTooltip,
  useLoadingBar,
  NEmpty
} from "naive-ui"
import { formatISO9075 } from "date-fns"
import PageLayout from "~/layout/PageLayout.tsx"
import {
  type LogEntry,
  type LogLevel,
  utilGetLogEntries
} from "~/helper/index.ts"
import { Renew, Search } from "@vicons/carbon"

type NTagType = "default" | "info" | "error" | "success" | "primary" | "warning"

function levelTag(level: LogLevel) {
  let tagType: NTagType = "default"
  switch (level) {
    case "Info":
      tagType = "success"
      break
    case "Warn":
      tagType = "warning"
      break
    case "Error":
      tagType = "error"
      break
  }
  const levelStr = level
  return (
    <NTag
      type={tagType}
      bordered={false}
      size="small"
      class="w-full flex justify-center"
    >
      {levelStr}
    </NTag>
  )
}

function logItem(
  item: LogEntry,
  handleContextMenu: (item: LogEntry) => (e: MouseEvent) => void
) {
  return (
    <div
      class="flex gap-2 min-h-7 w-full"
      onContextmenu={handleContextMenu(item)}
    >
      <NText class="flex w-4rem">{levelTag(item.level)}</NText>
      <NText class="flex">{formatISO9075(new Date(item.time))}</NText>
      <NEllipsis class="flex w-[calc(100%-1rem-4rem-10rem)]">
        <NText>{item.message}</NText>
      </NEllipsis>
    </div>
  )
}

function header(
  searchValue: Ref<string>,
  logTypeFilter: Ref<LogLevel[]>,
  refreshLogs: () => void
) {
  const theme = useThemeVars()
  return () => (
    <div class="flex flex-row grow-1">
      <div class="flex">
        <span
          class="flex text-size-xl fw-bold"
          style={{ color: theme.value.textColor1 }}
        >
          Logs
        </span>
      </div>
      <div class="flex ml-8 grow-1">
        <NInputGroup>
          <NInput
            placeholder="Search logs..."
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
          <NSelect
            multiple
            maxTagCount={2}
            value={logTypeFilter.value}
            options={[
              { label: "Error", value: "Error" },
              { label: "Warn", value: "Warn" },
              { label: "Info", value: "Info" },
              { label: "Debug", value: "Debug" },
              { label: "Trace", value: "Trace" }
            ]}
            onUpdate:value={(v: LogLevel[]) => (logTypeFilter.value = v)}
            renderTag={({ option }) => levelTag(option.value as LogLevel)}
            class="w-20rem"
          />
        </NInputGroup>
      </div>
      <div class="flex ml-3">
        <NTooltip trigger="hover" placement="bottom" keepAliveOnHover={false}>
          {{
            default: () => "Refresh logs",
            trigger: () => (
              <NButton
                text
                onClick={refreshLogs}
                renderIcon={() => <Renew />}
                class="flex"
              />
            )
          }}
        </NTooltip>
      </div>
    </div>
  )
}

export default defineComponent({
  setup() {
    const loadingBar = useLoadingBar()

    let logs = $ref<LogEntry[]>([])
    function refreshLogs() {
      loadingBar.start()
      utilGetLogEntries()
        .finally(() => loadingBar.finish())
        .then((list: LogEntry[]) => (logs = list))
    }
    refreshLogs()
    let logTypeFilter = $ref<LogLevel[]>(["Error", "Warn", "Info", "Debug"])
    let messageFilter = $ref("")
    let _logs = $computed(() => {
      return logs.filter(
        log =>
          logTypeFilter.includes(log.level) &&
          log.message.toLowerCase().includes(messageFilter.toLowerCase())
      )
    })

    let x = $ref(0)
    let y = $ref(0)
    let showContextMenu = $ref(false)
    let selectedLog = $ref<LogEntry | null>(null)
    function handleContextMenu(item: LogEntry) {
      return (e: MouseEvent) => {
        selectedLog = item
        e.preventDefault()

        showContextMenu = false
        nextTick().then(() => {
          showContextMenu = true
          x = e.clientX
          y = e.clientY
        })
      }
    }
    function handleContextMenuSelect(key: string) {
      if (selectedLog === null) return
      showContextMenu = false

      switch (key) {
        case "copy":
          navigator.clipboard.writeText(
            [
              new Date(selectedLog.time).toISOString(),
              `[${selectedLog.level}]`,
              selectedLog.target + ":",
              selectedLog.message
            ].join(" ")
          )
          break
        case "copy-message":
          navigator.clipboard.writeText(selectedLog.message)
          break
      }
    }

    return () => (
      <PageLayout noPadding>
        {{
          default: () => (
            <div class="h-[calc(100%-2rem)] p-1rem">
              <NDropdown
                placement="bottom-start"
                trigger="manual"
                size="small"
                show={showContextMenu}
                x={x}
                y={y}
                options={[
                  { label: "Copy", key: "copy" },
                  { label: "Copy message", key: "copy-message" }
                ]}
                onClickoutside={() => (showContextMenu = false)}
                onSelect={handleContextMenuSelect}
              />

              {_logs.length > 0 ? (
                <NVirtualList
                  itemSize={28}
                  itemResizable
                  items={_logs}
                  class="h-[calc(100vh-5rem)]"
                >
                  {({ item }: { item: LogEntry }) =>
                    logItem(item, handleContextMenu)
                  }
                </NVirtualList>
              ) : (
                <div class="h-full flex flex-col justify-center">
                  <NEmpty class="flex w-full">No logs found</NEmpty>
                </div>
              )}
            </div>
          ),
          header: header($$(messageFilter), $$(logTypeFilter), refreshLogs)
        }}
      </PageLayout>
    )
  }
})
