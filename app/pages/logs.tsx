import { defineComponent, nextTick } from "vue"
import { NTag, NText, NVirtualList, NEllipsis, NDropdown } from "naive-ui"
import { formatISO9075 } from "date-fns"
import PageLayout from "~/layout/PageLayout.tsx"
import { type LogEntry, utilGetLogEntries } from "~/helper/index.ts"

type NTagType = "default" | "info" | "error" | "success" | "primary" | "warning"

function levelTag(level: string) {
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

export default defineComponent({
  setup() {
    let logs = $ref<LogEntry[]>([])
    utilGetLogEntries().then((list: LogEntry[]) => (logs = list))

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
      <PageLayout title="Logs">
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

        <NVirtualList
          itemSize={28}
          itemResizable
          items={logs}
          class="h-[calc(100vh-5rem)]"
        >
          {({ item }: { item: LogEntry }) => logItem(item, handleContextMenu)}
        </NVirtualList>
      </PageLayout>
    )
  }
})
